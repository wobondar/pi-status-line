import type { StatuslineConfig, WidgetType } from "./types.js";

export function isContextWidget(type: WidgetType): boolean {
  return (
    type === "context-window" ||
    type === "context-length" ||
    type === "context" ||
    type === "context-remaining" ||
    type === "context-bar"
  );
}

export function isGitWidget(type: WidgetType): boolean {
  return type.startsWith("git-");
}

export function hasEnabledGitWidgets(config: Pick<StatuslineConfig, "lines">): boolean {
  return config.lines.some((line) =>
    line.some((widget) => widget.enabled && isGitWidget(widget.type)),
  );
}

export function isTokenFormatWidget(type: WidgetType): boolean {
  return (
    type === "tokens" ||
    type === "input-tokens" ||
    type === "output-tokens" ||
    type === "total-tokens" ||
    type === "cache-read" ||
    type === "cache-write" ||
    type === "context-window" ||
    type === "context-length" ||
    type === "context-bar" ||
    type === "input-speed" ||
    type === "output-speed" ||
    type === "total-speed"
  );
}
