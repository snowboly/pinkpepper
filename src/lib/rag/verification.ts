import { isAuthoritativeSourceClass, type SourceClass } from "./source-taxonomy";

export type VerificationState = "verified" | "partial" | "unverified";

export function getVerificationState(
  chunks: Array<{ source_class?: SourceClass | string }>
): VerificationState {
  if (chunks.some((chunk) => isAuthoritativeSourceClass(chunk.source_class as SourceClass))) {
    return "verified";
  }

  if (chunks.length > 0) {
    return "partial";
  }

  return "unverified";
}
