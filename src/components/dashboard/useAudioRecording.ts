"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

const ALLOWED_TRANSCRIPTION_MIME_TYPES = new Set(["audio/webm", "audio/mp4", "audio/wav"]);

function normalizeRecordedMimeType(mimeType: string | undefined) {
  let normalized = (mimeType ?? "").split(";")[0]?.trim().toLowerCase();
  if (normalized === "audio/x-wav") normalized = "audio/wav";
  if (normalized === "audio/m4a") normalized = "audio/mp4";
  if (ALLOWED_TRANSCRIPTION_MIME_TYPES.has(normalized)) {
    return normalized;
  }
  return "audio/webm";
}

type UseAudioRecordingOptions = {
  loading: boolean;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  sendPromptValue: (promptValue: string) => Promise<void>;
  onTranscriptionLimit: () => void;
  t: (key: string) => string;
};

export function useAudioRecording({
  loading,
  setPrompt,
  sendPromptValue,
  onTranscriptionLimit,
  t,
}: UseAudioRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const retryableTranscriptionRef = useRef<{ blob: Blob; durationMs: number; retries: number } | null>(null);

  const trackTelemetry = useCallback((eventName: string, payload: Record<string, string | number | boolean>) => {
    try {
      track(eventName, payload);
    } catch {
      // Best-effort telemetry only.
    }
  }, []);

  const cleanupRecordingStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    recordingStartedAtRef.current = null;
  }, []);

  const transcribeAudioBlob = useCallback(async (audioBlob: Blob, durationMs: number, retryCount = 0) => {
    setIsTranscribing(true);
    setRecordingError(null);
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      const normalizedMimeType = normalizeRecordedMimeType(audioBlob.type);
      const extension = normalizedMimeType === "audio/mp4" ? "mp4" : normalizedMimeType === "audio/wav" ? "wav" : "webm";
      const audioFile = new File([audioBlob], `recording.${extension}`, { type: normalizedMimeType });
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("durationMs", String(durationMs));
      formData.append("language", navigator.language || "en");

      const res = await fetch("/api/chat/transcribe", { method: "POST", body: formData });
      const data = (await res.json()) as { text?: string; error?: { message?: string } };
      if (!res.ok) {
        if (res.status === 402) {
          onTranscriptionLimit();
        }
        throw new Error(data.error?.message ?? t("transcriptionError"));
      }

      const transcript = (data.text ?? "").trim();
      if (!transcript) {
        throw new Error(t("transcriptionEmptyError"));
      }

      let promptToSend = "";
      setPrompt((prev) => {
        const trimmed = prev.trimEnd();
        promptToSend = trimmed ? `${trimmed} ${transcript}` : transcript;
        return promptToSend;
      });
      setRecordingError(null);
      retryableTranscriptionRef.current = null;

      const latencyMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
      trackTelemetry("chat_transcription_success", { latencyMs, durationMs, retryCount });

      await sendPromptValue(promptToSend);
    } catch {
      const latencyMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
      retryableTranscriptionRef.current = { blob: audioBlob, durationMs, retries: retryCount };
      setRecordingError(t("transcriptionError"));
      trackTelemetry("chat_transcription_failure", { latencyMs, durationMs, retryCount });
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscriptionLimit, sendPromptValue, setPrompt, t, trackTelemetry]);

  const retryTranscription = useCallback(() => {
    const retry = retryableTranscriptionRef.current;
    if (!retry || isRecording || isTranscribing) return;
    void transcribeAudioBlob(retry.blob, retry.durationMs, retry.retries + 1);
  }, [isRecording, isTranscribing, transcribeAudioBlob]);

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing || loading) return;
    if (retryableTranscriptionRef.current) {
      retryTranscription();
      return;
    }
    setRecordingError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError(t("recordingUnsupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"].find((candidate) =>
        MediaRecorder.isTypeSupported(candidate)
      );
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        const firstChunkType = chunks[0]?.type;
        const blobType = normalizeRecordedMimeType(recorder.mimeType || firstChunkType);
        const blob = new Blob(chunks, { type: blobType });
        const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;
        cleanupRecordingStream();
        if (blob.size > 0) {
          void transcribeAudioBlob(blob, durationMs);
        } else {
          setRecordingError(t("transcriptionEmptyError"));
        }
      };

      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start();
      setIsRecording(true);
    } catch {
      cleanupRecordingStream();
      setRecordingError(t("recordingPermissionError"));
    }
  }, [cleanupRecordingStream, isRecording, isTranscribing, loading, retryTranscription, t, transcribeAudioBlob]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    setIsRecording(false);
    recorder.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }
    setIsRecording(false);
    setRecordingError(null);
    cleanupRecordingStream();
  }, [cleanupRecordingStream]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === "recording") {
        recorder.onstop = null;
        recorder.stop();
      }
      cleanupRecordingStream();
    };
  }, [cleanupRecordingStream]);

  return {
    isRecording,
    isTranscribing,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
