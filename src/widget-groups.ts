import type { WidgetType } from "./types.js";

export function isContextWidget(type: WidgetType): boolean {
  return (
    type === "context-window" ||
    type === "context-length" ||
    type === "context" ||
    type === "context-remaining" ||
    type === "context-bar"
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
