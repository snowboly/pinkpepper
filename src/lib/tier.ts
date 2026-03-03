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
  advancedTemplates: boolean;
  priorityProcessing: boolean;
  monthlyHumanReviews: number;
  reviewTurnaround: string;
};

export const TIER_CAPABILITIES: Record<SubscriptionTier, TierCapabilities> = {
  free: {
    dailyMessages: 15,
    dailyDocumentGenerations: 1,
    dailyImageUploads: 0,
    maxSavedConversations: 10,
    conversationRetentionDays: 30,
    storageLimitBytes: 50 * 1024 * 1024,
    persistentStorage: false,
    allowPdfExport: false,
    allowWordExport: false,
    advancedTemplates: false,
    priorityProcessing: false,
    monthlyHumanReviews: 0,
    reviewTurnaround: "N/A",
  },
  plus: {
    dailyMessages: 80,
    dailyDocumentGenerations: 4,
    dailyImageUploads: 3,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    storageLimitBytes: 200 * 1024 * 1024,
    persistentStorage: true,
    allowPdfExport: true,
    allowWordExport: false,
    advancedTemplates: false,
    priorityProcessing: false,
    monthlyHumanReviews: 2,
    reviewTurnaround: "within 48 hours",
  },
  pro: {
    dailyMessages: 250,
    dailyDocumentGenerations: 10,
    dailyImageUploads: 10,
    maxSavedConversations: null,
    conversationRetentionDays: null,
    storageLimitBytes: 500 * 1024 * 1024,
    persistentStorage: true,
    allowPdfExport: true,
    allowWordExport: true,
    advancedTemplates: true,
    priorityProcessing: true,
    monthlyHumanReviews: 10,
    reviewTurnaround: "within 24 hours",
  },
};

export function normalizeTier(input: string | null | undefined): SubscriptionTier {
  if (input === "plus" || input === "pro") return input;
  return "free";
}
