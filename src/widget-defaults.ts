import type { ColorName } from "./colors.js";
import type { WidgetType } from "./types.js";

export const DEFAULT_WIDGET_FOREGROUNDS: Record<WidgetType, ColorName> = {
  model: "cyan",
  provider: "cyan",
  "model-provider": "cyan",
  "thinking-level": "magenta",
  "text-verbosity": "cyan",
  "context-window": "brightBlack",
  cwd: "blue",
  "cwd-basename": "blue",
  "session-name": "cyan",
  "active-tools": "yellow",
  event: "default",
  "external-status": "default",

  tokens: "cyan",
  "input-tokens": "blue",
  "output-tokens": "white",
  "total-tokens": "cyan",
  "cache-read": "cyan",
  "cache-write": "cyan",
  "context-length": "brightBlack",
  context: "blue",
  "context-remaining": "green",
  "context-bar": "blue",
  cost: "green",
  "input-speed": "brightMagenta",
  "output-speed": "brightCyan",
  "total-speed": "brightGreen",

  messages: "cyan",
  "user-messages": "blue",
  "assistant-messages": "white",
  "tool-results": "green",
  "total-messages": "cyan",
  elapsed: "yellow",
  "session-total-time": "yellow",
  "session-start": "yellow",
  "last-activity": "yellow",
  "session-id": "cyan",
  compactions: "yellow",

  "git-branch": "magenta",
  "git-sha": "brightBlack",
  "git-root": "cyan",
  "git-status": "yellow",
  "git-diff": "yellow",
  "git-clean": "green",
  "git-staged": "green",
  "git-unstaged": "yellow",
  "git-untracked": "red",
  "git-insertions": "green",
  "git-deletions": "red",
  "git-ahead-behind": "cyan",
  "git-remote": "cyan",

  "custom-text": "default",
  separator: "default",
  spacer: "default",
  "flex-separator": "default",
};

export function defaultWidgetForeground(type: WidgetType): ColorName {
  return DEFAULT_WIDGET_FOREGROUNDS[type];
}
