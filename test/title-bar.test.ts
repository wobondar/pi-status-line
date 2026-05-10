import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";

import { CONFIG_TITLE_TEXT, configTitleBarParts, previewTitleParts } from "../src/ui/title-bar.js";
import { VERSION } from "../src/version.js";
import { stripAnsi } from "./helpers/ansi.js";

describe("config title bar", () => {
  it("renders the animated title text", () => {
    const parts = configTitleBarParts(80, (text) => text, 0);

    const plainTitle = stripAnsi(parts.title);
    expect(plainTitle).toContain("p");
    expect(plainTitle).toContain("configuration");
  });

  it("adds a truncated version suffix when there is room", () => {
    const parts = configTitleBarParts(80, (text) => text, 0);

    expect(parts.title).toContain(`| v${VERSION}`);
  });

  it("omits version suffix on narrow widths", () => {
    const parts = configTitleBarParts(10, (text) => text, 0);

    expect(parts.title).not.toContain(`| v${VERSION}`);
  });

  it("right-aligns status with a border-colored separator line when provided", () => {
    const innerWidth = 80;
    const parts = configTitleBarParts(
      innerWidth,
      (text) => text,
      0,
      "Unsaved",
      (text) => `\x1b[34m${text}\x1b[39m`,
    );
    const plainTitle = stripAnsi(parts.title);
    const beforeStatus = plainTitle.slice(0, plainTitle.indexOf(" Unsaved "));

    expect(plainTitle).toContain(" Unsaved ");
    expect(beforeStatus).toContain("─");
    expect(parts.title).toContain("\x1b[34m─");
    expect(parts.rightPad).toBe(1);
    expect(visibleWidth(parts.title) + parts.rightPad).toBe(innerWidth - 1);
  });

  it("keeps title plus padding within the requested title area", () => {
    const innerWidth = 80;
    const parts = configTitleBarParts(innerWidth, (text) => text, 0);

    expect(visibleWidth(parts.title) + parts.rightPad).toBe(innerWidth - 1);
  });

  it("calculates preview title padding", () => {
    const parts = previewTitleParts(20);

    expect(parts.title).toBe(" Preview ");
    expect(visibleWidth(parts.title) + parts.rightPad).toBe(20);
  });

  it("exports the title text in one place", () => {
    expect(CONFIG_TITLE_TEXT).toBe(" pi-footer configuration ");
  });
});
