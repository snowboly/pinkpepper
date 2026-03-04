"use client";

import { useState, useRef, useEffect } from "react";
import type { SubscriptionTier } from "@/lib/tier";
import type { Conversation } from "./types";

type ConversationGroup = {
  label: string;
  conversations: Conversation[];
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupConversationsByTime(conversations: Conversation[]): ConversationGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const yesterdayStart = startOfDay(new Date(now.getTime() - 86400000)).getTime();
  const weekStart = startOfDay(new Date(now.getTime() - 7 * 86400000)).getTime();
  const monthStart = startOfDay(new Date(now.getTime() - 30 * 86400000)).getTime();

  const buckets: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

  for (const conv of conversations) {
    const t = new Date(conv.updated_at).getTime();
    if (t >= todayStart) buckets.Today.push(conv);
    else if (t >= yesterdayStart) buckets.Yesterday.push(conv);
    else if (t >= weekStart) buckets["Previous 7 Days"].push(conv);
    else if (t >= monthStart) buckets["Previous 30 Days"].push(conv);
    else buckets.Older.push(conv);
  }

  return Object.entries(buckets)
    .filter(([, convs]) => convs.length > 0)
    .map(([label, convs]) => ({ label, conversations: convs }));
}

type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  loadingConversations: boolean;
  sidebarOpen: boolean;
  userEmail: string;
  tier: SubscriptionTier;
  isAdmin: boolean;
  usageLabel: string;
  usagePercent: number;
  billingLoading: boolean;
  tierColour: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onRefreshBilling: () => void;
  onOpenBilling: () => void;
};

export default function ChatSidebar({
  conversations,
  activeConversationId,
  loadingConversations,
  sidebarOpen,
  userEmail,
  tier,
  isAdmin,
  usageLabel,
  usagePercent,
  billingLoading,
  tierColour,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onRefreshBilling,
  onOpenBilling,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const filtered = searchQuery
    ? conversations.filter((c) =>
        (c.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const groups = groupConversationsByTime(filtered);

  function startRename(conv: Conversation) {
    setRenamingId(conv.id);
    setRenameValue(conv.title ?? "");
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      onRenameConversation(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } flex-shrink-0 transition-[width] duration-200 overflow-hidden border-r border-[#E2E8F0] bg-white flex flex-col`}
    >
      {/* New chat button */}
      <div className="flex-shrink-0 px-3 pt-4 pb-3 border-b border-[#E2E8F0]">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-3 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] transition-colors"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loadingConversations ? (
          <p className="px-3 py-2 text-xs text-[#94A3B8]">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[#94A3B8]">
            {searchQuery ? "No matches found." : "No conversations yet."}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-[#FEF2F2] text-[#0F172A]"
                        : "text-[#334155] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {renamingId === conv.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                        }}
                        className="flex-1 rounded border border-[#E11D48] bg-white px-1.5 py-0.5 text-xs outline-none"
                        maxLength={100}
                      />
                    ) : (
                      <button
                        onClick={() => onSelectConversation(conv.id)}
                        className="flex-1 text-left leading-snug font-medium truncate"
                      >
                        {conv.title || "Untitled conversation"}
                      </button>
                    )}

                    {renamingId !== conv.id && (
                      <div className="ml-1 hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                        {/* Rename button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                          className="text-[#94A3B8] hover:text-[#0F172A] p-0.5"
                          title="Rename"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                          className="text-[#94A3B8] hover:text-[#E11D48] p-0.5"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: user info + billing */}
      <div className="flex-shrink-0 border-t border-[#E2E8F0] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierColour}`}>
            {isAdmin ? "Admin" : tier}
          </span>
          <span className="text-[11px] text-[#64748B] truncate">{usageLabel}</span>
        </div>
        {!isAdmin && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div className="h-full rounded-full bg-[#E11D48]" style={{ width: `${usagePercent}%` }} />
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onRefreshBilling}
            disabled={billingLoading}
            className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            {billingLoading ? "..." : "Refresh plan"}
          </button>
          <button
            onClick={onOpenBilling}
            disabled={billingLoading}
            className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            Billing
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-[9px] font-bold text-white uppercase">
            {userEmail.charAt(0)}
          </div>
          <p className="text-[10px] text-[#94A3B8] truncate">{userEmail}</p>
        </div>
      </div>
    </aside>
  );
}
