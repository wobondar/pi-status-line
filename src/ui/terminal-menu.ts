import type { ColorLevel } from "../colors.js";
import type { StatuslineConfig } from "../types.js";
import { cycle } from "./helpers.js";
import { COLOR_LEVEL_LABELS, COLOR_LEVELS, WIDTH_MODE_LABELS, WIDTH_MODES } from "./model.js";

export type TerminalMenuAction = "width-mode" | "color-level";

export const TERMINAL_MENU_HINT = "↑/↓ option • ←/→ change • esc back";

export const TERMINAL_MENU_ACTIONS: readonly TerminalMenuAction[] = ["width-mode", "color-level"];

export function terminalMenuFields(config: StatuslineConfig): string[] {
  return [
    `Terminal Width: ${WIDTH_MODE_LABELS[config.terminal.widthMode]}`,
    `Color Level: ${COLOR_LEVEL_LABELS[config.terminal.colorLevel]}`,
  ];
}

export function terminalMenuAction(index: number): TerminalMenuAction {
  return TERMINAL_MENU_ACTIONS[index] ?? "color-level";
}

export function applyTerminalWidthModeAction(
  config: StatuslineConfig,
  delta: number,
): StatuslineConfig {
  return {
    ...config,
    terminal: {
      ...config.terminal,
      widthMode: cycle(WIDTH_MODES, config.terminal.widthMode, delta),
    },
  };
}

export function nextTerminalColorLevel(config: StatuslineConfig, delta: number): ColorLevel {
  return cycle(COLOR_LEVELS, config.terminal.colorLevel, delta);
}

export function configWithTerminalColorLevel(
  config: StatuslineConfig,
  colorLevel: ColorLevel,
): StatuslineConfig {
  return {
    ...config,
    terminal: {
      ...config.terminal,
      colorLevel,
    },
  };
}
