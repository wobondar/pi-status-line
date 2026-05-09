import { highlightCode } from "@earendil-works/pi-coding-agent";

import { UPDATE_EVENT_WIDGET_EVENT } from "../event-widgets.js";
import type { WidgetInstance } from "../types.js";

export function eventWidgetUsageLines(
  widget: WidgetInstance,
  width: number,
  line: (content: string, width: number) => string,
  dim: (text: string) => string,
): string[] {
  return [
    line("", width),
    line(dim("Send events with a value:"), width),
    line(eventWidgetUsageCode(widget.options.widgetId ?? "", "Value"), width),
    line("", width),
    line(dim("Send events to remove status:"), width),
    line(eventWidgetUsageCode(widget.options.widgetId ?? "", "NULL"), width),
  ];
}

export function eventWidgetUsageCode(widgetId: string, value: string): string {
  const v = value === "NULL" ? "null" : `"${value}"`;
  return (
    highlightCode(
      `pi.events.emit(${JSON.stringify(UPDATE_EVENT_WIDGET_EVENT)}, { "widgetId": ${JSON.stringify(widgetId)}, "value": ${v} });`,
      "typescript",
    )[0] ?? ""
  );
}
