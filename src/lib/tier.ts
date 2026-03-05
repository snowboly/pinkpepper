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
};

export const TIER_CAPABILITIES: Record<SubscriptionTier, TierCapabilities> = {
  free: {
    dailyMessages: 25,
    dailyDocumentGenerations: 0,
    dailyImageUploads: 1,
    maxSavedConversations: 10,
    conversationRetentionDays: 30,
    allowPdfExport: false,
    allowWordExport: false,
    allowFullDocumentReview: false,
    monthlyHumanReviews: 0,
    reviewTurnaround: "N/A",
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
  },
};

export function normalizeTier(input: string | null | undefined): SubscriptionTier {
  if (input === "plus" || input === "pro") return input;
  return "free";
}
