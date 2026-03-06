"use client";

import { useState, useRef, useEffect } from "react";
import type { SubscriptionTier } from "@/lib/tier";
import type { Conversation, Project } from "./types";

// ── Preset emojis for projects ──
const PRESET_EMOJIS = ["📁", "🍽️", "🧑‍🍳", "📋", "🔬", "🏭", "📊", "🌿"];

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
  projects: Project[];
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
  onArchiveConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onMoveConversation: (convId: string, projectId: string | null) => void;
  onCreateProject: (name: string, emoji: string) => void;
  onRenameProject: (id: string, name: string, emoji: string) => void;
  onDeleteProject: (id: string) => void;
  onRefreshBilling: () => void;
  onOpenBilling: () => void;
};

export default function ChatSidebar({
  conversations,
  projects,
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
  onArchiveConversation,
  onRenameConversation,
  onMoveConversation,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onRefreshBilling,
  onOpenBilling,
}: ChatSidebarProps) {
  // Conversation rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Conversation search
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Move-to-project dropdown
  const [moveMenuConvId, setMoveMenuConvId] = useState<string | null>(null);

  // Project expand/collapse
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // New project inline form
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectEmoji, setNewProjectEmoji] = useState("📁");
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  // Project rename
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState("");
  const [renameProjectEmoji, setRenameProjectEmoji] = useState("📁");
  const renameProjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    if (creatingProject && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [creatingProject]);

  useEffect(() => {
    if (renamingProjectId && renameProjectInputRef.current) {
      renameProjectInputRef.current.focus();
      renameProjectInputRef.current.select();
    }
  }, [renamingProjectId]);

  // Close move menu on outside click
  useEffect(() => {
    if (!moveMenuConvId) return;
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-move-menu]")) setMoveMenuConvId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moveMenuConvId]);

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

  function toggleProject(id: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submitNewProject() {
    const name = newProjectName.trim();
    if (!name) return;
    onCreateProject(name, newProjectEmoji);
    setCreatingProject(false);
    setNewProjectName("");
    setNewProjectEmoji("📁");
  }

  function startRenameProject(p: Project) {
    setRenamingProjectId(p.id);
    setRenameProjectName(p.name);
    setRenameProjectEmoji(p.emoji);
  }

  function commitRenameProject() {
    const name = renameProjectName.trim();
    if (renamingProjectId && name) {
      onRenameProject(renamingProjectId, name, renameProjectEmoji);
    }
    setRenamingProjectId(null);
  }

  // Partition conversations into project buckets + unassigned
  const convsByProject: Record<string, Conversation[]> = {};
  const unassigned: Conversation[] = [];

  for (const conv of conversations) {
    if (conv.project_id) {
      (convsByProject[conv.project_id] ??= []).push(conv);
    } else {
      unassigned.push(conv);
    }
  }

  // For search: flatten everything, filter, then show flat time-grouped list
  const isSearching = searchQuery.trim().length > 0;
  const searchFiltered = isSearching
    ? conversations.filter((c) =>
        (c.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unassigned;

  const unassignedGroups = groupConversationsByTime(isSearching ? searchFiltered : unassigned);

  // ── Shared conversation row renderer ──
  function ConvRow({ conv, inProject }: { conv: Conversation; inProject: boolean }) {
    const isActive = activeConversationId === conv.id;
    return (
      <div
        key={conv.id}
        className={`group relative flex items-center rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${
          isActive ? "bg-[#FEF2F2] text-[#0F172A]" : "text-[#334155] hover:bg-[#F1F5F9]"
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
            className="flex-1 rounded border border-[#E11D48] bg-white px-1.5 py-0.5 text-sm outline-none"
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
            {/* Rename */}
            <button
              onClick={(e) => { e.stopPropagation(); startRename(conv); }}
              className="text-[#94A3B8] hover:text-[#0F172A] p-0.5"
              title="Rename"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Move to / remove from project */}
            {inProject ? (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveConversation(conv.id, null); }}
                className="text-[#94A3B8] hover:text-[#64748B] p-0.5"
                title="Remove from project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
                </svg>
              </button>
            ) : projects.length > 0 ? (
              <div data-move-menu className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMoveMenuConvId(moveMenuConvId === conv.id ? null : conv.id); }}
                  className="text-[#94A3B8] hover:text-[#64748B] p-0.5"
                  title="Move to project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4m2-2H10" />
                  </svg>
                </button>
                {moveMenuConvId === conv.id && (
                  <div className="absolute bottom-full left-0 z-50 mb-1 min-w-[140px] rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={(e) => { e.stopPropagation(); onMoveConversation(conv.id, p.id); setMoveMenuConvId(null); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#334155] hover:bg-[#F1F5F9] text-left"
                      >
                        <span>{p.emoji}</span>
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Archive */}
            <button
              onClick={(e) => { e.stopPropagation(); onArchiveConversation(conv.id); }}
              className="text-[#94A3B8] hover:text-[#0F172A] p-0.5"
              title="Archive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }}
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
    );
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "w-72" : "w-0"
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

        {/* Search */}
        <div className="relative mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] pl-9 pr-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Projects section ── */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Projects
            </span>
            <button
              onClick={() => { setCreatingProject(true); setExpandedProjects((prev) => new Set(prev)); }}
              className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              title="New project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Inline new project form */}
          {creatingProject && (
            <div className="mb-2 rounded-xl border border-[#E11D48]/30 bg-[#FFF1F2] p-2.5 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewProjectEmoji(em)}
                    className={`rounded-lg p-1 text-base leading-none transition-colors ${
                      newProjectEmoji === em ? "bg-[#E11D48]/10 ring-1 ring-[#E11D48]/40" : "hover:bg-white"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <input
                ref={newProjectInputRef}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNewProject();
                  if (e.key === "Escape") { setCreatingProject(false); setNewProjectName(""); }
                }}
                placeholder="Project name..."
                maxLength={100}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48]"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={submitNewProject}
                  disabled={!newProjectName.trim()}
                  className="flex-1 rounded-lg bg-[#E11D48] py-1 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#BE123C] transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => { setCreatingProject(false); setNewProjectName(""); }}
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Project folders */}
          {projects.length === 0 && !creatingProject && (
            <p className="px-1 py-1 text-xs text-[#CBD5E1]">No projects yet.</p>
          )}

          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const projectConvs = convsByProject[project.id] ?? [];
            const isRenamingThis = renamingProjectId === project.id;

            return (
              <div key={project.id} className="mb-0.5">
                {/* Project folder row */}
                <div className="group flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors">
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="flex flex-1 items-center gap-1.5 text-left overflow-hidden"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3 w-3 flex-shrink-0 text-[#CBD5E1] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm leading-none">{project.emoji}</span>
                    {isRenamingThis ? (
                      <input
                        ref={renameProjectInputRef}
                        value={renameProjectName}
                        onChange={(e) => setRenameProjectName(e.target.value)}
                        onBlur={commitRenameProject}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRenameProject();
                          if (e.key === "Escape") setRenamingProjectId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-0 rounded border border-[#E11D48] bg-white px-1 py-0.5 text-xs outline-none"
                        maxLength={100}
                      />
                    ) : (
                      <span className="flex-1 truncate font-medium">{project.name}</span>
                    )}
                    {!isRenamingThis && (
                      <span className="flex-shrink-0 text-xs text-[#CBD5E1]">
                        {projectConvs.length}
                      </span>
                    )}
                  </button>

                  {!isRenamingThis && (
                    <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRenameProject(project); }}
                        className="text-[#CBD5E1] hover:text-[#64748B] p-0.5"
                        title="Rename project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        className="text-[#CBD5E1] hover:text-[#E11D48] p-0.5"
                        title="Delete project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Conversations inside folder */}
                {isExpanded && (
                  <div className="pl-4 space-y-0.5 pb-1">
                    {projectConvs.length === 0 ? (
                      <p className="px-3 py-1 text-xs text-[#CBD5E1]">No chats yet.</p>
                    ) : (
                      projectConvs.map((conv) => (
                        <ConvRow key={conv.id} conv={conv} inProject={true} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-3 border-t border-[#F1F5F9] my-1" />

        {/* ── All chats (unassigned) ── */}
        <div className="px-2 pb-2">
          {!isSearching && (
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              All chats
            </p>
          )}

          {loadingConversations ? (
            <p className="px-3 py-2 text-xs text-[#94A3B8]">Loading...</p>
          ) : unassignedGroups.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#94A3B8]">
              {isSearching ? "No matches found." : "No conversations yet."}
            </p>
          ) : (
            unassignedGroups.map((group) => (
              <div key={group.label} className="mb-2">
                {!isSearching && (
                  <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.conversations.map((conv) => (
                    <ConvRow key={conv.id} conv={conv} inProject={false} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer: user info + billing */}
      <div className="flex-shrink-0 border-t border-[#E2E8F0] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${tierColour}`}>
            {isAdmin ? "Admin" : tier}
          </span>
          <span className="text-xs text-[#64748B] truncate">{usageLabel}</span>
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
            className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            {billingLoading ? "..." : "Refresh plan"}
          </button>
          <button
            onClick={onOpenBilling}
            disabled={billingLoading}
            className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            Billing
          </button>
        </div>
        <a
          href={isAdmin ? "/admin/reviews" : "/dashboard/reviews"}
          className="flex w-full items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-xs text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {isAdmin ? "Review Queue" : "My Reviews"}
        </a>
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-[9px] font-bold text-white uppercase">
            {userEmail.charAt(0)}
          </div>
          <p className="text-xs text-[#94A3B8] truncate flex-1">{userEmail}</p>
          <a
            href="/dashboard/settings"
            className="text-[#CBD5E1] hover:text-[#64748B] transition-colors flex-shrink-0"
            title="Account settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-[#0F172A]">Delete conversation?</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl border border-[#E2E8F0] bg-white py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteConversation(deleteConfirmId); setDeleteConfirmId(null); }}
                className="flex-1 rounded-xl bg-[#E11D48] py-2 text-sm font-medium text-white hover:bg-[#BE123C] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
