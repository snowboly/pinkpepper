import {
  inferSourceClass,
  isAuthoritativeSourceClass,
  type SourceClass,
} from "./source-taxonomy";

export type VerificationState = "verified" | "partial" | "unverified";

type VerificationContext = {
  mode?: "qa" | "document" | "audit";
  userMessage?: string;
};

const CERTIFICATION_STANDARD_PATTERN =
  /\b(brcgs|sqf|ifs|fssc\s*22000|salsa|iso\s*22000|certification|certified|standard audit)\b/i;

function isCertificationStandardQuestion(context?: VerificationContext) {
  if (!context?.userMessage) {
    return false;
  }

  if (context.mode === "document") {
    return false;
  }

  return CERTIFICATION_STANDARD_PATTERN.test(context.userMessage);
}

export function getVerificationState(
  chunks: Array<{
    source_class?: SourceClass | string;
    source_type?: string;
    source_name?: string;
    jurisdiction?: string;
  }>,
  context?: VerificationContext
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

  if (isCertificationStandardQuestion(context)) {
    return "partial";
  }

  return "unverified";
}
