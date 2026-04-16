import type { Message } from "./types";

export function shouldShowGlobalThinkingRow(messages: Message[], loading: boolean) {
  if (!loading) return false;
  if (messages.length === 0) return true;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "assistant") {
    return false;
  }

  return true;
}
