import type { SubscriptionTier } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";
import type { VerificationState } from "@/lib/rag/verification";

export type PersonaInfo = {
  id: string;
  name: string;
  avatar: string;
};

export type MessageArtifact = {
  id: string;
  kind: "document";
  title: string;
  summary?: string;
  status: "draft" | "ready";
  documentType?: string;
  documentNumber?: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  documentName?: string;
  citations?: Citation[];
  verificationState?: VerificationState | null;
  isStreaming?: boolean;
  persona?: PersonaInfo;
  artifact?: MessageArtifact;
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
  initialExpertUsage: number;
  expertUsageLimit: number;
  dailyImageUploads: number;
  canExportPdf: boolean;
  canExportWord: boolean;
  canReview: boolean;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
};
