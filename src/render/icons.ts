import type { IconMode, WidgetInstance, WidgetType } from "../types.js";

interface WidgetLabelSet {
  emoji: string;
  nerd: string;
  text: string;
}

const WIDGET_LABELS: Record<WidgetType, WidgetLabelSet> = {
  model: { emoji: "🤖", nerd: "󰚩", text: "model" },
  provider: { emoji: "☁️", nerd: "󰒋", text: "provider" },
  "model-provider": { emoji: "🤖", nerd: "󰚩", text: "model" },
  "thinking-level": { emoji: "🧠", nerd: "󰈈", text: "thinking" },
  "text-verbosity": { emoji: "📝", nerd: "󰉿", text: "verbosity" },
  "context-window": { emoji: "🪟", nerd: "󰍛", text: "window" },
  cwd: { emoji: "📁", nerd: "", text: "cwd" },
  "cwd-basename": { emoji: "📂", nerd: "", text: "dir" },
  "session-name": { emoji: "🏷️", nerd: "󰍹", text: "session" },
  "active-tools": { emoji: "🛠️", nerd: "󰒓", text: "tools" },
  event: { emoji: "", nerd: "", text: "" },
  "external-status": { emoji: "", nerd: "", text: "" },
  tokens: { emoji: "🔢", nerd: "󰓹", text: "tok" },
  "input-tokens": { emoji: "⬆️", nerd: "󰌌", text: "in" },
  "output-tokens": { emoji: "⬇️", nerd: "󰧚", text: "out" },
  "total-tokens": { emoji: "🔢", nerd: "󰓹", text: "tok" },
  "cache-read": { emoji: "📖", nerd: "󰆼", text: "cache read" },
  "cache-write": { emoji: "✍️", nerd: "󰆼", text: "cache write" },
  "context-length": { emoji: "📏", nerd: "󰍛", text: "ctx len" },
  context: { emoji: "🧩", nerd: "󰍛", text: "ctx" },
  "context-remaining": { emoji: "🧩", nerd: "󰍛", text: "ctx left" },
  "context-bar": { emoji: "📊", nerd: "󰍛", text: "Context:" },
  cost: { emoji: "💸", nerd: "󱐋", text: "cost" },
  "input-speed": { emoji: "⏫", nerd: "", text: "in/min" },
  "output-speed": { emoji: "⏬", nerd: "", text: "out/min" },
  "total-speed": { emoji: "⚡", nerd: "↕", text: "tok/min" },
  messages: { emoji: "💬", nerd: "󰭻", text: "msg" },
  "user-messages": { emoji: "👤", nerd: "", text: "user" },
  "assistant-messages": { emoji: "🤖", nerd: "󰚩", text: "assistant" },
  "tool-results": { emoji: "🛠️", nerd: "󰒓", text: "tools" },
  "total-messages": { emoji: "💬", nerd: "󰭻", text: "messages" },
  elapsed: { emoji: "⏱️", nerd: "󱎫", text: "span" },
  "session-total-time": { emoji: "⏳", nerd: "󱎫", text: "total" },
  "session-start": { emoji: "🚀", nerd: "󱑂", text: "started" },
  "last-activity": { emoji: "🕘", nerd: "󱑃", text: "last" },
  "session-id": { emoji: "🆔", nerd: "󰈙", text: "session id" },
  compactions: { emoji: "🗜️", nerd: "󰁨", text: "compactions" },
  "git-branch": { emoji: "🌿", nerd: "", text: "git" },
  "git-sha": { emoji: "🔖", nerd: "", text: "sha" },
  "git-root": { emoji: "📦", nerd: "", text: "repo" },
  "git-status": { emoji: "🔀", nerd: "", text: "git" },
  "git-diff": { emoji: "📈", nerd: "", text: "diff" },
  "git-clean": { emoji: "✅", nerd: "󰄬", text: "git" },
  "git-staged": { emoji: "➕", nerd: "+", text: "staged" },
  "git-unstaged": { emoji: "📝", nerd: "±", text: "unstaged" },
  "git-untracked": { emoji: "❓", nerd: "?", text: "untracked" },
  "git-insertions": { emoji: "➕", nerd: "+", text: "ins" },
  "git-deletions": { emoji: "➖", nerd: "-", text: "del" },
  "git-ahead-behind": { emoji: "↕️", nerd: "󰦻", text: "upstream" },
  "git-remote": { emoji: "🌐", nerd: "󰊢", text: "remote" },
  "custom-text": { emoji: "", nerd: "", text: "" },
  separator: { emoji: "", nerd: "", text: "" },
  spacer: { emoji: "", nerd: "", text: "" },
  "flex-separator": { emoji: "", nerd: "", text: "" },
};

export function widgetLabel(widget: WidgetInstance, iconMode: IconMode): string {
  if (widget.options.icon) return widget.options.icon;
  return WIDGET_LABELS[widget.type][iconMode];
}
