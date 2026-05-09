import { describe, expect, it } from "vitest";

import { createWidget } from "../src/config.js";
import { editWidgetFieldRows, EDIT_WIDGET_HINT, editWidgetTitle } from "../src/ui/edit-widget.js";

describe("edit widget UI", () => {
  it("formats edit title", () => {
    expect(editWidgetTitle(createWidget("model"))).toBe("Edit Model");
  });

  it("formats field rows", () => {
    expect(editWidgetFieldRows(createWidget("event", { widgetId: "fast_mode" }))).toContain(
      "Widget ID: fast_mode",
    );
    expect(editWidgetFieldRows(createWidget("cwd", { cwdDisplayStyle: "full-home" }))).toContain(
      "Display style: Full path (~ home)",
    );
    expect(
      editWidgetFieldRows(
        createWidget("git-branch", {
          gitBranchDisplayStyle: "custom",
          surroundLeft: "(",
          surroundRight: ")",
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        "Display style: Custom surround text",
        "Surround left: (",
        "Surround right: )",
      ]),
    );
    expect(
      editWidgetFieldRows(
        createWidget("context", {
          contextConditionalColors: true,
          contextWarningPercent: 60,
          contextDangerPercent: 80,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        "Conditional colors: on",
        "Warning zone threshold: 60",
        "Danger zone threshold: 80",
      ]),
    );
    expect(editWidgetFieldRows(createWidget("tokens", { tokenFormatStyle: "compact" }))).toContain(
      "Token format: Compact",
    );
    expect(
      editWidgetFieldRows(
        createWidget("cost", { costFormatStyle: "compact", showSubscription: true }),
      ),
    ).toEqual(expect.arrayContaining(["Cost format: Compact", "Show subscription: on"]));
  });

  it("hides conditional fields until their display modes are enabled", () => {
    expect(editWidgetFieldRows(createWidget("git-branch"))).not.toContain("Surround left: (empty)");
    expect(editWidgetFieldRows(createWidget("context"))).not.toContain(
      "Warning zone threshold: 70",
    );
  });

  it("documents edit controls", () => {
    expect(EDIT_WIDGET_HINT).toContain("backspace delete");
  });
});
