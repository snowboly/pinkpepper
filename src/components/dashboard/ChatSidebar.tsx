"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { SubscriptionTier } from "@/lib/tier";
import type { Conversation, Project } from "./types";
import { getGroupedTemplates } from "@/lib/templates";

// Preset emojis for projects
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
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  };

  for (const conv of conversations) {
    const ts = new Date(conv.updated_at).getTime();
    if (ts >= todayStart) buckets.today.push(conv);
    else if (ts >= yesterdayStart) buckets.yesterday.push(conv);
    else if (ts >= weekStart) buckets.previous7Days.push(conv);
    else if (ts >= monthStart) buckets.previous30Days.push(conv);
    else buckets.older.push(conv);
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
  tierColour: string;
  onCloseSidebar?: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onMoveConversation: (convId: string, projectId: string | null) => void;
  onCreateProject: (name: string, emoji: string) => void;
  onRenameProject: (id: string, name: string, emoji: string) => void;
  onDeleteProject: (id: string) => void;
  onTemplateDownload: (slug: string) => void;
  onTemplateUpgrade: () => void;
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
  tierColour,
  onCloseSidebar,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
  onRenameConversation,
  onMoveConversation,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onTemplateDownload,
  onTemplateUpgrade,
}: ChatSidebarProps) {
  const t = useTranslations("sidebar");
  const tc = useTranslations("chat");
  const templateGroups = getGroupedTemplates();
  const userInitials = (() => {
    const local = userEmail.split("@")[0] ?? "";
    const tokens = local.split(/[._-]+/).filter(Boolean);
    if (tokens.length >= 2) {
      return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
    }
    if (tokens.length === 1) {
      return tokens[0].slice(0, 2).toUpperCase();
    }
    return "U";
  })();
  // Conversation rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Conversation search
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [dragOverAllChats, setDragOverAllChats] = useState(false);

  // Project expand/collapse
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Templates dropdown
  const [templatesOpen, setTemplatesOpen] = useState(false);

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
  function ConvRow({ conv }: { conv: Conversation }) {
    const isActive = activeConversationId === conv.id;
    return (
      <div
        key={conv.id}
        className={`group relative flex items-center rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${
          isActive ? "bg-[#FEF2F2] text-[#0F172A]" : "text-[#334155] hover:bg-[#F1F5F9]"
        }`}
        draggable={renamingId !== conv.id}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", conv.id);
          e.dataTransfer.effectAllowed = "move";
        }}
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
            onClick={() => {
              onSelectConversation(conv.id);
              onCloseSidebar?.();
            }}
            className="flex-1 text-left leading-snug font-medium truncate"
          >
            {conv.title || t("untitledConversation")}
          </button>
        )}

        {renamingId !== conv.id && (
          <div className="ml-1 flex items-center gap-0.5 flex-shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {/* Rename */}
            <button
              onClick={(e) => { e.stopPropagation(); startRename(conv); }}
              className="text-[#6B7280] hover:text-[#0F172A] p-0.5"
              title={t("rename")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Archive */}
            <button
              onClick={(e) => { e.stopPropagation(); onArchiveConversation(conv.id); }}
              className="text-[#6B7280] hover:text-[#0F172A] p-0.5"
              title={t("archive")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }}
              className="text-[#6B7280] hover:text-[#E11D48] p-0.5"
              title={t("delete")}
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
      className={`fixed inset-y-0 left-0 z-20 flex w-72 max-w-[calc(100vw-1.5rem)] flex-col border-r border-[#E2E8F0] bg-white shadow-xl transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:static md:z-auto md:max-w-none md:translate-x-0 md:shadow-none`}
    >
      {/* Templates dropdown - above new chat */}
      <div className="flex-shrink-0 border-b border-[#E2E8F0]">
        <button
          onClick={() => setTemplatesOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#475569] hover:bg-[#F8F9FB] transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {tc("downloadTemplates")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-[#64748B] normal-case tracking-normal">
              {tc("docCategories.downloadTemplatesHint")}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-[#94A3B8] transition-transform ${templatesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {templatesOpen && (
          <div className="px-3 pb-2 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {templateGroups.map((group) => (
                <div key={group.category}>
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {group.category}
                  </p>
                  <div className="space-y-0.5">
                    {group.templates.map((template) => {
                      const locked = tier === "free";
                      return (
                        <button
                          key={template.slug}
                          type="button"
                          onClick={() => {
                            if (locked) {
                              onTemplateUpgrade();
                              return;
                            }
                            onTemplateDownload(template.slug);
                          }}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                            locked ? "hover:bg-[#F8FAFC]" : "hover:bg-[#F1F5F9]"
                          }`}
                        >
                          <span className={`min-w-0 flex-1 truncate font-medium ${locked ? "text-[#64748B]" : "text-[#1E293B]"}`}>
                            {template.title}
                          </span>
                          {locked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New chat button */}
      <div className="flex-shrink-0 px-3 pt-4 pb-3 border-b border-[#E2E8F0]">
        <button
          onClick={() => {
            onNewChat();
            onCloseSidebar?.();
          }}
          className="flex w-full items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-3 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t("newChat")}
        </button>

        {/* Search */}
        <div className="relative mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("searchChats")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] pl-9 pr-3 py-2 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none focus:border-[#E11D48] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Projects section ── */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              {t("projects")}
            </span>
            <button
              onClick={() => { setCreatingProject(true); setExpandedProjects((prev) => new Set(prev)); }}
              className="rounded p-0.5 text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              title={t("newProject")}
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
                placeholder={t("projectName")}
                maxLength={100}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#0F172A] placeholder-[#9CA3AF] outline-none focus:border-[#E11D48]"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={submitNewProject}
                  disabled={!newProjectName.trim()}
                  className="flex-1 rounded-lg bg-[#E11D48] py-1 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#BE123C] transition-colors"
                >
                  {t("create")}
                </button>
                <button
                  onClick={() => { setCreatingProject(false); setNewProjectName(""); }}
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Project folders */}
          {projects.length === 0 && !creatingProject && (
            <p className="px-1 py-1 text-xs text-[#9CA3AF]">{t("noProjectsYet")}</p>
          )}

          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const projectConvs = convsByProject[project.id] ?? [];
            const isRenamingThis = renamingProjectId === project.id;

            return (
              <div key={project.id} className="mb-0.5">
                {/* Project folder row */}
                <div
                  className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm text-[#334155] transition-colors ${
                    dragOverProjectId === project.id ? "bg-[#FEF2F2] ring-1 ring-inset ring-[#E11D48]/30" : "hover:bg-[#F1F5F9]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverProjectId(project.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverProjectId === project.id) setDragOverProjectId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const convId = e.dataTransfer.getData("text/plain");
                    if (convId) onMoveConversation(convId, project.id);
                    setDragOverProjectId(null);
                    setExpandedProjects((prev) => new Set(prev).add(project.id));
                  }}
                >
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="flex flex-1 items-center gap-1.5 text-left overflow-hidden"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3 w-3 flex-shrink-0 text-[#9CA3AF] transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
                      <span className="flex-shrink-0 text-xs text-[#9CA3AF]">
                        {projectConvs.length}
                      </span>
                    )}
                  </button>

                  {!isRenamingThis && (
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRenameProject(project); }}
                        className="text-[#9CA3AF] hover:text-[#64748B] p-0.5"
                        title={t("renameProject")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        className="text-[#9CA3AF] hover:text-[#E11D48] p-0.5"
                        title={t("deleteProject")}
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
                      <p className="px-3 py-1 text-xs text-[#9CA3AF]">{t("noChatsYet")}</p>
                    ) : (
                      projectConvs.map((conv) => (
                        <ConvRow key={conv.id} conv={conv} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── All chats (unassigned) ── */}
        <div
          className={`px-2 pb-2 rounded-xl ${dragOverAllChats ? "bg-[#F8FAFC] ring-1 ring-inset ring-[#CBD5E1]" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverAllChats(true);
          }}
          onDragLeave={() => setDragOverAllChats(false)}
          onDrop={(e) => {
            e.preventDefault();
            const convId = e.dataTransfer.getData("text/plain");
            if (convId) onMoveConversation(convId, null);
            setDragOverAllChats(false);
            setDragOverProjectId(null);
          }}
        >
          {!isSearching && (
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              {t("allChats")}
            </p>
          )}

          {loadingConversations ? (
            <p className="px-3 py-2 text-xs text-[#6B7280]">{t("loading")}</p>
          ) : unassignedGroups.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#6B7280]">
              {isSearching ? t("noMatchesFound") : t("noConversationsYet")}
            </p>
          ) : (
            unassignedGroups.map((group) => (
              <div key={group.label} className="mb-2">
                {!isSearching && (
                  <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    {t(group.label)}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.conversations.map((conv) => (
                    <ConvRow key={conv.id} conv={conv} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer: user info dropdown */}
      <div className="flex-shrink-0 border-t border-[#E2E8F0] p-3">
        <details className="group relative">
          <summary className="flex w-full cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-[#F1F5F9]">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white uppercase">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{userEmail}</p>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${tierColour}`}>
              {isAdmin ? "Admin" : tier}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0 text-[#9CA3AF] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </summary>
          <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-lg">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t("accountSettings")}
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("viewPlans")}
            </Link>
            <div className="mx-2 my-1 border-t border-[#F1F5F9]" />
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-[#0F172A]">{t("deleteConversation")}</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              {t("deleteConversationBody")}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl border border-[#E2E8F0] bg-white py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => { onDeleteConversation(deleteConfirmId); setDeleteConfirmId(null); }}
                className="flex-1 rounded-xl bg-[#E11D48] py-2 text-sm font-medium text-white hover:bg-[#BE123C] transition-colors"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
