import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseMessageArtifact,
  parseMessageCitations,
} from "@/components/dashboard/chat-message-metadata";

const ROOT = process.cwd();

function readWorkspaceFile(relativePath: string) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("chatbot metadata parsing", () => {
  it("parses saved citations from message metadata", () => {
    const citations = parseMessageCitations({
      citations: [
        {
          id: "chunk-1",
          title: "EC 852/2004, Annex II, Chapter IX",
          excerpt: "Keep chilled food cold.",
          sourceType: "regulation",
          sourceName: "EC 852/2004",
          sectionRef: "Annex II, Chapter IX",
          similarity: 0.92,
        },
      ],
    });

    expect(citations).toEqual([
      {
        id: "chunk-1",
        title: "EC 852/2004, Annex II, Chapter IX",
        excerpt: "Keep chilled food cold.",
        sourceType: "regulation",
        sourceName: "EC 852/2004",
        sectionRef: "Annex II, Chapter IX",
        similarity: 0.92,
      },
    ]);
  });

  it("parses saved document artifacts from message metadata", () => {
    const artifact = parseMessageArtifact({
      artifact: {
        id: "doc-1",
        kind: "document",
        title: "Chilled Foods SOP",
        summary: "Ready for review",
        status: "ready",
        documentType: "sop",
        documentNumber: "SOP-001",
      },
    });

    expect(artifact).toEqual({
      id: "doc-1",
      kind: "document",
      title: "Chilled Foods SOP",
      summary: "Ready for review",
      status: "ready",
      documentType: "sop",
      documentNumber: "SOP-001",
    });
  });
});

describe("chatbot source encoding", () => {
  it("does not ship known mojibake fragments in chatbot files", () => {
    const files = [
      "src/app/api/chat/stream/route.ts",
      "src/components/dashboard/ChatWorkspace.tsx",
      "src/components/dashboard/ChatSidebar.tsx",
      "src/components/dashboard/MessageItem.tsx",
    ];

    const badFragments = ["cafÃ©", "âœ…", "Â·", "ðŸ"];

    for (const file of files) {
      const content = readWorkspaceFile(file);
      for (const fragment of badFragments) {
        expect(content, `${file} should not contain ${fragment}`).not.toContain(fragment);
      }
    }
  });

  it("keeps the new template assets free of common mojibake markers", () => {
    const files = [
      "knowledge-docs/templates/HACCP-plan-template.md",
      "knowledge-docs/templates/allergen-declaration-form-template.md",
    ];

    const badFragments = ["â˜", "â†“", "â‰¤", "â‰¥", "Ã—", "â€”"];

    for (const file of files) {
      const content = readWorkspaceFile(file);
      for (const fragment of badFragments) {
        expect(content, `${file} should not contain ${fragment}`).not.toContain(fragment);
      }
    }
  });
});

describe("chat workspace chrome", () => {
  it("does not render the removed top mode banner block", () => {
    const content = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(content).not.toContain("const modeBadgeClass =");
    expect(content).not.toContain("{modeLabel}");
    expect(content).not.toContain("{modeDescription}");
  });

  it("does not wire the removed expert button or duplicate bottom tier badge", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");
    const sidebar = readWorkspaceFile("src/components/dashboard/ChatSidebar.tsx");

    expect(workspace).not.toContain("onAskExpert={() =>");
    expect(workspace).not.toContain('{isAdmin ? "Admin" : tier}');
    expect(sidebar).not.toContain("onAskExpert?: () => void;");
    expect(sidebar).not.toContain("t(\"expertReviews\")");
  });

  it("does not render artifact, evidence, or promo card surfaces", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");
    const messages = readWorkspaceFile("src/components/dashboard/ChatMessages.tsx");
    const messageItem = readWorkspaceFile("src/components/dashboard/MessageItem.tsx");

    expect(workspace).not.toContain("Reusable outputs generated in this conversation.");
    expect(workspace).not.toContain("Artifacts");
    expect(messageItem).not.toContain("Evidence and next steps");
    expect(messageItem).not.toContain("View evidence");
    expect(messageItem).not.toContain("Saved artifact");
    expect(messages).not.toContain("Premium Workflows");
    expect(messages).not.toContain("Request expert review");
    expect(messages).not.toContain("humanReviewHighlight");
  });

  it("moves real downloadable templates into the sidebar and removes the empty-state dropdown", () => {
    const messages = readWorkspaceFile("src/components/dashboard/ChatMessages.tsx");
    const sidebar = readWorkspaceFile("src/components/dashboard/ChatSidebar.tsx");

    expect(messages).not.toContain('category: "template_download"');
    expect(messages).not.toContain('category: "document"');
    expect(messages).not.toContain('t("downloadTemplates")');

    expect(sidebar).toContain("getGroupedTemplates");
    expect(sidebar).toContain('onTemplateDownload: (slug: string) => void;');
    expect(sidebar).toContain('onTemplateUpgrade: () => void;');
    expect(sidebar).toContain('tc("downloadTemplates")');
  });

  it("removes document builder state and route calls from the workspace", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(workspace).not.toContain("buildDocumentGenerationPayload");
    expect(workspace).not.toContain("getLightweightDocWizards");
    expect(workspace).not.toContain("AdvancedDocumentBuilderModal");
    expect(workspace).not.toContain('fetch("/api/documents/generate"');
    expect(workspace).toContain("const handleTemplateDownload = useCallback((slug: string) =>");
    expect(workspace).toContain('setUpgradeModalTrigger("template_download")');
    expect(workspace).toContain('fetch(`/api/templates/${slug}/download`');
  });

  it("removes the lightweight wizard flow entirely", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(workspace).not.toContain('["cancel", "/cancel", "stop"]');
    expect(workspace).not.toContain("wizardCancelled");
    expect(workspace).not.toContain("wizardGenerating");
  });

  it("keeps workspace shell strings localized and removes stale review prop wiring", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");
    const messages = readWorkspaceFile("src/components/dashboard/ChatMessages.tsx");
    const input = readWorkspaceFile("src/components/dashboard/ChatInput.tsx");
    const sidebar = readWorkspaceFile("src/components/dashboard/ChatSidebar.tsx");
    const reviewModal = readWorkspaceFile("src/components/dashboard/ReviewModal.tsx");

    expect(workspace).not.toContain("Send for Review");

    expect(messages).not.toContain("reviewEligible:");
    expect(messages).not.toContain("tier:");
    expect(messages).not.toContain("isAdmin:");
    expect(messages).not.toContain("onRequestReview:");
    expect(messages).not.toContain("onUpgradeForReview");

    expect(input).not.toContain('alt="Attached"');
    expect(input).not.toContain('aria-label="Open attachment tools"');

    expect(sidebar).not.toContain("View plans");

    expect(reviewModal).not.toContain("reviewTurnaround?: string;");
  });

  it("does not keep builder implementation references after templates-only cleanup", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(workspace).not.toContain("document-builders/");
    expect(workspace).not.toContain("document_generation_requested");
    expect(workspace).not.toContain("setActiveDocWizard");
    expect(workspace).not.toContain("setActiveAdvancedBuilder");
  });

  it("removes web voice transcription controls and upgrade hooks", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");
    const input = readWorkspaceFile("src/components/dashboard/ChatInput.tsx");
    const upgradeModal = readWorkspaceFile("src/components/dashboard/UpgradeModal.tsx");

    expect(workspace).not.toContain("useAudioRecording");
    expect(workspace).not.toContain('setUpgradeModalTrigger("transcription_limit")');
    expect(input).not.toContain('t("startRecording")');
    expect(input).not.toContain('t("stopRecording")');
    expect(input).not.toContain('t("transcribing")');
    expect(upgradeModal).not.toContain("transcription_limit");
    expect(upgradeModal).not.toContain("Unlock voice transcription");
  });

  it("keeps chat export on a single DOCX path", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(workspace).toContain('fetch("/api/export/docx"');
    expect(workspace).toContain('exportConversation")} (DOCX)`');
    expect(workspace).not.toContain('void exportDocument("pdf")');
    expect(workspace).not.toContain('{tw("pdf")}');
  });

  it("keeps first-turn document uploads scoped to a single conversation", () => {
    const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");
    const uploadRoute = readWorkspaceFile("src/app/api/documents/upload/route.ts");

    expect(workspace).toContain("let activeConversationId = conversationId;");
    expect(workspace).toContain('fd.append("draftTitle"');
    expect(workspace).toContain("activeConversationId = data.conversationId;");
    expect(workspace).toContain("body: JSON.stringify({ message: value, conversationId: activeConversationId })");

    expect(uploadRoute).toContain('.eq("conversation_id", effectiveConversationId)');
    expect(uploadRoute).toContain('.is("conversation_id", null)');
    expect(uploadRoute).toContain("conversationId: effectiveConversationId");
  });
});
