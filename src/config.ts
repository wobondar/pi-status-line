import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { getAgentDir } from "@earendil-works/pi-coding-agent";

import type { ColorLevel, TerminalWidthMode } from "./colors.js";
import { normalizeColor } from "./colors.js";
import { createEventWidgetId } from "./event-widgets.js";
import { DEFAULT_EXTENSION_STATUS_ROW, normalizeExtensionStatusRow } from "./extension-statuses.js";
import { PRESET_DEFINITIONS, type PresetWidget } from "./presets.js";
import {
  SEPARATOR_VALUES,
  WIDGET_SEPARATOR_VALUES,
  type SeparatorStyle,
  type WidgetSeparatorStyle,
} from "./separators.js";
import type {
  ContextBarMode,
  CostFormatStyle,
  CwdDisplayStyle,
  GitBranchDisplayStyle,
  GitDiffMode,
  IconMode,
  StatuslineConfig,
  StatuslinePreset,
  TerminalOptions,
  TokenFormatStyle,
  WidgetInstance,
  WidgetOptions,
  WidgetType,
} from "./types.js";
import { WIDGET_DEFINITIONS } from "./types.js";
import { isRecord } from "./utils.js";
import { defaultWidgetForeground } from "./widget-defaults.js";
import { isContextWidget, isTokenFormatWidget } from "./widget-groups.js";

const CONFIG_ENV = "PI_STATUSLINE_CONFIG";
const DEFAULT_CONFIG_PATH = join(getAgentDir(), "extensions", "pi-footer.json");
const ALL_WIDGET_TYPES = new Set<WidgetType>(WIDGET_DEFINITIONS.map((widget) => widget.type));

const SEPARATORS = new Set<SeparatorStyle>(SEPARATOR_VALUES);
const WIDGET_SEPARATORS = new Set<WidgetSeparatorStyle>(WIDGET_SEPARATOR_VALUES);
const PRESETS = new Set<StatuslinePreset>(Object.keys(PRESET_DEFINITIONS) as StatuslinePreset[]);
const COLOR_LEVELS = new Set<ColorLevel>(["truecolor", "ansi256", "ansi16", "none"]);
const WIDTH_MODES = new Set<TerminalWidthMode>(["full", "full-minus-40"]);
const ICON_MODES = new Set<IconMode>(["emoji", "nerd", "text"]);
const CWD_DISPLAY_STYLES = new Set<CwdDisplayStyle>(["default", "full-home", "fish"]);
const GIT_BRANCH_DISPLAY_STYLES = new Set<GitBranchDisplayStyle>([
  "default",
  "round-brackets",
  "custom",
]);
const TOKEN_FORMAT_STYLES = new Set<TokenFormatStyle>(["default", "compact"]);
const COST_FORMAT_STYLES = new Set<CostFormatStyle>(["default", "compact"]);
const CONTEXT_BAR_MODES = new Set<ContextBarMode>(["default", "short", "short-only", "medium"]);
const GIT_DIFF_MODES = new Set<GitDiffMode>(["plain", "compact"]);

export const DEFAULT_TERMINAL_OPTIONS: TerminalOptions = {
  widthMode: "full",
  colorLevel: "ansi256",
};

export const DEFAULT_CONFIG: StatuslineConfig = {
  version: 1,
  enabled: true,
  preset: "default",
  lines: linesForPreset("default"),
  separator: "dot",
  separatorFg: "default",
  separatorBg: "default",
  iconMode: "emoji",
  minimalist: false,
  terminal: DEFAULT_TERMINAL_OPTIONS,
  extensionStatusRow: DEFAULT_EXTENSION_STATUS_ROW,
};

export function getConfigPath(): string {
  return process.env[CONFIG_ENV] ?? DEFAULT_CONFIG_PATH;
}

export function createWidget(type: WidgetType, options: WidgetOptions = {}): WidgetInstance {
  return {
    id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    enabled: true,
    options: defaultOptions(type, options),
  };
}

export function cloneWidget(widget: WidgetInstance): WidgetInstance {
  return createWidget(widget.type, widget.options);
}

export function widgetsForPreset(preset: StatuslinePreset): WidgetInstance[] {
  return widgetsFromPresetLine(PRESET_DEFINITIONS[preset].lines[0] ?? []);
}

export function linesForPreset(preset: StatuslinePreset): WidgetInstance[][] {
  return PRESET_DEFINITIONS[preset].lines.map((line) => widgetsFromPresetLine(line));
}

export function configWithPreset(
  config: StatuslineConfig,
  preset: StatuslinePreset,
): StatuslineConfig {
  const definition = PRESET_DEFINITIONS[preset];
  return {
    ...config,
    preset,
    lines: linesForPreset(preset),
    separator: definition.separator ?? config.separator,
    iconMode: definition.iconMode ?? config.iconMode,
    terminal: { ...config.terminal, ...definition.terminal },
  };
}

function widgetsFromPresetLine(line: readonly PresetWidget[]): WidgetInstance[] {
  return line.map((widget) => createWidget(widget.type, widget.options));
}

export function normalizeConfig(input: unknown): StatuslineConfig {
  if (!isRecord(input)) return cloneConfig(DEFAULT_CONFIG);

  const preset = isStatuslinePreset(input.preset) ? input.preset : DEFAULT_CONFIG.preset;
  const lines = normalizeLines(input.lines, preset);

  return {
    version: 1,
    enabled: typeof input.enabled === "boolean" ? input.enabled : DEFAULT_CONFIG.enabled,
    preset,
    lines,
    separator: isSeparatorStyle(input.separator)
      ? input.separator
      : (PRESET_DEFINITIONS[preset].separator ?? DEFAULT_CONFIG.separator),
    separatorFg: normalizeColor(input.separatorFg) ?? DEFAULT_CONFIG.separatorFg,
    separatorBg: normalizeColor(input.separatorBg) ?? DEFAULT_CONFIG.separatorBg,
    iconMode: isIconMode(input.iconMode) ? input.iconMode : DEFAULT_CONFIG.iconMode,
    minimalist:
      typeof input.minimalist === "boolean" ? input.minimalist : DEFAULT_CONFIG.minimalist,
    terminal: normalizeTerminalOptions(input.terminal, PRESET_DEFINITIONS[preset].terminal),
    extensionStatusRow: normalizeExtensionStatusRow(input.extensionStatusRow),
  };
}

export function cloneConfig(config: StatuslineConfig): StatuslineConfig {
  return {
    ...config,
    lines: config.lines.map((line) =>
      line.map((widget) => ({ ...widget, options: { ...widget.options } })),
    ),
    terminal: { ...config.terminal },
    extensionStatusRow: {
      hiddenKeys: [...config.extensionStatusRow.hiddenKeys],
      knownKeys: [...config.extensionStatusRow.knownKeys],
    },
  };
}

export async function loadConfig(path = getConfigPath()): Promise<StatuslineConfig> {
  try {
    const raw = await readFile(path, "utf8");
    return normalizeConfig(JSON.parse(raw));
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return cloneConfig(DEFAULT_CONFIG);
    }
    throw error;
  }
}

export async function saveConfig(config: StatuslineConfig, path = getConfigPath()): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(normalizeConfig(config), null, 2)}\n`, "utf8");
}

function normalizeLines(linesValue: unknown, preset: StatuslinePreset): WidgetInstance[][] {
  if (!Array.isArray(linesValue)) return linesForPreset(preset);
  return linesValue.map((line) => normalizeWidgets(line));
}

function normalizeWidgets(value: unknown): WidgetInstance[] {
  if (!Array.isArray(value)) return [];

  const widgets: WidgetInstance[] = [];
  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.type !== "string" ||
      !ALL_WIDGET_TYPES.has(item.type as WidgetType)
    )
      continue;
    widgets.push({
      id:
        typeof item.id === "string" && item.id.length > 0
          ? item.id
          : createWidget(item.type as WidgetType).id,
      type: item.type as WidgetType,
      enabled: typeof item.enabled === "boolean" ? item.enabled : true,
      options: defaultOptions(item.type as WidgetType, isRecord(item.options) ? item.options : {}),
    });
  }

  return widgets;
}

function normalizeTerminalOptions(
  value: unknown,
  defaults: Partial<TerminalOptions> = {},
): TerminalOptions {
  const base = { ...DEFAULT_TERMINAL_OPTIONS, ...defaults };
  if (!isRecord(value)) return base;
  return {
    widthMode:
      typeof value.widthMode === "string" && WIDTH_MODES.has(value.widthMode as TerminalWidthMode)
        ? (value.widthMode as TerminalWidthMode)
        : base.widthMode,
    colorLevel:
      typeof value.colorLevel === "string" && COLOR_LEVELS.has(value.colorLevel as ColorLevel)
        ? (value.colorLevel as ColorLevel)
        : base.colorLevel,
  };
}

function defaultOptions(type: WidgetType, options: WidgetOptions): WidgetOptions {
  const base: WidgetOptions = {
    raw: false,
    hideWhenEmpty: false,
    fg: defaultWidgetForeground(type),
    bg: "default",
    bold: false,
  };
  if (type === "cwd") {
    base.segments = 2;
    base.cwdDisplayStyle = "default";
  }
  if (type === "git-branch") {
    base.gitBranchDisplayStyle = "default";
    base.surroundLeft = "";
    base.surroundRight = "";
  }
  if (isContextWidget(type)) {
    base.contextConditionalColors = false;
    base.contextWarningPercent = 70;
    base.contextDangerPercent = 90;
    base.warningFg = "yellow";
    base.warningBg = "default";
    base.dangerFg = "red";
    base.dangerBg = "default";
  }
  if (isTokenFormatWidget(type)) base.tokenFormatStyle = "default";
  if (type === "cost") {
    base.costFormatStyle = "default";
    base.showSubscription = false;
  }
  if (type === "context-bar") base.contextBarMode = "default";
  if (type === "custom-text") base.text = "custom";
  if (type === "session-name") {
    base.hideWhenEmpty = true;
    base.text = "-";
  }
  if (type === "separator") {
    base.separator = "pipe";
    base.text = "|";
  }
  if (type === "spacer") base.width = 2;
  if (type === "model") base.showProvider = false;
  if (type === "event") {
    base.widgetId = createEventWidgetId();
    base.hideWhenEmpty = true;
    base.text = "-";
  }
  if (type === "external-status") {
    base.externalStatusKey = "";
    base.trimValue = 0;
    base.preserveTrimStyles = true;
    base.hideWhenEmpty = true;
    base.text = "-";
  }
  return sanitizeOptions({ ...base, ...options });
}

function sanitizeOptions(options: WidgetOptions | Record<string, unknown>): WidgetOptions {
  const sanitized: WidgetOptions = {
    raw: typeof options.raw === "boolean" ? options.raw : false,
    hideWhenEmpty: typeof options.hideWhenEmpty === "boolean" ? options.hideWhenEmpty : false,
    hideWhenZero: typeof options.hideWhenZero === "boolean" ? options.hideWhenZero : false,
    bold: typeof options.bold === "boolean" ? options.bold : false,
  };

  if (typeof options.icon === "string") sanitized.icon = options.icon;
  if (typeof options.text === "string") sanitized.text = options.text;
  if (typeof options.widgetId === "string") sanitized.widgetId = options.widgetId;
  if (typeof options.externalStatusKey === "string")
    sanitized.externalStatusKey = options.externalStatusKey;
  if (typeof options.surroundLeft === "string") sanitized.surroundLeft = options.surroundLeft;
  if (typeof options.surroundRight === "string") sanitized.surroundRight = options.surroundRight;
  if (isWidgetSeparatorStyle(options.separator)) sanitized.separator = options.separator;
  if (typeof options.showProvider === "boolean") sanitized.showProvider = options.showProvider;
  if (typeof options.showSubscription === "boolean")
    sanitized.showSubscription = options.showSubscription;
  if (typeof options.preserveTrimStyles === "boolean")
    sanitized.preserveTrimStyles = options.preserveTrimStyles;
  if (typeof options.contextConditionalColors === "boolean")
    sanitized.contextConditionalColors = options.contextConditionalColors;
  if (typeof options.used === "boolean") sanitized.used = options.used;
  if (isCwdDisplayStyle(options.cwdDisplayStyle))
    sanitized.cwdDisplayStyle = options.cwdDisplayStyle;
  if (isGitBranchDisplayStyle(options.gitBranchDisplayStyle))
    sanitized.gitBranchDisplayStyle = options.gitBranchDisplayStyle;
  if (isTokenFormatStyle(options.tokenFormatStyle))
    sanitized.tokenFormatStyle = options.tokenFormatStyle;
  if (isCostFormatStyle(options.costFormatStyle))
    sanitized.costFormatStyle = options.costFormatStyle;
  if (isContextBarMode(options.contextBarMode)) sanitized.contextBarMode = options.contextBarMode;
  if (isGitDiffMode(options.gitDiffMode)) sanitized.gitDiffMode = options.gitDiffMode;

  const fg = normalizeColor(options.fg);
  if (fg) sanitized.fg = fg;
  const bg = normalizeColor(options.bg);
  if (bg) sanitized.bg = bg;
  const warningFg = normalizeColor(options.warningFg);
  if (warningFg) sanitized.warningFg = warningFg;
  const warningBg = normalizeColor(options.warningBg);
  if (warningBg) sanitized.warningBg = warningBg;
  const dangerFg = normalizeColor(options.dangerFg);
  if (dangerFg) sanitized.dangerFg = dangerFg;
  const dangerBg = normalizeColor(options.dangerBg);
  if (dangerBg) sanitized.dangerBg = dangerBg;

  const segments = normalizeInteger(options.segments, 1, 8);
  if (segments !== undefined) sanitized.segments = segments;
  const width = normalizeInteger(options.width, 1, 40);
  if (width !== undefined) sanitized.width = width;
  const trimValue = normalizeInteger(options.trimValue, 0, 10);
  if (trimValue !== undefined) sanitized.trimValue = trimValue;
  const contextWarningPercent = normalizeInteger(options.contextWarningPercent, 0, 100);
  if (contextWarningPercent !== undefined) sanitized.contextWarningPercent = contextWarningPercent;
  const contextDangerPercent = normalizeInteger(options.contextDangerPercent, 0, 100);
  if (contextDangerPercent !== undefined) sanitized.contextDangerPercent = contextDangerPercent;

  return sanitized;
}

function normalizeInteger(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) return undefined;
  return Math.min(max, Math.max(min, value));
}

function isStatuslinePreset(value: unknown): value is StatuslinePreset {
  return typeof value === "string" && PRESETS.has(value as StatuslinePreset);
}

function isSeparatorStyle(value: unknown): value is SeparatorStyle {
  return typeof value === "string" && SEPARATORS.has(value as SeparatorStyle);
}

function isIconMode(value: unknown): value is IconMode {
  return typeof value === "string" && ICON_MODES.has(value as IconMode);
}

function isWidgetSeparatorStyle(value: unknown): value is WidgetSeparatorStyle {
  return typeof value === "string" && WIDGET_SEPARATORS.has(value as WidgetSeparatorStyle);
}

function isCwdDisplayStyle(value: unknown): value is CwdDisplayStyle {
  return typeof value === "string" && CWD_DISPLAY_STYLES.has(value as CwdDisplayStyle);
}

function isGitBranchDisplayStyle(value: unknown): value is GitBranchDisplayStyle {
  return typeof value === "string" && GIT_BRANCH_DISPLAY_STYLES.has(value as GitBranchDisplayStyle);
}

function isTokenFormatStyle(value: unknown): value is TokenFormatStyle {
  return typeof value === "string" && TOKEN_FORMAT_STYLES.has(value as TokenFormatStyle);
}

function isCostFormatStyle(value: unknown): value is CostFormatStyle {
  return typeof value === "string" && COST_FORMAT_STYLES.has(value as CostFormatStyle);
}

function isContextBarMode(value: unknown): value is ContextBarMode {
  return typeof value === "string" && CONTEXT_BAR_MODES.has(value as ContextBarMode);
}

function isGitDiffMode(value: unknown): value is GitDiffMode {
  return typeof value === "string" && GIT_DIFF_MODES.has(value as GitDiffMode);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
