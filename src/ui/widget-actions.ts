import { cloneWidget } from "../config.js";
import type { WidgetInstance } from "../types.js";

export function addLineAfter(lines: WidgetInstance[][], selectedLine: number): number {
  lines.splice(selectedLine + 1, 0, []);
  return selectedLine + 1;
}

export function cloneLineAfter(lines: WidgetInstance[][], selectedLine: number): number {
  const line = lines[selectedLine] ?? [];
  lines.splice(selectedLine + 1, 0, line.map(cloneWidget));
  return selectedLine + 1;
}

export function deleteLine(lines: WidgetInstance[][], selectedLine: number): number {
  if (lines.length <= 1) return selectedLine;
  lines.splice(selectedLine, 1);
  return Math.min(selectedLine, lines.length - 1);
}

export function moveLine(lines: WidgetInstance[][], selectedLine: number, delta: number): number {
  const next = selectedLine + delta;
  if (next < 0 || next >= lines.length) return selectedLine;
  const [line] = lines.splice(selectedLine, 1);
  if (!line) return selectedLine;
  lines.splice(next, 0, line);
  return next;
}

export function moveWidget(line: WidgetInstance[], selectedWidget: number, delta: number): number {
  const next = selectedWidget + delta;
  if (next < 0 || next >= line.length) return selectedWidget;
  const [widget] = line.splice(selectedWidget, 1);
  if (!widget) return selectedWidget;
  line.splice(next, 0, widget);
  return next;
}

export function cloneSelectedWidget(line: WidgetInstance[], selectedWidget: number): number {
  const widget = line[selectedWidget];
  if (!widget) return selectedWidget;
  line.splice(selectedWidget + 1, 0, cloneWidget(widget));
  return selectedWidget + 1;
}

export function deleteSelectedWidget(line: WidgetInstance[], selectedWidget: number): number {
  if (line.length === 0) return selectedWidget;
  line.splice(selectedWidget, 1);
  return Math.max(0, Math.min(selectedWidget, line.length - 1));
}

export function toggleWidgetEnabled(widget: WidgetInstance | undefined): boolean {
  if (!widget) return false;
  widget.enabled = !widget.enabled;
  return true;
}

export function isLayoutWidget(widget: WidgetInstance): boolean {
  return (
    widget.type === "custom-text" ||
    widget.type === "separator" ||
    widget.type === "spacer" ||
    widget.type === "flex-separator"
  );
}

export function toggleWidgetRaw(widget: WidgetInstance | undefined): boolean {
  if (!widget || isLayoutWidget(widget)) return false;
  widget.options.raw = !(widget.options.raw ?? false);
  return true;
}
