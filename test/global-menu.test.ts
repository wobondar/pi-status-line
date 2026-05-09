import { describe, expect, it } from "vitest";

import { DEFAULT_CONFIG } from "../src/config.js";
import {
  applyGlobalMenuAction,
  applyGlobalMenuBackspace,
  applyGlobalMenuTextInput,
  GLOBAL_MENU_ACTIONS,
  GLOBAL_MENU_HINT,
  globalMenuAction,
  globalMenuFields,
} from "../src/ui/global-menu.js";

describe("global menu", () => {
  it("keeps actions in field order", () => {
    expect(GLOBAL_MENU_ACTIONS).toEqual([
      "toggle-enabled",
      "preset",
      "separator",
      "separator-fg",
      "separator-bg",
      "separator-fg-ansi",
      "separator-bg-ansi",
      "icon-mode",
      "minimalist",
      "reset",
    ]);
  });

  it("renders fields from config", () => {
    expect(globalMenuFields({ ...DEFAULT_CONFIG, enabled: false, minimalist: true })).toEqual([
      "Enabled: off",
      `Preset: ${DEFAULT_CONFIG.preset}`,
      `Separator: ${DEFAULT_CONFIG.separator}`,
      "Separator foreground: Default",
      "Separator background: Default",
      "Custom ANSI256 separator foreground: 0",
      "Custom ANSI256 separator background: 0",
      "Icons: Emoji",
      "Minimalist mode: on",
      "Reset to defaults",
    ]);
  });

  it("maps menu selections to actions", () => {
    expect(globalMenuAction(0)).toBe("toggle-enabled");
    expect(globalMenuAction(1)).toBe("preset");
    expect(globalMenuAction(2)).toBe("separator");
    expect(globalMenuAction(3)).toBe("separator-fg");
    expect(globalMenuAction(4)).toBe("separator-bg");
    expect(globalMenuAction(5)).toBe("separator-fg-ansi");
    expect(globalMenuAction(6)).toBe("separator-bg-ansi");
    expect(globalMenuAction(7)).toBe("icon-mode");
    expect(globalMenuAction(8)).toBe("minimalist");
    expect(globalMenuAction(9)).toBe("reset");
  });

  it("uses reset as a safe action for invalid indexes", () => {
    expect(globalMenuAction(-1)).toBe("reset");
    expect(globalMenuAction(99)).toBe("reset");
  });

  it("applies global menu actions", () => {
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "toggle-enabled", 1).enabled).toBe(false);
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "preset", 1).preset).toBe("powerline");
    expect(
      applyGlobalMenuAction({ ...DEFAULT_CONFIG, preset: "git-heavy" }, "preset", 1).preset,
    ).toBe("compact");
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "separator", 1).separator).not.toBe(
      DEFAULT_CONFIG.separator,
    );
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "separator-fg", 1).separatorFg).toBe("black");
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "separator-bg", 2).separatorBg).toBe("red");
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "separator-fg-ansi", 1).separatorFg).toBe(
      "ansi256:1",
    );
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "separator-bg-ansi", 1).separatorBg).toBe(
      "ansi256:1",
    );
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "icon-mode", 1).iconMode).toBe("nerd");
    expect(applyGlobalMenuAction(DEFAULT_CONFIG, "minimalist", 1).minimalist).toBe(true);
    expect(applyGlobalMenuAction({ ...DEFAULT_CONFIG, enabled: false }, "reset", 1)).toEqual(
      DEFAULT_CONFIG,
    );
  });

  it("edits separator ANSI colors with digits and backspace", () => {
    const withDigit = applyGlobalMenuTextInput(DEFAULT_CONFIG, "separator-fg-ansi", "9");
    const bgWithDigit = applyGlobalMenuTextInput(DEFAULT_CONFIG, "separator-bg-ansi", "8");
    expect(withDigit?.separatorFg).toBe("ansi256:9");
    expect(bgWithDigit?.separatorBg).toBe("ansi256:8");
    expect(applyGlobalMenuTextInput(DEFAULT_CONFIG, "separator-fg-ansi", "x")).toBeUndefined();
    expect(applyGlobalMenuTextInput(DEFAULT_CONFIG, "separator", "1")).toBeUndefined();

    const clamped = applyGlobalMenuTextInput(
      { ...DEFAULT_CONFIG, separatorFg: "ansi256:99" },
      "separator-fg-ansi",
      "9",
    );
    expect(clamped?.separatorFg).toBe("ansi256:255");

    const deleted = applyGlobalMenuBackspace(
      { ...DEFAULT_CONFIG, separatorFg: "ansi256:255" },
      "separator-fg-ansi",
    );
    const bgDeleted = applyGlobalMenuBackspace(
      { ...DEFAULT_CONFIG, separatorBg: "ansi256:88" },
      "separator-bg-ansi",
    );
    expect(deleted?.separatorFg).toBe("ansi256:25");
    expect(bgDeleted?.separatorBg).toBe("ansi256:8");
    expect(applyGlobalMenuBackspace(DEFAULT_CONFIG, "separator")).toBeUndefined();
  });

  it("documents global menu controls", () => {
    expect(GLOBAL_MENU_HINT).toContain("←/→ or enter change");
    expect(GLOBAL_MENU_HINT).toContain("type digits for ANSI256");
    expect(GLOBAL_MENU_HINT).toContain("backspace delete");
  });
});
