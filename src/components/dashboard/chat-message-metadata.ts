import type { Citation } from "@/lib/rag/citations";
import type { VerificationState } from "@/lib/rag/verification";
import type { Message, PersonaInfo } from "./types";

export function parseMessageArtifact(value: unknown): Message["artifact"] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const artifact = (value as { artifact?: unknown }).artifact;
  if (!artifact || typeof artifact !== "object") {
    return undefined;
  }

  const candidate = artifact as Record<string, unknown>;
  if (
    candidate.kind !== "document" ||
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    (candidate.status !== "draft" && candidate.status !== "ready")
  ) {
    return undefined;
  }

  return {
    id: candidate.id,
    kind: "document",
    title: candidate.title,
    summary: typeof candidate.summary === "string" ? candidate.summary : undefined,
    status: candidate.status,
    documentType: typeof candidate.documentType === "string" ? candidate.documentType : undefined,
    documentNumber: typeof candidate.documentNumber === "string" ? candidate.documentNumber : undefined,
  };
}

export function parseMessageCitations(value: unknown): Citation[] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const citations = (value as { citations?: unknown }).citations;
  if (!Array.isArray(citations)) {
    return undefined;
  }

  const parsed = citations.filter((citation): citation is Citation => {
    if (!citation || typeof citation !== "object") {
      return false;
    }

    const candidate = citation as Record<string, unknown>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.excerpt === "string" &&
      typeof candidate.sourceType === "string" &&
      typeof candidate.sourceName === "string" &&
      (typeof candidate.sectionRef === "string" || candidate.sectionRef === null) &&
      typeof candidate.similarity === "number"
    );
  });

  return parsed.length > 0 ? parsed : undefined;
}

export function parseMessageVerificationState(value: unknown): VerificationState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const verificationState = (value as { verificationState?: unknown }).verificationState;
  if (
    verificationState === "verified" ||
    verificationState === "partial" ||
    verificationState === "unverified"
  ) {
    return verificationState;
  }

  return null;
}

export function parseMessageUserDocumentNames(value: unknown): string[] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const names = (value as { userDocumentNames?: unknown }).userDocumentNames;
  if (!Array.isArray(names)) {
    return undefined;
  }

  const strings = names.filter((n): n is string => typeof n === "string");
  return strings.length > 0 ? strings : undefined;
}

export function parseMessagePersona(value: unknown): PersonaInfo | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const persona = (value as { persona?: unknown }).persona;
  if (!persona || typeof persona !== "object") {
    return undefined;
  }

  const candidate = persona as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.avatar !== "string"
  ) {
    return undefined;
  }

  return {
    id: candidate.id,
    name: candidate.name,
    avatar: candidate.avatar,
  };
}

export function formatVerificationLabel(state: VerificationState): string {
  switch (state) {
    case "verified":
      return "Verified";
    case "partial":
      return "Partially verified";
    case "unverified":
      return "Not verified";
  }
}

export function getVerificationBadgeClassName(state: VerificationState): string {
  switch (state) {
    case "verified":
      return "border-[#059669] bg-[#ECFDF5] text-[#047857]";
    case "partial":
      return "border-[#D97706] bg-[#FFFBEB] text-[#92400E]";
    case "unverified":
      return "border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]";
  }
}
