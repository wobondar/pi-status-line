import type { GetExtensionStatuses } from "../extension-statuses.js";
import type { WidgetInstance } from "../types.js";
import type { ScreenView } from "./model.js";
import type { ScreenState } from "./screen-state.js";
import type { UiTheme } from "./theme.js";

export interface ScreenContext {
  state: ScreenState;
  theme: UiTheme;
  getExtensionStatuses: GetExtensionStatuses;
  currentLine(): WidgetInstance[];
  currentWidget(): WidgetInstance | undefined;
  visibleRowCount(): number;
  show(view: ScreenView): void;
  emitChange(): void;
  save(exitAfterSave: boolean): void;
  exitWithoutSaving(): void;
}
