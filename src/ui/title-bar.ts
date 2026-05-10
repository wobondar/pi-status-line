import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

import { VERSION } from "../version.js";
import { retroText } from "./gradient.js";

export const CONFIG_TITLE_TEXT = " pi-footer configuration ";

export interface ConfigTitleBarParts {
  title: string;
  rightPad: number;
}

export interface PreviewTitleParts {
  title: string;
  rightPad: number;
}

export function previewTitleParts(innerWidth: number): PreviewTitleParts {
  const title = truncateToWidth(" Preview ", innerWidth, "…");
  return {
    title,
    rightPad: Math.max(0, innerWidth - visibleWidth(title)),
  };
}

export function configTitleBarParts(
  innerWidth: number,
  dim: (text: string) => string,
  now = Date.now(),
  status = "",
  border: (text: string) => string = (text) => text,
): ConfigTitleBarParts {
  const titleWidth = Math.max(1, innerWidth - 1);
  const decoratedStatus = status ? ` ${status} ` : "";
  const statusWidth = visibleWidth(decoratedStatus);
  const contentWidth = statusWidth > 0 ? Math.max(1, titleWidth - 1) : titleWidth;
  const reserveForStatus = statusWidth > 0 ? statusWidth + 1 : 0;
  const leftWidth = Math.max(1, contentWidth - reserveForStatus);
  const suffixWidth = Math.max(0, leftWidth - visibleWidth(CONFIG_TITLE_TEXT));
  const suffix = suffixWidth > 0 ? dim(truncateToWidth(`| v${VERSION} `, suffixWidth, "…")) : "";
  const left = truncateToWidth(retroText(CONFIG_TITLE_TEXT, now) + suffix, leftWidth, "…");
  if (statusWidth === 0) {
    return {
      title: left,
      rightPad: Math.max(0, titleWidth - visibleWidth(left)),
    };
  }
  const separator = border(
    "─".repeat(Math.max(1, contentWidth - visibleWidth(left) - statusWidth)),
  );
  return {
    title: `${left}${separator}${decoratedStatus}`,
    rightPad: 1,
  };
}
