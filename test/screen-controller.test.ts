import { describe, expect, it } from "vitest";

import { DEFAULT_CONFIG } from "../src/config.js";
import type { ScreenContext } from "../src/ui/screen-context.js";
import { ScreenController } from "../src/ui/screen-controller.js";
import { ScreenRender } from "../src/ui/screen-render.js";
import { createScreenState } from "../src/ui/screen-state.js";
import { Controller } from "../src/ui/screens/controller.js";
import type { UiTheme } from "../src/ui/theme.js";

const theme: UiTheme = {
  accent: (text) => text,
  dim: (text) => text,
  muted: (text) => text,
  success: (text) => text,
  warning: (text) => text,
  error: (text) => text,
  bold: (text) => text,
  selected: (text) => text,
  border: (text) => text,
  previewTitle: (text) => text,
  configStateLabel: (_status, label) => label,
};

function context(): ScreenContext {
  return {
    state: createScreenState(DEFAULT_CONFIG),
    theme,
    getExtensionStatuses: () => new Map(),
    currentLine: () => [],
    currentWidget: () => undefined,
    visibleRowCount: () => 10,
    show(view) {
      this.state.view = view;
    },
    emitChange: () => {},
    save: () => {},
    exitWithoutSaving: () => {},
  };
}

describe("ScreenController", () => {
  it("delegates render and input to current screen", () => {
    class TestScreen extends Controller {
      input = "";

      renderScreen(width: number): string[] {
        return [`${this.input}:${width}`];
      }

      handleInput(data: string): void {
        this.input = data;
      }
    }

    const ctx = context();
    const controller = new ScreenController(ctx);
    controller.register("main", new TestScreen(ctx, new ScreenRender(theme)));

    controller.handleInput("a");

    expect(controller.renderScreen(80)).toEqual(["a:80"]);
  });

  it("throws for missing screens", () => {
    const ctx = context();
    const controller = new ScreenController(ctx);

    expect(() => controller.renderScreen(80)).toThrow("No screen registered for view: main");
  });
});
