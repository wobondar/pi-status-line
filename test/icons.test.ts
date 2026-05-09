import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import { widgetLabel } from "../src/render/icons.js";

describe("widget icons", () => {
  it("uses custom icons before icon mode labels", () => {
    expect(widgetLabel(createWidget("model", { icon: "M" }), "emoji")).toBe("M");
    expect(widgetLabel(createWidget("model"), "text")).toBe("model");
  });
});
