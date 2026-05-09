import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

import { applyColors } from "./colors.js";
import type { GetExtensionStatuses } from "./extension-statuses.js";
import { renderWidget } from "./render/widgets.js";
import { separatorText } from "./separators.js";
import type { StatuslineConfig, StatuslineData, WidgetInstance } from "./types.js";

export {
  fishStylePath,
  formatCost,
  formatCount,
  formatDuration,
  formatPiTokenCount,
  formatTokenCount,
  fullHomePath,
  renderWidget,
  shortenPath,
} from "./render/widgets.js";

export interface RenderStatuslineOptions {
  getExtensionStatuses?: GetExtensionStatuses;
  theme?: Theme;
}

export function renderStatuslines(
  config: StatuslineConfig,
  data: StatuslineData,
  width: number,
  options: RenderStatuslineOptions = {},
): string[] {
  if (!config.enabled || width <= 0) return [];
  const lineWidth = effectiveWidth(config, width);
  return config.lines
    .map((line) => renderLine(line, config, data, lineWidth, options))
    .filter((line) => line.trim().length > 0);
}

export function renderStatusline(
  config: StatuslineConfig,
  data: StatuslineData,
  width: number,
  options: RenderStatuslineOptions = {},
): string {
  return renderStatuslines(config, data, width, options)[0] ?? "";
}

export function padRight(left: string, right: string, width: number): string {
  const spaces = Math.max(1, width - visibleWidth(left) - visibleWidth(right));
  return truncateToWidth(`${left}${" ".repeat(spaces)}${right}`, width, "…");
}

interface RenderedSegment {
  widget: WidgetInstance;
  segment: string;
}

function renderLine(
  line: readonly WidgetInstance[],
  config: StatuslineConfig,
  data: StatuslineData,
  width: number,
  options: RenderStatuslineOptions,
): string {
  const rendered = line
    .filter((widget) => widget.enabled)
    .map((widget) => ({ widget, segment: renderWidget(widget, config, data, options) }));

  const flexIndex = rendered.findIndex((entry) => entry.widget.type === "flex-separator");
  if (flexIndex === -1) {
    return truncateToWidth(joinSegments(rendered, config), width, "…");
  }

  const left = joinSegments(rendered.slice(0, flexIndex), config);
  const right = joinSegments(rendered.slice(flexIndex + 1), config);
  return right ? padRight(left, right, width) : truncateToWidth(left, width, "…");
}

function effectiveWidth(config: StatuslineConfig, width: number): number {
  if (config.terminal.widthMode === "full-minus-40") return Math.max(1, width - 40);
  return width;
}

function joinSegments(entries: readonly RenderedSegment[], config: StatuslineConfig): string {
  const segments = entries.filter((entry) => entry.segment.length > 0);
  if (segments.length === 0) return "";

  let output = segments[0]?.segment ?? "";
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const current = segments[index];
    if (!previous || !current) continue;
    if (previous.widget.type !== "separator" && current.widget.type !== "separator") {
      output += applyColors(
        separatorText(config.separator),
        config.separatorFg,
        config.separatorBg,
        false,
        config.terminal.colorLevel,
      );
    }
    output += current.segment;
  }
  return output;
}
