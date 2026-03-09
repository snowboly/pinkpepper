export type SubscriptionTier = "free" | "plus" | "pro";

export type TierCapabilities = {
  dailyMessages: number;
  dailyDocumentGenerations: number;
  dailyImageUploads: number;
  maxSavedConversations: number | null;
  conversationRetentionDays: number | null;
  allowPdfExport: boolean;
  allowWordExport: boolean;
  allowFullDocumentReview: boolean;
  monthlyHumanReviews: number;
  reviewTurnaround: string;
  /** Max tokens for LLM response */
  maxResponseTokens: number;
};

export const TIER_CAPABILITIES: Record<SubscriptionTier, TierCapabilities> = {
  free: {
    dailyMessages: 15,
    dailyDocumentGenerations: 0,
    dailyImageUploads: 1,
    maxSavedConversations: 10,
    conversationRetentionDays: 30,
    allowPdfExport: false,
    allowWordExport: false,
    allowFullDocumentReview: false,
    monthlyHumanReviews: 0,
    reviewTurnaround: "N/A",
    maxResponseTokens: 2048,
  },
  plus: {
    dailyMessages: 100,
    dailyDocumentGenerations: 3,
    dailyImageUploads: 3,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    allowPdfExport: true,
    allowWordExport: false,
    allowFullDocumentReview: false,
    monthlyHumanReviews: 0,
    reviewTurnaround: "N/A",
    maxResponseTokens: 4096,
  },
  pro: {
    dailyMessages: 1000,
    dailyDocumentGenerations: 20,
    dailyImageUploads: 20,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    allowPdfExport: true,
    allowWordExport: true,
    allowFullDocumentReview: true,
    monthlyHumanReviews: 3,
    reviewTurnaround: "3–5 working days",
    maxResponseTokens: 8192,
  },
};

export function normalizeTier(input: string | null | undefined): SubscriptionTier {
  if (input === "plus" || input === "pro") return input;
  return "free";
}
