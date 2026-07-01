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

type VerificationChunk = {
  source_class?: SourceClass | string;
  source_type?: string;
  source_name?: string;
  jurisdiction?: string;
  source_key?: string;
  version_key?: string;
  official_url?: string;
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
  chunks: VerificationChunk[],
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

      if (!isAuthoritativeSourceClass(inferredSourceClass)) {
        return false;
      }

      if (inferredSourceClass === "primary_law") {
        return Boolean(chunk.source_key && chunk.version_key && chunk.official_url);
      }

      return Boolean(chunk.official_url);
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
