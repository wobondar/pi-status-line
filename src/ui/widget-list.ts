import type { WidgetInstance } from "../types.js";
import { formatWidgetColorOptions, formatWidgetOptions, getDefinition } from "./fields.js";

export const WIDGET_LIST_HINT =
  "↑/↓ select • enter options • a add • c clone • w/s move • d delete • space toggle • r raw • esc back";
export const COLOR_WIDGET_LIST_HINT = "↑/↓ select • pgup/pgdn jump • enter colors • esc back";

export function widgetListCountLabel(total: number, start: number, end: number): string {
  return `${total} widget(s), showing ${rangeLabel(start, end, total)}`;
}

export function widgetListItemLabel(
  index: number,
  widget: WidgetInstance,
  dim: (text: string) => string,
  success: (text: string) => string,
): string {
  const enabled = widget.enabled ? success("on ") : dim("off");
  const indexPad = index < 9 ? " " : "";
  return `${enabled} ${index + 1}.${indexPad} ${getDefinition(widget.type).label} ${dim(formatWidgetOptions(widget))}`;
}

export function widgetListColorItemLabel(
  index: number,
  widget: WidgetInstance,
  dim: (text: string) => string,
  success: (text: string) => string,
): string {
  const enabled = widget.enabled ? success("on ") : dim("off");
  const indexPad = index < 9 ? " " : "";
  return `${enabled} ${index + 1}.${indexPad} ${getDefinition(widget.type).label} ${dim(formatWidgetColorOptions(widget))}`;
}

function rangeLabel(start: number, end: number, total: number): string {
  if (total === 0) return "0-0";
  return `${start + 1}-${end}`;
}
