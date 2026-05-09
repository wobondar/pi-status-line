import { describe, expect, it } from "vitest";

import {
  CONFIRM_EXIT_HINT,
  CONFIRM_EXIT_ITEMS,
  confirmExitAction,
  confirmExitShortcut,
} from "../src/ui/confirm-exit.js";

describe("confirm exit menu", () => {
  it("offers save, discard, and return options", () => {
    expect(CONFIRM_EXIT_ITEMS).toEqual([
      "Save & Exit",
      "Exit without saving",
      "Return to config UI",
    ]);
    expect(CONFIRM_EXIT_HINT).toContain("esc/r back");
  });

  it("maps selected menu items to actions", () => {
    expect(confirmExitAction(0)).toBe("save");
    expect(confirmExitAction(1)).toBe("discard");
    expect(confirmExitAction(2)).toBe("return");
    expect(confirmExitAction(99)).toBe("return");
  });

  it("maps shortcuts to actions", () => {
    expect(confirmExitShortcut("s")).toBe("save");
    expect(confirmExitShortcut("x")).toBe("discard");
    expect(confirmExitShortcut("r")).toBe("return");
    expect(confirmExitShortcut("q")).toBeUndefined();
  });
});
