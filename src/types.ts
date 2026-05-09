import type { ColorLevel, ColorName, TerminalWidthMode } from "./colors.js";
import type { ExtensionStatusRowConfig } from "./extension-statuses.js";
import type { SeparatorStyle, WidgetSeparatorStyle } from "./separators.js";

export const WIDGET_DEFINITIONS = [
  { type: "model", label: "Model", category: "Core", description: "Active model id" },
  { type: "provider", label: "Provider", category: "Core", description: "Active model provider" },
  {
    type: "model-provider",
    label: "Provider/Model",
    category: "Core",
    description: "Provider and model together",
  },
  {
    type: "thinking-level",
    label: "Thinking Level",
    category: "Core",
    description: "Pi reasoning/thinking level for reasoning-capable models",
  },
  {
    type: "text-verbosity",
    label: "Text Verbosity",
    category: "Core",
    description: "Text verbosity for models/providers that support it",
  },
  {
    type: "context-window",
    label: "Context Window",
    category: "Core",
    description: "Model context window size",
  },
  { type: "cwd", label: "Working Dir", category: "Core", description: "Current working directory" },
  {
    type: "cwd-basename",
    label: "Working Dir Name",
    category: "Core",
    description: "Current directory name",
  },
  { type: "session-name", label: "Session Name", category: "Core", description: "Pi session name" },
  {
    type: "active-tools",
    label: "Active Tools",
    category: "Core",
    description: "Active tool count",
  },
  {
    type: "event",
    label: "Pi Event Value",
    category: "Core",
    description: "Value updated by other extensions through pi.events",
  },
  {
    type: "external-status",
    label: "Pi Extension Status",
    category: "Core",
    description: "Status value published by another pi extension through ctx.ui.setStatus",
  },

  {
    type: "tokens",
    label: "Input/Output Tokens",
    category: "Tokens",
    description: "Input and output token totals",
  },
  {
    type: "input-tokens",
    label: "Input Tokens",
    category: "Tokens",
    description: "Input token total",
  },
  {
    type: "output-tokens",
    label: "Output Tokens",
    category: "Tokens",
    description: "Output token total",
  },
  {
    type: "total-tokens",
    label: "Total Tokens",
    category: "Tokens",
    description: "Total token count",
  },
  {
    type: "cache-read",
    label: "Cache Read",
    category: "Tokens",
    description: "Cache read token total",
  },
  {
    type: "cache-write",
    label: "Cache Write",
    category: "Tokens",
    description: "Cache write token total",
  },
  {
    type: "context-length",
    label: "Context Length",
    category: "Tokens",
    description: "Current context token count",
  },
  {
    type: "context",
    label: "Context %",
    category: "Tokens",
    description: "Current context usage percentage",
  },
  {
    type: "context-remaining",
    label: "Context Remaining",
    category: "Tokens",
    description: "Remaining context percentage",
  },
  {
    type: "context-bar",
    label: "Context Bar",
    category: "Tokens",
    description: "Progress bar for context usage",
  },
  {
    type: "cost",
    label: "Session Cost",
    category: "Tokens",
    description: "Estimated session cost",
  },
  {
    type: "input-speed",
    label: "Input Speed",
    category: "Tokens",
    description: "Average input tokens per minute",
  },
  {
    type: "output-speed",
    label: "Output Speed",
    category: "Tokens",
    description: "Average output tokens per minute",
  },
  {
    type: "total-speed",
    label: "Total Speed",
    category: "Tokens",
    description: "Average total tokens per minute",
  },

  {
    type: "messages",
    label: "Message Counts",
    category: "Session",
    description: "User/assistant/tool message counts",
  },
  {
    type: "user-messages",
    label: "User Messages",
    category: "Session",
    description: "User message count",
  },
  {
    type: "assistant-messages",
    label: "Assistant Messages",
    category: "Session",
    description: "Assistant message count",
  },
  {
    type: "tool-results",
    label: "Tool Results",
    category: "Session",
    description: "Tool result count",
  },
  {
    type: "total-messages",
    label: "Total Messages",
    category: "Session",
    description: "Total message count",
  },
  {
    type: "elapsed",
    label: "Transcript Span",
    category: "Session",
    description: "Time between first and last recorded session entry",
  },
  {
    type: "session-total-time",
    label: "Session Total Time",
    category: "Session",
    description: "Live wall-clock time since first session entry",
  },
  {
    type: "session-start",
    label: "Session Start",
    category: "Session",
    description: "First session entry time",
  },
  {
    type: "last-activity",
    label: "Last Activity",
    category: "Session",
    description: "Most recent session entry time",
  },
  {
    type: "session-id",
    label: "Session ID",
    category: "Session",
    description: "Current pi session id",
  },
  {
    type: "compactions",
    label: "Compactions",
    category: "Session",
    description: "Compaction summary count",
  },

  { type: "git-branch", label: "Git Branch", category: "Git", description: "Current Git branch" },
  { type: "git-sha", label: "Git SHA", category: "Git", description: "Short HEAD commit SHA" },
  {
    type: "git-root",
    label: "Git Root Dir",
    category: "Git",
    description: "Repository root directory name",
  },
  {
    type: "git-status",
    label: "Git Status",
    category: "Git",
    description: "Staged/unstaged/untracked counts",
  },
  {
    type: "git-diff",
    label: "Git Diff",
    category: "Git",
    description: "Insertion/deletion diff summary",
  },
  {
    type: "git-clean",
    label: "Git Clean Status",
    category: "Git",
    description: "Clean/dirty state",
  },
  {
    type: "git-staged",
    label: "Git Staged Files",
    category: "Git",
    description: "Staged file count",
  },
  {
    type: "git-unstaged",
    label: "Git Unstaged Files",
    category: "Git",
    description: "Unstaged file count",
  },
  {
    type: "git-untracked",
    label: "Git Untracked Files",
    category: "Git",
    description: "Untracked file count",
  },
  {
    type: "git-insertions",
    label: "Git Insertions",
    category: "Git",
    description: "Uncommitted insertion count",
  },
  {
    type: "git-deletions",
    label: "Git Deletions",
    category: "Git",
    description: "Uncommitted deletion count",
  },
  {
    type: "git-ahead-behind",
    label: "Git Ahead/Behind",
    category: "Git",
    description: "Ahead/behind upstream counts",
  },
  { type: "git-remote", label: "Git Remote", category: "Git", description: "Origin remote" },

  {
    type: "custom-text",
    label: "Custom Text",
    category: "Custom/Layout",
    description: "User-defined text segment",
  },
  {
    type: "separator",
    label: "Separator",
    category: "Custom/Layout",
    description: "Predefined or custom separator segment",
  },
  {
    type: "spacer",
    label: "Spacer",
    category: "Custom/Layout",
    description: "Fixed-width blank spacer",
  },
  {
    type: "flex-separator",
    label: "Flex Separator",
    category: "Custom/Layout",
    description: "Push following widgets to the right",
  },
] as const;

export type WidgetType = (typeof WIDGET_DEFINITIONS)[number]["type"];
export type WidgetCategory = (typeof WIDGET_DEFINITIONS)[number]["category"];

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  enabled: boolean;
  options: WidgetOptions;
}

export interface WidgetOptions {
  icon?: string;
  raw?: boolean;
  hideWhenEmpty?: boolean;
  hideWhenZero?: boolean;
  segments?: number;
  width?: number;
  text?: string;
  separator?: WidgetSeparatorStyle;
  widgetId?: string;
  externalStatusKey?: string;
  trimValue?: number;
  preserveTrimStyles?: boolean;
  showProvider?: boolean;
  showSubscription?: boolean;
  used?: boolean;
  fg?: ColorName;
  bg?: ColorName;
  warningFg?: ColorName;
  warningBg?: ColorName;
  dangerFg?: ColorName;
  dangerBg?: ColorName;
  bold?: boolean;
  contextConditionalColors?: boolean;
  contextWarningPercent?: number;
  contextDangerPercent?: number;
  cwdDisplayStyle?: CwdDisplayStyle;
  gitBranchDisplayStyle?: GitBranchDisplayStyle;
  surroundLeft?: string;
  surroundRight?: string;
  tokenFormatStyle?: TokenFormatStyle;
  costFormatStyle?: CostFormatStyle;
  contextBarMode?: ContextBarMode;
  gitDiffMode?: GitDiffMode;
}

export interface TerminalOptions {
  widthMode: TerminalWidthMode;
  colorLevel: ColorLevel;
}

export interface StatuslineConfig {
  version: 1;
  enabled: boolean;
  preset: StatuslinePreset;
  lines: WidgetInstance[][];
  separator: SeparatorStyle;
  separatorFg: ColorName;
  separatorBg: ColorName;
  iconMode: IconMode;
  minimalist: boolean;
  terminal: TerminalOptions;
  extensionStatusRow: ExtensionStatusRowConfig;
}

export type StatuslinePreset =
  | "compact"
  | "default"
  | "powerline"
  | "powerline-bright"
  | "powerline-blocks"
  | "powerline-mono"
  | "git-heavy"
  | "pi-footer"
  | "demo"
  | "demo-standard";
export type IconMode = "emoji" | "nerd" | "text";
export type CwdDisplayStyle = "default" | "full-home" | "fish";
export type GitBranchDisplayStyle = "default" | "round-brackets" | "custom";
export type TokenFormatStyle = "default" | "compact";
export type CostFormatStyle = "default" | "compact";
export type ContextBarMode = "default" | "short" | "short-only" | "medium";
export type GitDiffMode = "plain" | "compact";

export interface SessionMetrics {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  costUsd: number;
  userMessages: number;
  assistantMessages: number;
  toolResults: number;
  firstTimestampMs: number | undefined;
  lastTimestampMs: number | undefined;
  compactions: number;
}

export interface GitInfo {
  branch: string | null;
  sha: string | null;
  root: string | null;
  staged: number;
  unstaged: number;
  untracked: number;
  insertions: number;
  deletions: number;
  ahead: number;
  behind: number;
  remote: string | null;
  isRepo: boolean;
}

export interface StatuslineData {
  model: string | undefined;
  provider: string | undefined;
  sessionName: string | undefined;
  sessionId: string | undefined;
  thinkingLevel: string | undefined;
  textVerbosity: string | undefined;
  git: GitInfo;
  cwd: string;
  activeToolCount: number;
  usingSubscription: boolean;
  contextTokens: number | undefined;
  contextMaxTokens: number | undefined;
  metrics: SessionMetrics;
  eventWidgets: ReadonlyMap<string, string>;
}
