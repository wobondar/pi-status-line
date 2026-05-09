import { describe, expect, it } from "vitest";

import { MAIN_MENU_HINT, MAIN_MENU_ITEMS, mainMenuAction } from "../src/ui/main-menu.js";

describe("main menu", () => {
  it("keeps the expected item order", () => {
    expect(MAIN_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Edit lines",
      "Edit colors",
      "Terminal Options",
      "Global Overrides",
      "Pi extensions",
      "Save & Exit",
      "Exit without saving",
    ]);
  });

  it("maps menu selections to actions", () => {
    expect(mainMenuAction(0)).toEqual({ type: "view", view: "line-list" });
    expect(mainMenuAction(1)).toEqual({ type: "view", view: "color-line-list" });
    expect(mainMenuAction(2)).toEqual({ type: "view", view: "terminal" });
    expect(mainMenuAction(3)).toEqual({ type: "view", view: "global" });
    expect(mainMenuAction(4)).toEqual({ type: "view", view: "extension-status-row" });
    expect(mainMenuAction(5)).toEqual({ type: "save-exit" });
    expect(mainMenuAction(6)).toEqual({ type: "discard-exit" });
  });

  it("uses discard as a safe action for invalid indexes", () => {
    expect(mainMenuAction(-1)).toEqual({ type: "discard-exit" });
    expect(mainMenuAction(99)).toEqual({ type: "discard-exit" });
  });

  it("documents the global save shortcut", () => {
    expect(MAIN_MENU_HINT).toContain("ctrl+s save");
  });
});
