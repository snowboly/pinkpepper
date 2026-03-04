export type SubscriptionTier = "free" | "plus" | "pro";

export type TierCapabilities = {
  dailyMessages: number;
  dailyDocumentGenerations: number;
  dailyImageUploads: number;
  maxSavedConversations: number | null;
  conversationRetentionDays: number | null;
  storageLimitBytes: number;
  persistentStorage: boolean;
  allowPdfExport: boolean;
  allowWordExport: boolean;
  allowFullDocumentReview: boolean;
  priorityProcessing: boolean;
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
    storageLimitBytes: 50 * 1024 * 1024,
    persistentStorage: false,
    allowPdfExport: false,
    allowWordExport: false,
    allowFullDocumentReview: false,
    priorityProcessing: false,
    monthlyHumanReviews: 0,
    reviewTurnaround: "N/A",
  },
  plus: {
    dailyMessages: 100,
    dailyDocumentGenerations: 3,
    dailyImageUploads: 3,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    storageLimitBytes: 500 * 1024 * 1024,
    persistentStorage: true,
    allowPdfExport: true,
    allowWordExport: false,
    allowFullDocumentReview: false,
    priorityProcessing: false,
    monthlyHumanReviews: 1,
    reviewTurnaround: "within 48 hours",
  },
  pro: {
    dailyMessages: 1000,
    dailyDocumentGenerations: 20,
    dailyImageUploads: 20,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    storageLimitBytes: 5 * 1024 * 1024 * 1024,
    persistentStorage: true,
    allowPdfExport: true,
    allowWordExport: true,
    allowFullDocumentReview: true,
    priorityProcessing: true,
    monthlyHumanReviews: 6,
    reviewTurnaround: "within 24 hours",
  },
};

export function normalizeTier(input: string | null | undefined): SubscriptionTier {
  if (input === "plus" || input === "pro") return input;
  return "free";
}
