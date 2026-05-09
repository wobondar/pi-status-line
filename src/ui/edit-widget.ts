import type { WidgetInstance } from "../types.js";
import { fieldsForWidget, fieldValue, getDefinition } from "./fields.js";

export const EDIT_WIDGET_HINT = "↑/↓ field • ←/→ change • type text • backspace delete • esc back";

export function editWidgetTitle(widget: WidgetInstance): string {
  return `Edit ${getDefinition(widget.type).label}`;
}

export function editWidgetFieldRows(widget: WidgetInstance): string[] {
  return fieldsForWidget(widget).map((field) => `${field.label}: ${fieldValue(widget, field)}`);
}
