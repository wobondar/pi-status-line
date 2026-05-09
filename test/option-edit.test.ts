import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import {
  applySimpleOptionField,
  getBooleanField,
  getNumberField,
  setTextField,
} from "../src/ui/option-edit.js";
import type { OptionField } from "../src/ui/model.js";

const field = (id: OptionField["id"], kind: OptionField["kind"], extra = {}): OptionField => ({
  id,
  label: id,
  kind,
  ...extra,
});

describe("option field editing", () => {
  it("toggles widget enabled state", () => {
    const widget = createWidget("model");

    expect(applySimpleOptionField(widget, field("enabled", "boolean"), 1)).toBe("changed");
    expect(widget.enabled).toBe(false);
  });

  it("toggles boolean options", () => {
    const widget = createWidget("model");
    const cost = createWidget("cost");
    const context = createWidget("context");
    const external = createWidget("external-status");

    const cached = createWidget("cache-read");

    applySimpleOptionField(widget, field("raw", "boolean"), 1);
    applySimpleOptionField(widget, field("hideWhenEmpty", "boolean"), 1);
    applySimpleOptionField(widget, field("showProvider", "boolean"), 1);
    applySimpleOptionField(cached, field("hideWhenZero", "boolean"), 1);
    applySimpleOptionField(cost, field("showSubscription", "boolean"), 1);
    applySimpleOptionField(external, field("preserveTrimStyles", "boolean"), 1);
    applySimpleOptionField(context, field("contextConditionalColors", "boolean"), 1);

    expect(getBooleanField(widget, "raw")).toBe(true);
    expect(getBooleanField(widget, "hideWhenEmpty")).toBe(true);
    expect(getBooleanField(widget, "showProvider")).toBe(true);
    expect(getBooleanField(cached, "hideWhenZero")).toBe(true);
    expect(getBooleanField(cost, "showSubscription")).toBe(true);
    expect(getBooleanField(external, "preserveTrimStyles")).toBe(false);
    expect(getBooleanField(context, "contextConditionalColors")).toBe(true);
    expect(getBooleanField(widget, "width")).toBe(false);
  });

  it("clamps number options", () => {
    const widget = createWidget("cwd", { segments: 2 });
    const context = createWidget("context", {
      contextWarningPercent: 70,
      contextDangerPercent: 90,
    });
    const spacer = createWidget("spacer", { width: 2 });
    const external = createWidget("external-status", { trimValue: 1 });

    applySimpleOptionField(widget, field("segments", "number", { min: 1, max: 3 }), 10);
    applySimpleOptionField(
      context,
      field("contextWarningPercent", "number", { min: 0, max: 100 }),
      40,
    );

    applySimpleOptionField(spacer, field("width", "number", { min: 1, max: 3 }), -10);
    applySimpleOptionField(
      context,
      field("contextDangerPercent", "number", { min: 0, max: 100 }),
      -100,
    );
    applySimpleOptionField(external, field("trimValue", "number", { min: 0, max: 10 }), 20);

    expect(getNumberField(widget, "segments")).toBe(3);
    expect(getNumberField(spacer, "width")).toBe(1);
    expect(getNumberField(context, "contextWarningPercent")).toBe(100);
    expect(getNumberField(context, "contextDangerPercent")).toBe(0);
    expect(getNumberField(external, "trimValue")).toBe(10);
    expect(getNumberField(context, "raw")).toBeUndefined();
  });

  it("cycles separator options", () => {
    const widget = createWidget("separator", { separator: "pipe" });

    applySimpleOptionField(widget, field("separator", "choice"), 1);

    expect(widget.options.separator).toBe("space");
  });

  it("cycles cwd display styles", () => {
    const widget = createWidget("cwd");

    applySimpleOptionField(widget, field("cwdDisplayStyle", "choice"), 1);

    expect(widget.options.cwdDisplayStyle).toBe("full-home");
  });

  it("cycles context bar display modes", () => {
    const widget = createWidget("context-bar");

    applySimpleOptionField(widget, field("contextBarMode", "choice"), 1);

    expect(widget.options.contextBarMode).toBe("short");
  });

  it("cycles git branch display styles", () => {
    const widget = createWidget("git-branch");

    applySimpleOptionField(widget, field("gitBranchDisplayStyle", "choice"), 1);

    expect(widget.options.gitBranchDisplayStyle).toBe("round-brackets");
  });

  it("cycles token and cost format styles", () => {
    const tokens = createWidget("tokens");
    const cost = createWidget("cost");

    applySimpleOptionField(tokens, field("tokenFormatStyle", "choice"), 1);
    applySimpleOptionField(cost, field("costFormatStyle", "choice"), 1);

    expect(tokens.options.tokenFormatStyle).toBe("compact");
    expect(cost.options.costFormatStyle).toBe("compact");
  });

  it("cycles git diff display modes", () => {
    const widget = createWidget("git-diff");

    applySimpleOptionField(widget, field("gitDiffMode", "choice"), 1);

    expect(widget.options.gitDiffMode).toBe("compact");
  });

  it("signals external status keys for caller-specific handling", () => {
    expect(
      applySimpleOptionField(
        createWidget("external-status"),
        field("externalStatusKey", "text"),
        1,
      ),
    ).toBe("external-status-key");
  });

  it("sets text fields", () => {
    const widget = createWidget("event");
    const gitBranch = createWidget("git-branch");

    const text = createWidget("custom-text");
    const external = createWidget("external-status");

    setTextField(widget, "widgetId", "fast_mode");
    setTextField(widget, "icon", "*");
    setTextField(text, "text", "hello");
    setTextField(external, "externalStatusKey", "build");
    setTextField(gitBranch, "surroundLeft", "(");
    setTextField(gitBranch, "surroundRight", ")");

    expect(widget.options.widgetId).toBe("fast_mode");
    expect(widget.options.icon).toBe("*");
    expect(text.options.text).toBe("hello");
    expect(external.options.externalStatusKey).toBe("build");
    expect(gitBranch.options.surroundLeft).toBe("(");
    expect(gitBranch.options.surroundRight).toBe(")");
  });

  it("returns unchanged for fields without simple handling", () => {
    expect(applySimpleOptionField(createWidget("model"), field("icon", "text"), 1)).toBe(
      "unchanged",
    );
  });
});
