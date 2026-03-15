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
});

describe("chat workspace chrome", () => {
  it("does not render the removed top mode banner block", () => {
    const content = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

    expect(content).not.toContain("const modeBadgeClass =");
    expect(content).not.toContain("{modeLabel}");
    expect(content).not.toContain("{modeDescription}");
  });
});
