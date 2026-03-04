import type { SubscriptionTier } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";

export type Message = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  citations?: Citation[];
  isStreaming?: boolean;
};

export type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
  created_at?: string;
};

export type ChatWorkspaceProps = {
  userEmail: string;
  initialTier: SubscriptionTier;
  initialUsage: number;
  usageLimit: number;
  dailyImageUploads: number;
  canExportPdf: boolean;
  canExportWord: boolean;
  isAdmin?: boolean;
};
