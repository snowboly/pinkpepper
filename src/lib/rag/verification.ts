import {
  inferSourceClass,
  isAuthoritativeSourceClass,
  type SourceClass,
} from "./source-taxonomy";

export type VerificationState = "verified" | "partial" | "unverified";

export function getVerificationState(
  chunks: Array<{
    source_class?: SourceClass | string;
    source_type?: string;
    source_name?: string;
    jurisdiction?: string;
  }>
): VerificationState {
  if (
    chunks.some((chunk) => {
      const inferredSourceClass =
        typeof chunk.source_class === "string"
          ? (chunk.source_class as SourceClass)
          : inferSourceClass(
              [chunk.source_type, chunk.source_name].filter(Boolean).join(" ")
            );

      return isAuthoritativeSourceClass(inferredSourceClass);
    })
  ) {
    return "verified";
  }

  if (chunks.length > 0) {
    return "partial";
  }

  return "unverified";
}
