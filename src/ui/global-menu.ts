import type { ColorName } from "../colors.js";
import {
  ansi256Digits,
  appendAnsi256Digit,
  colorDisplayName,
  deleteAnsi256Digit,
  STANDARD_COLORS,
} from "../colors.js";
import { cloneConfig, configWithPreset, DEFAULT_CONFIG } from "../config.js";
import { SEPARATOR_VALUES } from "../separators.js";
import type { StatuslineConfig } from "../types.js";
import { adjustAnsi, cycle } from "./helpers.js";
import { ICON_MODE_LABELS, ICON_MODE_VALUES, PRESET_VALUES } from "./model.js";

export type GlobalMenuAction =
  | "toggle-enabled"
  | "preset"
  | "separator"
  | "separator-fg"
  | "separator-bg"
  | "separator-fg-ansi"
  | "separator-bg-ansi"
  | "icon-mode"
  | "minimalist"
  | "reset";

export const GLOBAL_MENU_HINT =
  "↑/↓ option • ←/→ or enter change • type digits for ANSI256 • backspace delete • esc back";

export const GLOBAL_MENU_ACTIONS: readonly GlobalMenuAction[] = [
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
];

export function globalMenuFields(config: StatuslineConfig): string[] {
  return [
    `Enabled: ${config.enabled ? "on" : "off"}`,
    `Preset: ${config.preset}`,
    `Separator: ${config.separator}`,
    `Separator foreground: ${colorDisplayName(config.separatorFg)}`,
    `Separator background: ${colorDisplayName(config.separatorBg)}`,
    `Custom ANSI256 separator foreground: ${ansi256Digits(config.separatorFg)}`,
    `Custom ANSI256 separator background: ${ansi256Digits(config.separatorBg)}`,
    `Icons: ${ICON_MODE_LABELS[config.iconMode]}`,
    `Minimalist mode: ${config.minimalist ? "on" : "off"}`,
    "Reset to defaults",
  ];
}

export function globalMenuAction(index: number): GlobalMenuAction {
  return GLOBAL_MENU_ACTIONS[index] ?? "reset";
}

export function applyGlobalMenuAction(
  config: StatuslineConfig,
  action: GlobalMenuAction,
  delta: number,
): StatuslineConfig {
  if (action === "toggle-enabled") return { ...config, enabled: !config.enabled };
  if (action === "preset")
    return configWithPreset(config, cycle(PRESET_VALUES, config.preset, delta));
  if (action === "separator")
    return { ...config, separator: cycle(SEPARATOR_VALUES, config.separator, delta) };
  if (action === "separator-fg")
    return { ...config, separatorFg: cycleStandardColor(config.separatorFg, delta) };
  if (action === "separator-bg")
    return { ...config, separatorBg: cycleStandardColor(config.separatorBg, delta) };
  if (action === "separator-fg-ansi")
    return { ...config, separatorFg: adjustAnsi(config.separatorFg, delta) };
  if (action === "separator-bg-ansi")
    return { ...config, separatorBg: adjustAnsi(config.separatorBg, delta) };
  if (action === "icon-mode")
    return { ...config, iconMode: cycle(ICON_MODE_VALUES, config.iconMode, delta) };
  if (action === "minimalist") return { ...config, minimalist: !config.minimalist };
  return cloneConfig(DEFAULT_CONFIG);
}

export function applyGlobalMenuTextInput(
  config: StatuslineConfig,
  action: GlobalMenuAction,
  data: string,
): StatuslineConfig | undefined {
  if (!/^\d$/.test(data)) return undefined;
  if (action === "separator-fg-ansi")
    return { ...config, separatorFg: appendAnsi256Digit(config.separatorFg, data) };
  if (action === "separator-bg-ansi")
    return { ...config, separatorBg: appendAnsi256Digit(config.separatorBg, data) };
  return undefined;
}

export function applyGlobalMenuBackspace(
  config: StatuslineConfig,
  action: GlobalMenuAction,
): StatuslineConfig | undefined {
  if (action === "separator-fg-ansi")
    return { ...config, separatorFg: deleteAnsi256Digit(config.separatorFg) };
  if (action === "separator-bg-ansi")
    return { ...config, separatorBg: deleteAnsi256Digit(config.separatorBg) };
  return undefined;
}

function cycleStandardColor(current: ColorName, delta: number): ColorName {
  return cycle(
    STANDARD_COLORS.map((color) => color.value),
    current,
    delta,
  );
}
