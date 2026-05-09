import type { ColorLevel, TerminalWidthMode } from "../colors.js";
import type {
  ContextBarMode,
  CostFormatStyle,
  CwdDisplayStyle,
  GitBranchDisplayStyle,
  GitDiffMode,
  IconMode,
  StatuslinePreset,
  TokenFormatStyle,
} from "../types.js";
import { WIDGET_DEFINITIONS } from "../types.js";

export const CONFIG_UI_HEIGHT_RATIO = 1;

export const PRESET_VALUES: StatuslinePreset[] = [
  "default",
  "powerline",
  "powerline-bright",
  "powerline-blocks",
  "powerline-mono",
  "git-heavy",
  "compact",
  "pi-footer",
  "demo",
  "demo-standard",
];
export const ICON_MODE_VALUES: IconMode[] = ["emoji", "nerd", "text"];
export const CWD_DISPLAY_STYLE_VALUES: CwdDisplayStyle[] = ["default", "full-home", "fish"];
export const GIT_BRANCH_DISPLAY_STYLE_VALUES: GitBranchDisplayStyle[] = [
  "default",
  "round-brackets",
  "custom",
];
export const TOKEN_FORMAT_STYLE_VALUES: TokenFormatStyle[] = ["default", "compact"];
export const COST_FORMAT_STYLE_VALUES: CostFormatStyle[] = ["default", "compact"];
export const WIDTH_MODES: TerminalWidthMode[] = ["full", "full-minus-40"];
export const COLOR_LEVELS: ColorLevel[] = ["truecolor", "ansi256", "ansi16", "none"];
export const CONTEXT_BAR_MODE_VALUES: ContextBarMode[] = [
  "default",
  "short",
  "short-only",
  "medium",
];
export const GIT_DIFF_MODE_VALUES: GitDiffMode[] = ["plain", "compact"];

export const WIDTH_MODE_LABELS: Record<TerminalWidthMode, string> = {
  full: "Full width always",
  "full-minus-40": "Full width minus 40",
};

export const COLOR_LEVEL_LABELS: Record<ColorLevel, string> = {
  truecolor: "Truecolor",
  ansi256: "256 Color",
  ansi16: "Basic (Standard 16-color)",
  none: "No Color",
};

export const ICON_MODE_LABELS: Record<IconMode, string> = {
  emoji: "Emoji",
  nerd: "Nerd Font icons",
  text: "Text labels",
};

export const CWD_DISPLAY_STYLE_LABELS: Record<CwdDisplayStyle, string> = {
  default: "Default (last path segments)",
  "full-home": "Full path (~ home)",
  fish: "Fish-style abbreviations",
};

export const GIT_BRANCH_DISPLAY_STYLE_LABELS: Record<GitBranchDisplayStyle, string> = {
  default: "Default",
  "round-brackets": "Round brackets",
  custom: "Custom surround text",
};

export const TOKEN_FORMAT_STYLE_LABELS: Record<TokenFormatStyle, string> = {
  default: "Default",
  compact: "Compact",
};

export const COST_FORMAT_STYLE_LABELS: Record<CostFormatStyle, string> = {
  default: "Default",
  compact: "Compact",
};

export const CONTEXT_BAR_MODE_LABELS: Record<ContextBarMode, string> = {
  default: "Default bar",
  short: "Short bar",
  "short-only": "Short bar only",
  medium: "Medium bar",
};

export const GIT_DIFF_MODE_LABELS: Record<GitDiffMode, string> = {
  plain: "Plain (+/-)",
  compact: "Compact (+n,-n)",
};

export type WidgetDefinition = (typeof WIDGET_DEFINITIONS)[number];
export const DEFAULT_WIDGET_DEFINITION = WIDGET_DEFINITIONS[0];

export type ScreenView =
  | "main"
  | "line-list"
  | "widget-list"
  | "add-widget"
  | "edit-widget"
  | "color-line-list"
  | "color-widget-list"
  | "edit-colors"
  | "terminal"
  | "confirm-color-level"
  | "confirm-exit"
  | "global"
  | "extension-status-row"
  | "extension-status-picker";

export type EditField =
  | "enabled"
  | "raw"
  | "hideWhenEmpty"
  | "hideWhenZero"
  | "icon"
  | "text"
  | "widgetId"
  | "externalStatusKey"
  | "trimValue"
  | "preserveTrimStyles"
  | "surroundLeft"
  | "surroundRight"
  | "separator"
  | "segments"
  | "width"
  | "showProvider"
  | "showSubscription"
  | "cwdDisplayStyle"
  | "gitBranchDisplayStyle"
  | "tokenFormatStyle"
  | "costFormatStyle"
  | "contextConditionalColors"
  | "contextWarningPercent"
  | "contextDangerPercent"
  | "contextBarMode"
  | "gitDiffMode";
export type ColorField =
  | "fg"
  | "bg"
  | "bold"
  | "fgAnsi"
  | "bgAnsi"
  | "warningFg"
  | "warningBg"
  | "warningFgAnsi"
  | "warningBgAnsi"
  | "dangerFg"
  | "dangerBg"
  | "dangerFgAnsi"
  | "dangerBgAnsi";

export interface OptionField {
  id: EditField;
  label: string;
  kind: "boolean" | "number" | "text" | "choice";
  min?: number;
  max?: number;
}

export interface ColorOptionField {
  id: ColorField;
  label: string;
  kind: "color" | "boolean" | "ansi";
}
