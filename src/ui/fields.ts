import { colorDisplayName } from "../colors.js";
import type {
  CwdDisplayStyle,
  GitBranchDisplayStyle,
  WidgetInstance,
  WidgetType,
} from "../types.js";
import { WIDGET_DEFINITIONS } from "../types.js";
import { defaultWidgetForeground } from "../widget-defaults.js";
import { isContextWidget, isTokenFormatWidget } from "../widget-groups.js";
import type { ColorOptionField, EditField, OptionField, WidgetDefinition } from "./model.js";
import {
  CONTEXT_BAR_MODE_LABELS,
  COST_FORMAT_STYLE_LABELS,
  CWD_DISPLAY_STYLE_LABELS,
  DEFAULT_WIDGET_DEFINITION,
  GIT_BRANCH_DISPLAY_STYLE_LABELS,
  GIT_DIFF_MODE_LABELS,
  TOKEN_FORMAT_STYLE_LABELS,
} from "./model.js";

const CWD_DISPLAY_STYLE_SUMMARY_LABELS: Record<CwdDisplayStyle, string> = {
  default: "default",
  "full-home": "full-path",
  fish: "fish-style",
};

const GIT_BRANCH_DISPLAY_STYLE_SUMMARY_LABELS: Record<GitBranchDisplayStyle, string> = {
  default: "default",
  "round-brackets": "brackets",
  custom: "custom",
};

export function fieldsForWidget(widget: WidgetInstance): OptionField[] {
  const fields: OptionField[] = [{ id: "enabled", label: "Enabled", kind: "boolean" }];

  if (widget.type === "custom-text") {
    fields.push({ id: "text", label: "Text", kind: "text" });
    return fields;
  }

  if (widget.type === "event") {
    fields.push({ id: "widgetId", label: "Widget ID", kind: "text" });
  }

  if (widget.type === "external-status") {
    fields.push({ id: "externalStatusKey", label: "Status key", kind: "text" });
    fields.push({ id: "trimValue", label: "Trim value", kind: "number", min: 0, max: 10 });
    fields.push({ id: "preserveTrimStyles", label: "Preserve trim styles", kind: "boolean" });
  }

  if (widget.type === "separator") {
    fields.push({ id: "separator", label: "Separator", kind: "choice" });
    if (widget.options.separator === "custom")
      fields.push({ id: "text", label: "Text", kind: "text" });
    return fields;
  }

  if (widget.type === "spacer") {
    fields.push({ id: "width", label: "Width", kind: "number", min: 1, max: 40 });
    return fields;
  }

  if (isLayoutWidget(widget)) return fields;

  fields.push({ id: "raw", label: "Raw value only", kind: "boolean" });

  if (shouldWidgetHaveHideWhenEmpty(widget)) {
    fields.push({ id: "hideWhenEmpty", label: "Hide when empty", kind: "boolean" });
  }
  if (shouldWidgetHaveHideWhenZero(widget)) {
    fields.push({ id: "hideWhenZero", label: "Hide when zero", kind: "boolean" });
  }

  fields.push({ id: "icon", label: "Custom icon", kind: "text" });

  if (shouldWidgetHaveHideWhenEmpty(widget) && !widget.options.hideWhenEmpty) {
    fields.push({ id: "text", label: "Text when empty", kind: "text" });
  }
  if (widget.type === "cwd") {
    fields.push({ id: "cwdDisplayStyle", label: "Display style", kind: "choice" });
    fields.push({ id: "segments", label: "Segments", kind: "number", min: 1, max: 8 });
  }
  if (widget.type === "git-branch") {
    fields.push({ id: "gitBranchDisplayStyle", label: "Display style", kind: "choice" });
    if (widget.options.gitBranchDisplayStyle === "custom") {
      fields.push({ id: "surroundLeft", label: "Surround left", kind: "text" });
      fields.push({ id: "surroundRight", label: "Surround right", kind: "text" });
    }
  }
  if (isContextWidget(widget.type)) {
    fields.push({ id: "contextConditionalColors", label: "Conditional colors", kind: "boolean" });
    if (widget.options.contextConditionalColors) {
      fields.push({
        id: "contextWarningPercent",
        label: "Warning zone threshold",
        kind: "number",
        min: 0,
        max: 100,
      });
      fields.push({
        id: "contextDangerPercent",
        label: "Danger zone threshold",
        kind: "number",
        min: 0,
        max: 100,
      });
    }
  }
  if (isTokenFormatWidget(widget.type)) {
    fields.push({ id: "tokenFormatStyle", label: "Token format", kind: "choice" });
  }
  if (widget.type === "cost") {
    fields.push({ id: "costFormatStyle", label: "Cost format", kind: "choice" });
    fields.push({ id: "showSubscription", label: "Show subscription", kind: "boolean" });
  }
  if (widget.type === "context-bar")
    fields.push({ id: "contextBarMode", label: "Display", kind: "choice" });
  if (widget.type === "model")
    fields.push({ id: "showProvider", label: "Show provider", kind: "boolean" });
  if (widget.type === "git-diff")
    fields.push({ id: "gitDiffMode", label: "Display", kind: "choice" });
  return fields;
}

export function colorFields(widget?: WidgetInstance): ColorOptionField[] {
  const fields: ColorOptionField[] = [
    { id: "fg", label: "Foreground", kind: "color" },
    { id: "bg", label: "Background", kind: "color" },
    { id: "bold", label: "Bold", kind: "boolean" },
    { id: "fgAnsi", label: "Custom ANSI256 foreground", kind: "ansi" },
    { id: "bgAnsi", label: "Custom ANSI256 background", kind: "ansi" },
  ];
  if (widget && isContextWidget(widget.type) && widget.options.contextConditionalColors) {
    fields.push(
      { id: "warningFg", label: "Warning foreground", kind: "color" },
      { id: "warningBg", label: "Warning background", kind: "color" },
      { id: "warningFgAnsi", label: "Custom ANSI256 warning foreground", kind: "ansi" },
      { id: "warningBgAnsi", label: "Custom ANSI256 warning background", kind: "ansi" },
      { id: "dangerFg", label: "Danger foreground", kind: "color" },
      { id: "dangerBg", label: "Danger background", kind: "color" },
      { id: "dangerFgAnsi", label: "Custom ANSI256 danger foreground", kind: "ansi" },
      { id: "dangerBgAnsi", label: "Custom ANSI256 danger background", kind: "ansi" },
    );
  }
  return fields;
}

export function fieldValue(widget: WidgetInstance, field: OptionField): string {
  if (field.id === "enabled") return widget.enabled ? "on" : "off";
  if (field.kind === "boolean") return getBooleanField(widget, field.id) ? "on" : "off";
  if (field.kind === "number") return String(getNumberField(widget, field.id) ?? "");
  if (field.id === "separator") return widget.options.separator ?? "pipe";
  if (field.id === "cwdDisplayStyle")
    return CWD_DISPLAY_STYLE_LABELS[widget.options.cwdDisplayStyle ?? "default"];
  if (field.id === "gitBranchDisplayStyle")
    return GIT_BRANCH_DISPLAY_STYLE_LABELS[widget.options.gitBranchDisplayStyle ?? "default"];
  if (field.id === "tokenFormatStyle")
    return TOKEN_FORMAT_STYLE_LABELS[widget.options.tokenFormatStyle ?? "default"];
  if (field.id === "costFormatStyle")
    return COST_FORMAT_STYLE_LABELS[widget.options.costFormatStyle ?? "default"];
  if (field.id === "contextBarMode")
    return CONTEXT_BAR_MODE_LABELS[widget.options.contextBarMode ?? "default"];
  if (field.id === "gitDiffMode")
    return GIT_DIFF_MODE_LABELS[widget.options.gitDiffMode ?? "plain"];
  return getTextField(widget, field.id) || "(empty)";
}

export function colorFieldValue(widget: WidgetInstance, field: ColorOptionField): string {
  if (field.id === "bold") return widget.options.bold ? "on" : "off";
  if (field.id === "fg") return colorDisplayName(widget.options.fg);
  if (field.id === "bg") return colorDisplayName(widget.options.bg);
  if (field.id === "warningFg") return colorDisplayName(widget.options.warningFg);
  if (field.id === "warningBg") return colorDisplayName(widget.options.warningBg);
  if (field.id === "dangerFg") return colorDisplayName(widget.options.dangerFg);
  if (field.id === "dangerBg") return colorDisplayName(widget.options.dangerBg);
  if (field.id === "fgAnsi")
    return widget.options.fg?.startsWith("ansi256:") ? widget.options.fg.slice(8) : "0";
  if (field.id === "bgAnsi")
    return widget.options.bg?.startsWith("ansi256:") ? widget.options.bg.slice(8) : "0";
  if (field.id === "warningFgAnsi")
    return widget.options.warningFg?.startsWith("ansi256:")
      ? widget.options.warningFg.slice(8)
      : "0";
  if (field.id === "warningBgAnsi")
    return widget.options.warningBg?.startsWith("ansi256:")
      ? widget.options.warningBg.slice(8)
      : "0";
  if (field.id === "dangerFgAnsi")
    return widget.options.dangerFg?.startsWith("ansi256:") ? widget.options.dangerFg.slice(8) : "0";
  if (field.id === "dangerBgAnsi")
    return widget.options.dangerBg?.startsWith("ansi256:") ? widget.options.dangerBg.slice(8) : "0";
  return "";
}

export function getBooleanField(widget: WidgetInstance, id: EditField): boolean {
  if (id === "raw") return widget.options.raw ?? false;
  if (id === "hideWhenEmpty") return widget.options.hideWhenEmpty ?? false;
  if (id === "hideWhenZero") return widget.options.hideWhenZero ?? false;
  if (id === "showProvider") return widget.options.showProvider ?? false;
  if (id === "showSubscription") return widget.options.showSubscription ?? false;
  if (id === "preserveTrimStyles") return widget.options.preserveTrimStyles ?? false;
  if (id === "contextConditionalColors") return widget.options.contextConditionalColors ?? false;
  return false;
}

export function getNumberField(widget: WidgetInstance, id: EditField): number | undefined {
  if (id === "segments") return widget.options.segments;
  if (id === "width") return widget.options.width;
  if (id === "trimValue") return widget.options.trimValue;
  if (id === "contextWarningPercent") return widget.options.contextWarningPercent;
  if (id === "contextDangerPercent") return widget.options.contextDangerPercent;
  return undefined;
}

export function getTextField(widget: WidgetInstance, id: EditField): string {
  if (id === "icon") return widget.options.icon ?? "";
  if (id === "text") return widget.options.text ?? "";
  if (id === "widgetId") return widget.options.widgetId ?? "";
  if (id === "externalStatusKey") return widget.options.externalStatusKey ?? "";
  if (id === "surroundLeft") return widget.options.surroundLeft ?? "";
  if (id === "surroundRight") return widget.options.surroundRight ?? "";
  return "";
}

export function formatWidgetOptions(widget: WidgetInstance): string {
  const { options } = widget;
  const parts: string[] = [];
  if (options.raw) parts.push("raw");
  if (options.hideWhenEmpty) parts.push("hide-empty");
  if (options.separator) parts.push(`separator=${options.separator}`);
  if (options.widgetId) parts.push(`id=${options.widgetId}`);
  if (options.externalStatusKey) parts.push(`status=${options.externalStatusKey}`);
  if (options.trimValue) parts.push(`trim=${options.trimValue}`);
  if (options.cwdDisplayStyle && options.cwdDisplayStyle !== "default")
    parts.push(`display=${CWD_DISPLAY_STYLE_SUMMARY_LABELS[options.cwdDisplayStyle]}`);
  if (options.gitBranchDisplayStyle && options.gitBranchDisplayStyle !== "default")
    parts.push(`display=${GIT_BRANCH_DISPLAY_STYLE_SUMMARY_LABELS[options.gitBranchDisplayStyle]}`);
  if (options.tokenFormatStyle && options.tokenFormatStyle !== "default")
    parts.push(`format=${TOKEN_FORMAT_STYLE_LABELS[options.tokenFormatStyle]}`);
  if (options.costFormatStyle && options.costFormatStyle !== "default")
    parts.push(`format=${COST_FORMAT_STYLE_LABELS[options.costFormatStyle]}`);
  if (options.showSubscription) parts.push("show-sub");
  if (options.contextConditionalColors) parts.push("with-colors");
  if (options.hideWhenZero) parts.push("hide-zero");
  if (shouldShowWidgetCustomText(widget) && options.text) parts.push(`text='${options.text}'`);
  if (options.contextBarMode && options.contextBarMode !== "default")
    parts.push(`display=${CONTEXT_BAR_MODE_LABELS[options.contextBarMode]}`);
  if (options.gitDiffMode && options.gitDiffMode !== "plain")
    parts.push(`display=${GIT_DIFF_MODE_LABELS[options.gitDiffMode]}`);
  if (options.segments) parts.push(`segments=${options.segments}`);
  if (options.width) parts.push(`width=${options.width}`);
  return parts.join(" • ");
}

export function formatWidgetColorOptions(widget: WidgetInstance): string {
  const { options } = widget;
  const parts: string[] = [];
  if (options.raw) parts.push("raw");
  if (options.hideWhenEmpty) parts.push("hide-empty");
  if (options.separator) parts.push(`separator=${options.separator}`);
  if (options.externalStatusKey) parts.push(`status=${options.externalStatusKey}`);
  if (shouldShowWidgetCustomText(widget) && options.text) parts.push(`text='${options.text}'`);
  if (options.fg && options.fg !== defaultWidgetForeground(widget.type))
    parts.push(`fg=${colorDisplayName(options.fg)}`);
  if (options.bg && options.bg !== "default") parts.push(`bg=${colorDisplayName(options.bg)}`);
  if (options.bold) parts.push("bold");
  return parts.join(" • ");
}

function shouldWidgetHaveHideWhenZero(widget: WidgetInstance): boolean {
  switch (widget.type) {
    case "cache-read":
    case "cache-write":
    case "input-tokens":
    case "output-tokens":
    case "total-tokens":
    case "context-length":
    case "context-window":
    case "input-speed":
    case "output-speed":
    case "total-speed":
      return true;
    default:
      return false;
  }
}

function shouldShowWidgetCustomText(widget: WidgetInstance): boolean {
  const { options } = widget;
  if (widget.type === "custom-text") return true;
  if (widget.type === "separator" && options.separator === "custom") return true;
  if (shouldWidgetHaveHideWhenEmpty(widget) && !options.hideWhenEmpty) return true;
  return false;
}

function shouldWidgetHaveHideWhenEmpty(widget: WidgetInstance): boolean {
  switch (widget.type) {
    case "session-name":
    case "event":
    case "external-status":
    case "git-branch":
    case "git-sha":
    case "git-root":
    case "git-status":
    case "git-diff":
    case "git-clean":
    case "git-staged":
    case "git-unstaged":
    case "git-untracked":
    case "git-insertions":
    case "git-deletions":
    case "git-ahead-behind":
    case "git-remote":
      return true;
    default:
      return false;
  }
}

export function getDefinition(type: WidgetType): WidgetDefinition {
  return (
    WIDGET_DEFINITIONS.find((definition) => definition.type === type) ?? DEFAULT_WIDGET_DEFINITION
  );
}

function isLayoutWidget(widget: WidgetInstance): boolean {
  return (
    widget.type === "custom-text" ||
    widget.type === "separator" ||
    widget.type === "spacer" ||
    widget.type === "flex-separator"
  );
}
