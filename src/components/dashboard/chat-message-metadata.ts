import type { Citation } from "@/lib/rag/citations";
import type { Message } from "./types";

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
