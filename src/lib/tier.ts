export type SubscriptionTier = "free" | "plus" | "pro";

export type TierCapabilities = {
  dailyMessages: number;
  dailyImageUploads: number;
  dailyTranscriptions: number;
  maxSavedConversations: number | null;
  conversationRetentionDays: number | null;
  allowPdfExport: boolean;
  allowWordExport: boolean;
  allowFullDocumentReview: boolean;
  hasConsultancy: boolean;
  monthlyConsultancyRequests: number;
  reviewTurnaround: string;
  /** Max tokens for LLM response */
  maxResponseTokens: number;
};

export const TIER_CAPABILITIES: Record<SubscriptionTier, TierCapabilities> = {
  free: {
    dailyMessages: 15,
    dailyImageUploads: 3,
    dailyTranscriptions: 3,
    maxSavedConversations: 10,
    conversationRetentionDays: 30,
    allowPdfExport: false,
    allowWordExport: false,
    allowFullDocumentReview: false,
    hasConsultancy: false,
    monthlyConsultancyRequests: 0,
    reviewTurnaround: "N/A",
    maxResponseTokens: 2048,
  },
  plus: {
    dailyMessages: 100,
    dailyImageUploads: 10,
    dailyTranscriptions: 25,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    allowPdfExport: false,
    allowWordExport: false,
    allowFullDocumentReview: false,
    hasConsultancy: false,
    monthlyConsultancyRequests: 0,
    reviewTurnaround: "N/A",
    maxResponseTokens: 4096,
  },
  pro: {
    dailyMessages: 1000,
    dailyImageUploads: 50,
    dailyTranscriptions: 200,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    allowPdfExport: false,
    allowWordExport: true,
    allowFullDocumentReview: true,
    hasConsultancy: true,
    monthlyConsultancyRequests: 3,
    reviewTurnaround: "within 5 working days",
    maxResponseTokens: 8192,
  },
};

export function normalizeTier(input: string | null | undefined): SubscriptionTier {
  if (input === "plus" || input === "pro") return input;
  return "free";
}
