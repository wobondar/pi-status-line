import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import { editColorsFieldRows, editColorsTitle } from "../src/ui/edit-colors.js";

describe("edit colors UI", () => {
  it("formats title", () => {
    expect(editColorsTitle(createWidget("model"))).toBe("Colors / Model");
  });

  it("formats color field rows", () => {
    expect(editColorsFieldRows(createWidget("model", { fg: "blue", bold: true }))).toContain(
      "Foreground: Blue",
    );
  });
});
