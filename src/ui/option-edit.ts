import type { WidgetInstance } from "../types.js";
import { WIDGET_SEPARATOR_VALUES } from "../separators.js";
import { cycle } from "./helpers.js";
import {
  CONTEXT_BAR_MODE_VALUES,
  COST_FORMAT_STYLE_VALUES,
  CWD_DISPLAY_STYLE_VALUES,
  GIT_BRANCH_DISPLAY_STYLE_VALUES,
  GIT_DIFF_MODE_VALUES,
  TOKEN_FORMAT_STYLE_VALUES,
} from "./model.js";
import type { EditField, OptionField } from "./model.js";

export type OptionFieldApplyResult = "changed" | "unchanged" | "external-status-key";

export function applySimpleOptionField(
  widget: WidgetInstance,
  field: OptionField,
  delta: number,
): OptionFieldApplyResult {
  if (field.id === "enabled") {
    widget.enabled = !widget.enabled;
    return "changed";
  }
  if (field.kind === "boolean") {
    setBooleanField(widget, field.id, !getBooleanField(widget, field.id));
    return "changed";
  }
  if (field.kind === "number") {
    const current = getNumberField(widget, field.id) ?? field.min ?? 1;
    setNumberField(
      widget,
      field.id,
      Math.min(field.max ?? 99, Math.max(field.min ?? 1, current + delta)),
    );
    return "changed";
  }
  if (field.id === "separator") {
    widget.options.separator = cycle(
      WIDGET_SEPARATOR_VALUES,
      widget.options.separator ?? "pipe",
      delta,
    );
    return "changed";
  }
  if (field.id === "cwdDisplayStyle") {
    widget.options.cwdDisplayStyle = cycle(
      CWD_DISPLAY_STYLE_VALUES,
      widget.options.cwdDisplayStyle ?? "default",
      delta,
    );
    return "changed";
  }
  if (field.id === "gitBranchDisplayStyle") {
    widget.options.gitBranchDisplayStyle = cycle(
      GIT_BRANCH_DISPLAY_STYLE_VALUES,
      widget.options.gitBranchDisplayStyle ?? "default",
      delta,
    );
    return "changed";
  }
  if (field.id === "tokenFormatStyle") {
    widget.options.tokenFormatStyle = cycle(
      TOKEN_FORMAT_STYLE_VALUES,
      widget.options.tokenFormatStyle ?? "default",
      delta,
    );
    return "changed";
  }
  if (field.id === "costFormatStyle") {
    widget.options.costFormatStyle = cycle(
      COST_FORMAT_STYLE_VALUES,
      widget.options.costFormatStyle ?? "default",
      delta,
    );
    return "changed";
  }
  if (field.id === "contextBarMode") {
    widget.options.contextBarMode = cycle(
      CONTEXT_BAR_MODE_VALUES,
      widget.options.contextBarMode ?? "default",
      delta,
    );
    return "changed";
  }
  if (field.id === "gitDiffMode") {
    widget.options.gitDiffMode = cycle(
      GIT_DIFF_MODE_VALUES,
      widget.options.gitDiffMode ?? "plain",
      delta,
    );
    return "changed";
  }
  if (field.id === "externalStatusKey") return "external-status-key";
  return "unchanged";
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

export function setBooleanField(widget: WidgetInstance, id: EditField, value: boolean): void {
  if (id === "raw") widget.options.raw = value;
  if (id === "hideWhenEmpty") widget.options.hideWhenEmpty = value;
  if (id === "hideWhenZero") widget.options.hideWhenZero = value;
  if (id === "showProvider") widget.options.showProvider = value;
  if (id === "showSubscription") widget.options.showSubscription = value;
  if (id === "preserveTrimStyles") widget.options.preserveTrimStyles = value;
  if (id === "contextConditionalColors") widget.options.contextConditionalColors = value;
}

export function getNumberField(widget: WidgetInstance, id: EditField): number | undefined {
  if (id === "segments") return widget.options.segments;
  if (id === "width") return widget.options.width;
  if (id === "trimValue") return widget.options.trimValue;
  if (id === "contextWarningPercent") return widget.options.contextWarningPercent;
  if (id === "contextDangerPercent") return widget.options.contextDangerPercent;
  return undefined;
}

export function setNumberField(widget: WidgetInstance, id: EditField, value: number): void {
  if (id === "segments") widget.options.segments = value;
  if (id === "width") widget.options.width = value;
  if (id === "trimValue") widget.options.trimValue = value;
  if (id === "contextWarningPercent") widget.options.contextWarningPercent = value;
  if (id === "contextDangerPercent") widget.options.contextDangerPercent = value;
}

export function setTextField(widget: WidgetInstance, id: EditField, value: string): void {
  if (id === "icon") widget.options.icon = value;
  if (id === "text") widget.options.text = value;
  if (id === "widgetId") widget.options.widgetId = value;
  if (id === "externalStatusKey") widget.options.externalStatusKey = value;
  if (id === "surroundLeft") widget.options.surroundLeft = value;
  if (id === "surroundRight") widget.options.surroundRight = value;
}
