"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Scale, BookOpen, Award, Lightbulb } from "lucide-react";
import type { Citation } from "@/lib/rag/citations";

type Props = {
  citation: Citation;
  defaultExpanded?: boolean;
};

const sourceTypeIcons: Record<string, typeof FileText> = {
  regulation: Scale,
  guidance: BookOpen,
  template: FileText,
  certification: Award,
  best_practice: Lightbulb,
};

const sourceTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  regulation: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  guidance: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  template: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  certification: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  best_practice: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function SourceCard({ citation, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const Icon = sourceTypeIcons[citation.sourceType] || FileText;
  const colors = sourceTypeColors[citation.sourceType] || sourceTypeColors.template;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-all`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${colors.text}`}>{citation.title}</p>
          <p className="text-xs text-[#6B6B6B]">
            {citation.sourceType.replace("_", " ")}
            {citation.similarity && (
              <span className="ml-2 opacity-60">
                {Math.round(citation.similarity * 100)}% match
              </span>
            )}
          </p>
        </div>
        <div className={`flex-shrink-0 ${colors.text}`}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E8DADA] bg-white px-4 py-3">
          <p className="text-sm leading-relaxed text-[#4A4A4A]">{citation.excerpt}</p>
          {citation.sectionRef && (
            <p className="mt-2 text-xs text-[#9B8E8E]">
              Reference: {citation.sectionRef}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type SourceCardsListProps = {
  citations: Citation[];
  maxInitialDisplay?: number;
};

export function SourceCardsList({ citations, maxInitialDisplay = 3 }: SourceCardsListProps) {
  const [showAll, setShowAll] = useState(false);

  if (citations.length === 0) return null;

  const displayedCitations = showAll ? citations : citations.slice(0, maxInitialDisplay);
  const hiddenCount = citations.length - maxInitialDisplay;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9B8E8E]">Sources</p>
      <div className="space-y-2">
        {displayedCitations.map((citation) => (
          <SourceCard key={citation.id} citation={citation} />
        ))}
      </div>
      {!showAll && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-sm text-[#D96C6C] underline"
        >
          Show {hiddenCount} more source{hiddenCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
