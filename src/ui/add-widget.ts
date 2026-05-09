import { WIDGET_DEFINITIONS } from "../types.js";
import type { WidgetDefinition } from "./model.js";

export function addWidgetHint(filter: string): string {
  return `type to filter • ↑/↓ select • pgup/pgdn jump • enter add • esc back • filter: ${filter || "(none)"}`;
}

export function addWidgetCountLabel(total: number, start: number, visibleLength: number): string {
  return `${total} result(s), showing ${start + 1}-${Math.min(total, start + visibleLength)}`;
}

export function filterWidgetDefinitions(filterValue: string): WidgetDefinition[] {
  const filter = filterValue.trim();
  if (!filter) return [...WIDGET_DEFINITIONS];
  return WIDGET_DEFINITIONS.filter((definition) =>
    `${definition.category} ${definition.label} ${definition.type}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
}

export function addWidgetItemLabel(
  definition: WidgetDefinition,
  dim: (text: string) => string,
): string {
  return `${definition.category} / ${definition.label} ${dim(definition.description)}`;
}
