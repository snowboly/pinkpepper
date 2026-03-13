import type { SubscriptionTier } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";

export type PersonaInfo = {
  id: string;
  name: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  documentName?: string;
  citations?: Citation[];
  isStreaming?: boolean;
  persona?: PersonaInfo;
};

export type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
  created_at?: string;
  project_id?: string | null;
  archived_at?: string | null;
};

export type Project = {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
  updated_at: string;
};

export type ChatWorkspaceProps = {
  userEmail: string;
  initialTier: SubscriptionTier;
  initialUsage: number;
  usageLimit: number;
  dailyImageUploads: number;
  canExportPdf: boolean;
  canExportWord: boolean;
  canReview: boolean;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
};
