import type { Message } from "./types";

type ApplyStreamErrorInput = {
  messages: Message[];
  promptValue: string;
  errorMessage?: string;
};

type ApplyStreamErrorResult = {
  messages: Message[];
  prompt: string;
  error: string;
};

export function applyStreamError(input: ApplyStreamErrorInput): ApplyStreamErrorResult {
  const error = input.errorMessage?.trim() || "Stream interrupted";
  const messages = [...input.messages];
  const last = messages[messages.length - 1];

  if (last?.isStreaming) {
    messages[messages.length - 1] = {
      ...last,
      isStreaming: false,
    };
  }

  return {
    messages,
    prompt: input.promptValue,
    error,
  };
}
