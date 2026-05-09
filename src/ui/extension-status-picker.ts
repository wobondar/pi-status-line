import { truncateToWidth } from "@earendil-works/pi-tui";

import { STATUS_KEY } from "../constants.js";
import {
  allExtensionStatusEntries,
  type ExtensionStatusRowConfig,
  type GetExtensionStatuses,
} from "../extension-statuses.js";
import type { WidgetInstance } from "../types.js";
import { fieldsForWidget, fieldValue } from "./fields.js";
import type { OptionField } from "./model.js";

export function statusKeyPickerLines(
  widget: WidgetInstance,
  getExtensionStatuses: GetExtensionStatuses,
  rowConfig: ExtensionStatusRowConfig,
  selectedField: number,
  width: number,
  line: (content: string, width: number) => string,
  menuLine: (selected: boolean, content: string, width: number) => string,
  dim: (text: string) => string,
): string[] {
  const fields = fieldsForWidget(widget);
  const lines = fields.map((field, index) =>
    menuLine(index === selectedField, `${field.label}: ${fieldValue(widget, field)}`, width),
  );

  if (fields[selectedField]?.id !== "externalStatusKey") return lines;

  const entries = allExtensionStatusEntries(getExtensionStatuses(), rowConfig, STATUS_KEY);

  lines.push(line("", width), line(dim("Available extension statuses:"), width));
  if (entries.length === 0) {
    lines.push(
      line(dim("No extension statuses are currently available. Type a key manually."), width),
    );
    return lines;
  }

  for (const entry of entries) {
    lines.push(
      line(
        `${dim(entry.key)} ${truncateToWidth(entry.value, Math.max(1, width - entry.key.length - 4), "…")}`,
        width,
      ),
    );
  }
  return lines;
}

export function cycleExternalStatusKey(
  widget: WidgetInstance,
  getExtensionStatuses: GetExtensionStatuses,
  rowConfig: ExtensionStatusRowConfig,
  delta: number,
): boolean {
  const keys = allExtensionStatusEntries(getExtensionStatuses(), rowConfig, STATUS_KEY).map(
    (entry) => entry.key,
  );
  if (keys.length === 0) return false;
  const current = widget.options.externalStatusKey ?? "";
  const currentIndex = keys.indexOf(current);
  const nextIndex =
    currentIndex === -1
      ? delta > 0
        ? 0
        : keys.length - 1
      : (currentIndex + delta + keys.length) % keys.length;
  widget.options.externalStatusKey = keys[nextIndex] ?? current;
  return true;
}

export function isExternalStatusKeyField(field: OptionField | undefined): boolean {
  return field?.id === "externalStatusKey";
}
