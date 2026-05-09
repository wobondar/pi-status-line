import type { WidgetInstance } from "../types.js";
import { colorFields, colorFieldValue, getDefinition } from "./fields.js";

export const EDIT_COLORS_TITLE_PREFIX = "Colors /";

export function editColorsTitle(widget: WidgetInstance): string {
  return `${EDIT_COLORS_TITLE_PREFIX} ${getDefinition(widget.type).label}`;
}

export function editColorsFieldRows(widget: WidgetInstance): string[] {
  return colorFields(widget).map((field) => `${field.label}: ${colorFieldValue(widget, field)}`);
}
