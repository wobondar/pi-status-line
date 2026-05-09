import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import {
  colorFieldValue,
  colorFields,
  fieldValue,
  fieldsForWidget,
  formatWidgetColorOptions,
  formatWidgetOptions,
  getBooleanField,
  getDefinition,
  getNumberField,
  getTextField,
} from "../src/ui/fields.js";
import type { ColorOptionField, EditField, OptionField } from "../src/ui/model.js";

const optionField = (id: EditField, kind: OptionField["kind"] = "text"): OptionField => ({
  id,
  label: id,
  kind,
});
const colorField = (id: ColorOptionField["id"]): ColorOptionField => ({
  id,
  label: id,
  kind: "color",
});

describe("field helpers coverage", () => {
  it("builds fields for special widget families", () => {
    expect(fieldsForWidget(createWidget("custom-text")).map((field) => field.id)).toEqual([
      "enabled",
      "text",
    ]);
    expect(fieldsForWidget(createWidget("event")).map((field) => field.id)).toContain("widgetId");
    expect(fieldsForWidget(createWidget("external-status")).map((field) => field.id)).toEqual([
      "enabled",
      "externalStatusKey",
      "trimValue",
      "preserveTrimStyles",
      "raw",
      "hideWhenEmpty",
      "icon",
    ]);
    expect(fieldsForWidget(createWidget("spacer")).map((field) => field.id)).toEqual([
      "enabled",
      "width",
    ]);
    expect(fieldsForWidget(createWidget("cache-read")).map((field) => field.id)).toContain(
      "hideWhenZero",
    );
    expect(
      fieldsForWidget(createWidget("git-branch", { gitBranchDisplayStyle: "custom" })).map(
        (field) => field.id,
      ),
    ).toEqual([
      "enabled",
      "raw",
      "hideWhenEmpty",
      "icon",
      "text",
      "gitBranchDisplayStyle",
      "surroundLeft",
      "surroundRight",
    ]);
    expect(fieldsForWidget(createWidget("git-diff")).map((field) => field.id)).toContain(
      "gitDiffMode",
    );
    expect(fieldsForWidget(createWidget("model")).map((field) => field.id)).toContain(
      "showProvider",
    );
  });

  it("formats option, text, number, boolean, and color values", () => {
    const widget = createWidget("context", {
      raw: true,
      hideWhenZero: true,
      contextConditionalColors: true,
      contextWarningPercent: 75,
      contextDangerPercent: 95,
      warningFg: "ansi256:220",
      warningBg: "ansi256:230",
      dangerFg: "pi:error",
      dangerBg: "red",
      tokenFormatStyle: "compact",
      icon: "ctx=",
    });

    expect(fieldValue(widget, optionField("enabled", "boolean"))).toBe("on");
    expect(fieldValue(widget, optionField("contextWarningPercent", "number"))).toBe("75");
    expect(fieldValue(widget, optionField("tokenFormatStyle", "choice"))).toBe("Compact");
    expect(colorFields(widget).map((field) => field.id)).toContain("dangerBgAnsi");
    expect(colorFieldValue(widget, colorField("bold"))).toBe("off");
    expect(colorFieldValue(widget, colorField("warningFg"))).toBe("ANSI256 220");
    expect(colorFieldValue(widget, colorField("warningFgAnsi"))).toBe("220");
    expect(colorFieldValue(widget, colorField("warningBgAnsi"))).toBe("230");
    expect(colorFieldValue(widget, colorField("dangerFg"))).toBe("Pi Error");
    expect(colorFieldValue(widget, colorField("dangerBgAnsi"))).toBe("0");
    expect(colorFieldValue(widget, colorField("fg"))).toBe("Blue");
    expect(colorFieldValue(widget, colorField("bg"))).toBe("Default");
    expect(colorFieldValue(widget, colorField("fgAnsi"))).toBe("0");
    expect(colorFieldValue(widget, colorField("bgAnsi"))).toBe("0");
    expect(colorFieldValue(widget, colorField("warningBg"))).toBe("ANSI256 230");
    expect(colorFieldValue(widget, colorField("dangerBg"))).toBe("Red");
    expect(colorFieldValue(widget, { id: "bold", label: "x", kind: "ansi" })).toBe("off");

    expect(getBooleanField(widget, "hideWhenZero")).toBe(true);
    expect(getBooleanField(widget, "showProvider")).toBe(false);
    expect(getBooleanField(widget, "showSubscription")).toBe(false);
    expect(getBooleanField(widget, "contextConditionalColors")).toBe(true);
    expect(getBooleanField(createWidget("external-status"), "preserveTrimStyles")).toBe(true);
    expect(getBooleanField(widget, "width")).toBe(false);
    expect(getNumberField(widget, "contextDangerPercent")).toBe(95);
    expect(getNumberField(createWidget("spacer", { width: 4 }), "width")).toBe(4);
    expect(getNumberField(createWidget("external-status", { trimValue: 2 }), "trimValue")).toBe(2);
    expect(getNumberField(createWidget("model"), "width")).toBeUndefined();
    expect(getTextField(widget, "icon")).toBe("ctx=");
    expect(getTextField(createWidget("event", { widgetId: "fast" }), "widgetId")).toBe("fast");
    expect(
      getTextField(
        createWidget("external-status", { externalStatusKey: "build" }),
        "externalStatusKey",
      ),
    ).toBe("build");
    expect(getTextField(createWidget("git-branch", { surroundLeft: "[" }), "surroundLeft")).toBe(
      "[",
    );
    expect(getTextField(createWidget("git-branch", { surroundRight: "]" }), "surroundRight")).toBe(
      "]",
    );
    expect(getTextField(widget, "width")).toBe("");
  });

  it("summarizes widget options", () => {
    const customGitBranchOptions = formatWidgetOptions(
      createWidget("git-branch", {
        raw: true,
        hideWhenEmpty: true,
        gitBranchDisplayStyle: "custom",
        surroundLeft: "[",
        surroundRight: "]",
      }),
    );
    expect(customGitBranchOptions).toContain("display=custom");
    expect(customGitBranchOptions).not.toContain("left='['");
    expect(customGitBranchOptions).not.toContain("right=']'");
    expect(
      formatWidgetOptions(createWidget("git-branch", { gitBranchDisplayStyle: "round-brackets" })),
    ).toContain("display=brackets");
    expect(formatWidgetOptions(createWidget("tokens", { tokenFormatStyle: "compact" }))).toContain(
      "format=Compact",
    );
    expect(
      formatWidgetOptions(
        createWidget("cost", { costFormatStyle: "compact", showSubscription: true }),
      ),
    ).toContain("show-sub");
    expect(formatWidgetOptions(createWidget("context-bar", { contextBarMode: "short" }))).toContain(
      "display=Short bar",
    );
    expect(
      formatWidgetOptions(createWidget("context", { contextConditionalColors: true })),
    ).toContain("with-colors");
    expect(formatWidgetOptions(createWidget("git-diff", { gitDiffMode: "compact" }))).toContain(
      "display=Compact (+n,-n)",
    );
    expect(formatWidgetOptions(createWidget("cwd", { segments: 3 }))).toContain("segments=3");
    expect(formatWidgetOptions(createWidget("cwd", { cwdDisplayStyle: "full-home" }))).toContain(
      "display=full-path",
    );
    expect(formatWidgetOptions(createWidget("cwd", { cwdDisplayStyle: "fish" }))).toContain(
      "display=fish-style",
    );
    expect(formatWidgetOptions(createWidget("external-status", { trimValue: 2 }))).toContain(
      "trim=2",
    );
    expect(formatWidgetOptions(createWidget("spacer", { width: 3 }))).toContain("width=3");
    expect(
      formatWidgetColorOptions(
        createWidget("custom-text", { text: "hello", fg: "pi:success", bold: true }),
      ),
    ).toContain("text='hello'");
    expect(
      formatWidgetColorOptions(createWidget("separator", { separator: "custom", text: "/" })),
    ).toContain("text='/'");
    expect(
      formatWidgetColorOptions(createWidget("session-name", { hideWhenEmpty: false, text: "-" })),
    ).toContain("text='-'");
    expect(
      formatWidgetColorOptions(createWidget("external-status", { externalStatusKey: "build" })),
    ).toContain("status=build");
  });

  it("falls back for unknown definitions", () => {
    expect(getDefinition("model").label).toBe("Model");
    expect(getDefinition("missing" as never).label).toBe("Model");
  });
});
