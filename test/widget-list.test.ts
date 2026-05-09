import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import {
  COLOR_WIDGET_LIST_HINT,
  WIDGET_LIST_HINT,
  widgetListColorItemLabel,
  widgetListCountLabel,
  widgetListItemLabel,
} from "../src/ui/widget-list.js";

describe("widget list UI", () => {
  it("formats count and visible range", () => {
    expect(widgetListCountLabel(10, 0, 5)).toBe("10 widget(s), showing 1-5");
    expect(widgetListCountLabel(0, 0, 0)).toBe("0 widget(s), showing 0-0");
  });

  it("formats widget rows", () => {
    const widget = { ...createWidget("model"), id: "model-abcdef", enabled: true };

    expect(
      widgetListItemLabel(
        0,
        widget,
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("+on + 1.  Model <>");
  });

  it("pads single-digit widget indexes", () => {
    const widget = { ...createWidget("model"), id: "model-abcdef", enabled: true };

    expect(
      widgetListItemLabel(
        0,
        widget,
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("+on + 1.  Model <>");
    expect(
      widgetListItemLabel(
        9,
        widget,
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("+on + 10. Model <>");
  });

  it("formats color widget rows", () => {
    const widget = {
      ...createWidget("model", { fg: "pi:dim" }),
      id: "model-abcdef",
      enabled: true,
    };

    expect(
      widgetListColorItemLabel(
        0,
        widget,
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("+on + 1.  Model <fg=Pi Dim>");
    expect(
      widgetListColorItemLabel(
        9,
        { ...widget, enabled: false },
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("<off> 10. Model <fg=Pi Dim>");
  });

  it("formats disabled widget rows", () => {
    const widget = { ...createWidget("model"), id: "model-abcdef", enabled: false };

    expect(
      widgetListItemLabel(
        1,
        widget,
        (text) => `<${text}>`,
        (text) => `+${text}+`,
      ),
    ).toBe("<off> 2.  Model <>");
  });

  it("documents widget list controls", () => {
    expect(WIDGET_LIST_HINT).toContain("↑/↓ select");
    expect(WIDGET_LIST_HINT).toContain("enter options");
    expect(WIDGET_LIST_HINT).toContain("a add");
    expect(WIDGET_LIST_HINT).toContain("c clone");
    expect(WIDGET_LIST_HINT).toContain("w/s move");
    expect(WIDGET_LIST_HINT).toContain("d delete");
    expect(WIDGET_LIST_HINT).toContain("space toggle");
    expect(WIDGET_LIST_HINT).toContain("r raw");
    expect(WIDGET_LIST_HINT).toContain("esc back");
    expect(WIDGET_LIST_HINT).not.toContain("pgup/pgdn jump");
  });

  it("documents color widget list controls", () => {
    expect(COLOR_WIDGET_LIST_HINT).toContain("↑/↓ select");
    expect(COLOR_WIDGET_LIST_HINT).toContain("pgup/pgdn jump");
    expect(COLOR_WIDGET_LIST_HINT).toContain("enter colors");
    expect(COLOR_WIDGET_LIST_HINT).toContain("esc back");
  });
});
