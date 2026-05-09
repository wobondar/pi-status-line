import { basename, sep } from "node:path";

import { applyColors, type ColorName } from "../colors.js";
import type { RenderStatuslineOptions } from "../render.js";
import { widgetSeparatorText } from "../separators.js";
import type {
  ContextBarMode,
  CostFormatStyle,
  CwdDisplayStyle,
  StatuslineConfig,
  StatuslineData,
  TokenFormatStyle,
  WidgetInstance,
  WidgetType,
} from "../types.js";
import { isContextWidget } from "../widget-groups.js";
import { widgetLabel } from "./icons.js";

interface RenderedWidgetValue {
  value: string;
  preservedTrimStyles?: string;
}

export function renderWidget(
  widget: WidgetInstance,
  config: StatuslineConfig,
  data: StatuslineData,
  options: RenderStatuslineOptions = {},
): string {
  const renderedWidgetValue = getWidgetValue(widget, data, options);
  const rawWidgetValue = renderedWidgetValue.value;
  // if (
  //   !rawValue &&
  //   (widget.options.hideWhenEmpty ||
  //     widget.type === "thinking-level" ||
  //     widget.type === "text-verbosity")
  // )
  //   return "";
  if (rawWidgetValue.length === 0 && widget.options.hideWhenEmpty) {
    return "";
  }
  if (rawWidgetValue === "0" && widget.options.hideWhenZero) {
    return "";
  }
  const rawValue =
    rawWidgetValue.length === 0 && !widget.options.hideWhenEmpty
      ? (widget.options.text ?? "")
      : rawWidgetValue;
  const shouldStripStyles = shouldStripIncomingStyles(widget);
  const value = shouldStripStyles ? stripAnsi(rawValue) : rawValue;
  const raw = widget.options.raw || config.minimalist || isLayoutWidget(widget.type);
  const unstyled = raw ? value : labelWidget(widget, config, value);
  const styled =
    renderedWidgetValue.preservedTrimStyles && !shouldStripStyles
      ? `${renderedWidgetValue.preservedTrimStyles}${unstyled}`
      : unstyled;
  const colors = effectiveWidgetColors(widget, data);
  return applyColors(
    styled,
    colors.fg,
    colors.bg,
    widget.options.bold,
    config.terminal.colorLevel,
    options.theme,
  );
}

export function formatCount(value: number): string {
  if (value < 1000) return `${value}`;
  if (value < 1_000_000) return `${trimFixed(value / 1000, 1)}k`;
  return `${trimFixed(value / 1_000_000, 1)}m`;
}

export function formatPiTokenCount(value: number): string {
  if (value < 1000) return `${value}`;
  if (value < 10_000) return `${(value / 1000).toFixed(1)}k`;
  if (value < 1_000_000) return `${Math.round(value / 1000)}k`;
  if (value < 10_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${Math.round(value / 1_000_000)}M`;
}

export function formatTokenCount(value: number, style: TokenFormatStyle): string {
  return style === "compact" ? formatPiTokenCount(value) : formatCount(value);
}

export function formatCost(value: number, style: CostFormatStyle): string {
  return style === "compact" ? `$${value.toFixed(3)}` : `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0m";
  const totalMinutes = Math.max(1, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function shortenPath(path: string, maxSegments: number): string {
  const normalized = fullHomePath(path);
  const parts = normalized.split(/[\\/]+/).filter(Boolean);
  if (parts.length <= maxSegments) return normalized || sep;
  const prefix = normalized.startsWith("~") ? "~/…" : "…";
  return `${prefix}/${parts.slice(-maxSegments).join("/")}`;
}

export function fullHomePath(path: string): string {
  const home = process.env.HOME;
  if (!home || !isPathInsideHome(path, home)) return path;
  return `~${path.slice(home.length)}`;
}

export function fishStylePath(path: string, segmentLength: number): string {
  const normalized = fullHomePath(path);
  const hasHomePrefix = normalized.startsWith("~");
  const parts = normalized.split(/[\\/]+/).filter(Boolean);
  const pathParts = hasHomePrefix ? parts.slice(1) : parts;
  if (pathParts.length <= 1) return normalized || sep;

  const prefix = hasHomePrefix ? "~/" : normalized.startsWith(sep) ? sep : "";
  const abbreviated = pathParts.map((part, index) =>
    index === pathParts.length - 1
      ? part
      : Array.from(part).slice(0, segmentLength).join("") || part,
  );
  return `${prefix}${abbreviated.join("/")}`;
}

export function formatCwdPath(path: string, style: CwdDisplayStyle, segments: number): string {
  if (style === "full-home") return fullHomePath(path);
  if (style === "fish") return fishStylePath(path, segments);
  return shortenPath(path, segments);
}

function effectiveWidgetColors(
  widget: WidgetInstance,
  data: StatuslineData,
): { fg: ColorName | undefined; bg: ColorName | undefined } {
  if (!widget.options.contextConditionalColors || !isContextWidget(widget.type)) {
    return { fg: widget.options.fg, bg: widget.options.bg };
  }
  const percent = contextPercent(data.contextTokens, data.contextMaxTokens);
  if (percent === undefined) return { fg: widget.options.fg, bg: widget.options.bg };
  if (percent >= (widget.options.contextDangerPercent ?? 90)) {
    return { fg: widget.options.dangerFg, bg: widget.options.dangerBg };
  }
  if (percent >= (widget.options.contextWarningPercent ?? 70)) {
    return { fg: widget.options.warningFg, bg: widget.options.warningBg };
  }
  return { fg: widget.options.fg, bg: widget.options.bg };
}

function labelWidget(widget: WidgetInstance, config: StatuslineConfig, value: string): string {
  // an extra "space" between icon and value can be added as a part of the icon.
  if (widget.options.icon) return `${widget.options.icon}${value}`;
  const label = widgetLabel(widget, config.iconMode);
  return label ? `${label} ${value}` : value;
}

function getWidgetValue(
  widget: WidgetInstance,
  data: StatuslineData,
  options: RenderStatuslineOptions,
): RenderedWidgetValue {
  if (widget.type === "external-status") {
    const key = widget.options.externalStatusKey?.trim() ?? "";
    const value = key ? options.getExtensionStatuses?.().get(key) : undefined;
    if (!value) return { value: "" };
    return trimLeadingVisibleChars(
      value,
      widget.options.trimValue ?? 0,
      widget.options.preserveTrimStyles ?? true,
    );
  }

  return { value: widgetValue(widget, data) };
}

function widgetValue(widget: WidgetInstance, data: StatuslineData): string {
  const { metrics } = data;
  switch (widget.type) {
    case "model":
      return widget.options.showProvider && data.provider
        ? `${data.provider}/${data.model ?? "no-model"}`
        : (data.model ?? "no-model");
    case "provider":
      return data.provider ?? "no-provider";
    case "model-provider":
      return data.provider
        ? `${data.provider}/${data.model ?? "no-model"}`
        : (data.model ?? "no-model");
    case "thinking-level":
      return data.thinkingLevel ?? "";
    case "text-verbosity":
      return data.textVerbosity ?? "";
    case "context-window":
      return data.contextMaxTokens
        ? formatTokenCount(data.contextMaxTokens, widget.options.tokenFormatStyle ?? "default")
        : "?";
    case "cwd":
      return (
        formatCwdPath(
          data.cwd,
          widget.options.cwdDisplayStyle ?? "default",
          widget.options.segments ?? 2,
        ) || basename(data.cwd)
      );
    case "cwd-basename":
      return basename(data.cwd);
    case "session-name":
      return data.sessionName ?? (widget.options.hideWhenEmpty ? "" : (widget.options.text ?? "-"));
    case "active-tools":
      return `${data.activeToolCount}`;
    case "event": {
      const widgetId = widget.options.widgetId ?? "";
      const value = data.eventWidgets.get(widgetId);
      return value ?? (widget.options.hideWhenEmpty ? "" : (widget.options.text ?? "-"));
    }
    case "external-status":
      return "";
    case "tokens":
      return `↑${formatTokenCount(metrics.inputTokens, widget.options.tokenFormatStyle ?? "default")} ↓${formatTokenCount(metrics.outputTokens, widget.options.tokenFormatStyle ?? "default")}`;
    case "input-tokens":
      return formatTokenCount(metrics.inputTokens, widget.options.tokenFormatStyle ?? "default");
    case "output-tokens":
      return formatTokenCount(metrics.outputTokens, widget.options.tokenFormatStyle ?? "default");
    case "total-tokens":
      return formatTokenCount(metrics.totalTokens, widget.options.tokenFormatStyle ?? "default");
    case "cache-read":
      return formatTokenCount(
        metrics.cacheReadTokens,
        widget.options.tokenFormatStyle ?? "default",
      );
    case "cache-write":
      return formatTokenCount(
        metrics.cacheWriteTokens,
        widget.options.tokenFormatStyle ?? "default",
      );
    case "context-length":
      return data.contextTokens === undefined
        ? "?"
        : formatTokenCount(data.contextTokens, widget.options.tokenFormatStyle ?? "default");
    case "context":
      return formatContext(data.contextTokens, data.contextMaxTokens, true);
    case "context-remaining":
      return formatContext(data.contextTokens, data.contextMaxTokens, false);
    case "context-bar":
      return formatContextBar(
        data.contextTokens,
        data.contextMaxTokens,
        widget.options.contextBarMode ?? "default",
        widget.options.tokenFormatStyle ?? "default",
      );
    case "cost":
      return `${formatCost(metrics.costUsd, widget.options.costFormatStyle ?? "default")}${widget.options.showSubscription && data.usingSubscription ? " (sub)" : ""}`;
    case "input-speed":
      return formatTokenSpeed(
        metrics.inputTokens,
        metrics.firstTimestampMs,
        metrics.lastTimestampMs,
        widget.options.tokenFormatStyle ?? "default",
      );
    case "output-speed":
      return formatTokenSpeed(
        metrics.outputTokens,
        metrics.firstTimestampMs,
        metrics.lastTimestampMs,
        widget.options.tokenFormatStyle ?? "default",
      );
    case "total-speed":
      return formatTokenSpeed(
        metrics.totalTokens,
        metrics.firstTimestampMs,
        metrics.lastTimestampMs,
        widget.options.tokenFormatStyle ?? "default",
      );
    case "messages":
      return `${metrics.userMessages}u/${metrics.assistantMessages}a/${metrics.toolResults}t`;
    case "user-messages":
      return `${metrics.userMessages}`;
    case "assistant-messages":
      return `${metrics.assistantMessages}`;
    case "tool-results":
      return `${metrics.toolResults}`;
    case "total-messages":
      return `${metrics.userMessages + metrics.assistantMessages + metrics.toolResults}`;
    case "elapsed":
      return formatElapsed(metrics.firstTimestampMs, metrics.lastTimestampMs);
    case "session-total-time":
      return formatElapsed(metrics.firstTimestampMs, Date.now());
    case "session-start":
      return formatTime(metrics.firstTimestampMs);
    case "last-activity":
      return formatTime(metrics.lastTimestampMs);
    case "session-id":
      return data.sessionId ?? "";
    case "compactions":
      return `${metrics.compactions}`;
    case "git-branch":
      return formatGitBranch(
        data.git.branch,
        widget.options.gitBranchDisplayStyle ?? "default",
        widget.options.surroundLeft ?? "",
        widget.options.surroundRight ?? "",
      );
    case "git-sha":
      return data.git.sha ?? "";
    case "git-root":
      return data.git.root ?? "";
    case "git-status":
      return data.git.isRepo
        ? `+${data.git.staged} ±${data.git.unstaged} ?${data.git.untracked}`
        : "";
    case "git-diff":
      return formatGitDiff(
        data.git.insertions,
        data.git.deletions,
        widget.options.gitDiffMode ?? "plain",
      );
    case "git-clean":
      return data.git.isRepo && data.git.staged + data.git.unstaged + data.git.untracked === 0
        ? "clean"
        : "dirty";
    case "git-staged":
      return `${data.git.staged}`;
    case "git-unstaged":
      return `${data.git.unstaged}`;
    case "git-untracked":
      return `${data.git.untracked}`;
    case "git-insertions":
      return `${data.git.insertions}`;
    case "git-deletions":
      return `${data.git.deletions}`;
    case "git-ahead-behind":
      return `↑${data.git.ahead} ↓${data.git.behind}`;
    case "git-remote":
      return data.git.remote ?? "";
    case "custom-text":
      return widget.options.text ?? "";
    case "separator":
      return widgetSeparatorText(widget.options.separator, widget.options.text ?? "|");
    case "spacer":
      return " ".repeat(widget.options.width ?? 2);
    case "flex-separator":
      return "";
  }
}

function formatContext(
  tokens: number | undefined,
  maxTokens: number | undefined,
  used: boolean,
): string {
  if (tokens === undefined) return "?";
  if (maxTokens === undefined || maxTokens <= 0) return `${formatCount(tokens)} ctx`;
  const usedPercent = contextPercent(tokens, maxTokens) ?? 0;
  const percent = used ? usedPercent : 100 - usedPercent;
  return `${trimFixed(percent, 1)}%`;
}

function formatContextBar(
  tokens: number | undefined,
  maxTokens: number | undefined,
  mode: ContextBarMode,
  tokenFormatStyle: TokenFormatStyle,
): string {
  if (tokens === undefined || maxTokens === undefined || maxTokens <= 0) return "?";
  const percent = Math.min(100, Math.max(0, (tokens / maxTokens) * 100));
  const usage = `${formatTokenCount(tokens, tokenFormatStyle)}/${formatTokenCount(maxTokens, tokenFormatStyle)} (${Math.round(percent)}%)`;

  if (mode === "short" || mode === "short-only") {
    const slider = formatSliderBar(percent, 10);
    return mode === "short-only" ? slider : `${slider} ${usage}`;
  }

  const width = mode === "medium" ? 16 : 32;
  return `${formatProgressBar(percent, width)} ${usage}`;
}

function contextPercent(
  tokens: number | undefined,
  maxTokens: number | undefined,
): number | undefined {
  if (tokens === undefined || maxTokens === undefined || maxTokens <= 0) return undefined;
  return Math.min(100, Math.max(0, (tokens / maxTokens) * 100));
}

function formatProgressBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  return `[${"█".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}]`;
}

function formatSliderBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  return `${"▓".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}`;
}

function formatElapsed(first: number | undefined, last: number | undefined): string {
  if (first === undefined) return "0m";
  const end = last === undefined || last < first ? Date.now() : last;
  return formatDuration(end - first);
}

function formatTime(timestamp: number | undefined): string {
  if (timestamp === undefined) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatTokenSpeed(
  tokens: number,
  first: number | undefined,
  last: number | undefined,
  tokenFormatStyle: TokenFormatStyle,
): string {
  if (first === undefined || last === undefined || last <= first) return "0/min";
  const minutes = Math.max((last - first) / 60_000, 1 / 60);
  return `${formatTokenCount(Math.round(tokens / minutes), tokenFormatStyle)}/min`;
}

function formatGitDiff(insertions: number, deletions: number, mode: "plain" | "compact"): string {
  if (mode === "compact") return `(+${insertions},-${deletions})`;
  return `+${insertions}/-${deletions}`;
}

function formatGitBranch(
  branch: string | null,
  style: "default" | "round-brackets" | "custom",
  surroundLeft: string,
  surroundRight: string,
): string {
  if (!branch) return "";
  if (style === "round-brackets") return `(${branch})`;
  if (style === "custom") return `${surroundLeft}${branch}${surroundRight}`;
  return branch;
}

function isPathInsideHome(path: string, home: string): boolean {
  if (path === home) return true;
  const next = path[home.length];
  return path.startsWith(home) && (next === "/" || next === "\\");
}

/**
 * Trims leading visible characters while skipping ANSI SGR sequences.
 * When preserveStyles is enabled, ANSI sequences seen before the trim boundary are returned as
 * metadata so the caller can replay them after labels/custom icons are composed. This lets
 * whole-status styling like `\x1b[33m● Enabled\x1b[39m` also style a replacement custom icon.
 */
function trimLeadingVisibleChars(
  text: string,
  count: number,
  preserveStyles: boolean,
): RenderedWidgetValue {
  if (count <= 0) return { value: text };

  let trimmed = 0;
  let index = 0;
  let preservedStyles = "";
  while (index < text.length && trimmed < count) {
    // ANSI sequences have zero visible width. Keep walking without counting them as trimmed chars.
    // oxlint-disable-next-line no-control-regex
    const ansiMatch = /^\x1b\[[0-?]*[ -/]*[@-~]/.exec(text.slice(index));
    if (ansiMatch) {
      if (preserveStyles) preservedStyles += ansiMatch[0];
      index += ansiMatch[0].length;
      continue;
    }

    // Advance by Unicode code point so surrogate-pair symbols count as one visible character.
    const codePoint = text.codePointAt(index);
    if (codePoint === undefined) break;
    index += codePoint > 0xffff ? 2 : 1;
    trimmed += 1;
  }

  const value = text.slice(index);
  return preservedStyles ? { value, preservedTrimStyles: preservedStyles } : { value };
}

function shouldStripIncomingStyles(widget: WidgetInstance): boolean {
  return (
    widget.type === "external-status" &&
    ((widget.options.fg !== undefined && widget.options.fg !== "default") ||
      (widget.options.bg !== undefined && widget.options.bg !== "default") ||
      widget.options.bold === true)
  );
}

function stripAnsi(text: string): string {
  // oxlint-disable-next-line no-control-regex -- intentionally matches ANSI escape sequences.
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}

function trimFixed(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.0$/, "");
}

function isLayoutWidget(type: WidgetType): boolean {
  return (
    type === "custom-text" || type === "separator" || type === "spacer" || type === "flex-separator"
  );
}
