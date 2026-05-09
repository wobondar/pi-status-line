import type { StatuslineConfig } from "../types.js";
import type { ScreenView } from "./model.js";

export interface ScreenState {
  config: StatuslineConfig;
  view: ScreenView;
  viewBeforeConfirmExit: ScreenView;
  selectedLine: number;
  selectedWidget: number;
}

export function createScreenState(config: StatuslineConfig): ScreenState {
  return {
    config,
    view: "main",
    viewBeforeConfirmExit: "main",
    selectedLine: 0,
    selectedWidget: 0,
  };
}
