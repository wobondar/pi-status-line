import { Key, matchesKey } from "@earendil-works/pi-tui";

import type { WidgetInstance } from "../../types.js";
import { EDIT_WIDGET_HINT, editWidgetTitle } from "../edit-widget.js";
import { eventWidgetUsageLines } from "../events.js";
import { cycleExternalStatusKey, statusKeyPickerLines } from "../extension-status-picker.js";
import { fieldsForWidget, getTextField } from "../fields.js";
import { isPrintable, wrap } from "../helpers.js";
import type { EditField, OptionField } from "../model.js";
import { applySimpleOptionField, setTextField as applyTextField } from "../option-edit.js";
import { Controller } from "./controller.js";

export class EditWidgetScreen extends Controller {
  private selected = 0;

  renderScreen(width: number): string[] {
    const widget = this.ctx.currentWidget();
    if (!widget) return [this.render.line(this.ctx.theme.warning("No widget selected"), width)];
    this.clampSelection(fieldsForWidget(widget).length);
    const lines = [
      this.render.line(
        this.render.menuTitle(editWidgetTitle(widget), "Select a field to edit its options"),
        width,
      ),
      this.render.line(this.ctx.theme.dim(EDIT_WIDGET_HINT), width),
      ...statusKeyPickerLines(
        widget,
        this.ctx.getExtensionStatuses,
        this.ctx.state.config.extensionStatusRow,
        this.selected,
        width,
        (content, lineWidth) => this.render.line(content, lineWidth),
        (selected, content, lineWidth) => this.render.menuLine(selected, content, lineWidth),
        (value) => this.ctx.theme.dim(value),
      ),
    ];

    if (widget.type === "event") {
      lines.push(
        ...eventWidgetUsageLines(
          widget,
          width,
          (content, lineWidth) => this.render.line(content, lineWidth),
          (value) => this.ctx.theme.dim(value),
        ),
      );
    }

    return lines;
  }

  handleInput(data: string): void {
    const widget = this.ctx.currentWidget();
    if (!widget) return;
    const fields = fieldsForWidget(widget);
    this.clampSelection(fields.length);
    const field = fields[this.selected];
    if (!field) return;
    if (matchesKey(data, Key.up)) this.selected = wrap(this.selected - 1, fields.length);
    else if (matchesKey(data, Key.down)) this.selected = wrap(this.selected + 1, fields.length);
    else if (matchesKey(data, Key.left)) this.adjustField(widget, field, -1);
    else if (matchesKey(data, Key.right) || matchesKey(data, Key.enter))
      this.adjustField(widget, field, 1);
    else if (matchesKey(data, Key.backspace) && field.kind === "text")
      this.setTextField(widget, field.id, getTextField(widget, field.id).slice(0, -1));
    else if (isPrintable(data) && field.kind === "text")
      this.setTextField(widget, field.id, getTextField(widget, field.id) + data);
  }

  private clampSelection(fieldCount: number): void {
    this.selected = Math.min(Math.max(this.selected, 0), Math.max(0, fieldCount - 1));
  }

  private adjustField(widget: WidgetInstance, field: OptionField, delta: number): void {
    const result = applySimpleOptionField(widget, field, delta);
    if (result === "external-status-key") {
      if (
        !cycleExternalStatusKey(
          widget,
          this.ctx.getExtensionStatuses,
          this.ctx.state.config.extensionStatusRow,
          delta,
        )
      )
        return;
    } else if (result === "unchanged") return;
    this.ctx.emitChange();
  }

  private setTextField(widget: WidgetInstance, id: EditField, value: string): void {
    applyTextField(widget, id, value);
    this.ctx.emitChange();
  }
}
