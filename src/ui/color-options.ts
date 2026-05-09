import {
  appendAnsi256Digit,
  deleteAnsi256Digit,
  FOREGROUND_COLORS,
  resetAnsi256Colors,
  STANDARD_COLORS,
} from "../colors.js";
import type { WidgetInstance } from "../types.js";
import { adjustAnsi, cycle } from "./helpers.js";
import type { ColorOptionField } from "./model.js";

export const EDIT_COLORS_HINT =
  "↑/↓ field • ←/→ cycle/change • enter toggle • type digits for ANSI256 • backspace delete • esc back";

export function hasCustomAnsiColors(lines: readonly (readonly WidgetInstance[])[]): boolean {
  return lines.some((line) =>
    line.some(
      (widget) =>
        widget.options.fg?.startsWith("ansi256:") ||
        widget.options.bg?.startsWith("ansi256:") ||
        widget.options.warningFg?.startsWith("ansi256:") ||
        widget.options.warningBg?.startsWith("ansi256:") ||
        widget.options.dangerFg?.startsWith("ansi256:") ||
        widget.options.dangerBg?.startsWith("ansi256:"),
    ),
  );
}

export function resetCustomAnsiColors(lines: readonly (readonly WidgetInstance[])[]): void {
  for (const line of lines) {
    for (const widget of line) {
      widget.options = resetAnsi256Colors(widget.options);
    }
  }
}

export function applyColorDigit(
  widget: WidgetInstance,
  field: ColorOptionField,
  digit: string,
): boolean {
  if (!/^\d$/.test(digit)) return false;
  if (field.id === "fgAnsi") {
    widget.options.fg = appendAnsi256Digit(widget.options.fg, digit);
    return true;
  }
  if (field.id === "bgAnsi") {
    widget.options.bg = appendAnsi256Digit(widget.options.bg, digit);
    return true;
  }
  if (field.id === "warningFgAnsi") {
    widget.options.warningFg = appendAnsi256Digit(widget.options.warningFg, digit);
    return true;
  }
  if (field.id === "warningBgAnsi") {
    widget.options.warningBg = appendAnsi256Digit(widget.options.warningBg, digit);
    return true;
  }
  if (field.id === "dangerFgAnsi") {
    widget.options.dangerFg = appendAnsi256Digit(widget.options.dangerFg, digit);
    return true;
  }
  if (field.id === "dangerBgAnsi") {
    widget.options.dangerBg = appendAnsi256Digit(widget.options.dangerBg, digit);
    return true;
  }
  return false;
}

export function deleteColorDigit(widget: WidgetInstance, field: ColorOptionField): boolean {
  if (field.id === "fgAnsi") {
    widget.options.fg = deleteAnsi256Digit(widget.options.fg);
    return true;
  }
  if (field.id === "bgAnsi") {
    widget.options.bg = deleteAnsi256Digit(widget.options.bg);
    return true;
  }
  if (field.id === "warningFgAnsi") {
    widget.options.warningFg = deleteAnsi256Digit(widget.options.warningFg);
    return true;
  }
  if (field.id === "warningBgAnsi") {
    widget.options.warningBg = deleteAnsi256Digit(widget.options.warningBg);
    return true;
  }
  if (field.id === "dangerFgAnsi") {
    widget.options.dangerFg = deleteAnsi256Digit(widget.options.dangerFg);
    return true;
  }
  if (field.id === "dangerBgAnsi") {
    widget.options.dangerBg = deleteAnsi256Digit(widget.options.dangerBg);
    return true;
  }
  return false;
}

export function applyColorOptionField(
  widget: WidgetInstance,
  field: ColorOptionField,
  delta: number,
): void {
  if (field.id === "bold") widget.options.bold = !widget.options.bold;
  else if (field.id === "fg")
    widget.options.fg = cycle(
      FOREGROUND_COLORS.map((color) => color.value),
      widget.options.fg ?? "default",
      delta,
    );
  else if (field.id === "bg")
    widget.options.bg = cycle(
      STANDARD_COLORS.map((color) => color.value),
      widget.options.bg ?? "default",
      delta,
    );
  else if (field.id === "warningFg")
    widget.options.warningFg = cycle(
      FOREGROUND_COLORS.map((color) => color.value),
      widget.options.warningFg ?? "default",
      delta,
    );
  else if (field.id === "warningBg")
    widget.options.warningBg = cycle(
      STANDARD_COLORS.map((color) => color.value),
      widget.options.warningBg ?? "default",
      delta,
    );
  else if (field.id === "dangerFg")
    widget.options.dangerFg = cycle(
      FOREGROUND_COLORS.map((color) => color.value),
      widget.options.dangerFg ?? "default",
      delta,
    );
  else if (field.id === "dangerBg")
    widget.options.dangerBg = cycle(
      STANDARD_COLORS.map((color) => color.value),
      widget.options.dangerBg ?? "default",
      delta,
    );
  else if (field.id === "fgAnsi") widget.options.fg = adjustAnsi(widget.options.fg, delta);
  else if (field.id === "bgAnsi") widget.options.bg = adjustAnsi(widget.options.bg, delta);
  else if (field.id === "warningFgAnsi")
    widget.options.warningFg = adjustAnsi(widget.options.warningFg, delta);
  else if (field.id === "warningBgAnsi")
    widget.options.warningBg = adjustAnsi(widget.options.warningBg, delta);
  else if (field.id === "dangerFgAnsi")
    widget.options.dangerFg = adjustAnsi(widget.options.dangerFg, delta);
  else if (field.id === "dangerBgAnsi")
    widget.options.dangerBg = adjustAnsi(widget.options.dangerBg, delta);
}
