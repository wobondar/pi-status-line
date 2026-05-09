import type { ScreenView } from "./model.js";

export type MainMenuAction =
  | { type: "view"; view: ScreenView }
  | { type: "save-exit" }
  | { type: "discard-exit" };

export interface MainMenuItem {
  label: string;
  description: string;
  action: MainMenuAction;
}

export const MAIN_MENU_HINT = "↑/↓ select • enter option • ctrl+s save • esc exit";

export const MAIN_MENU_ITEMS: readonly MainMenuItem[] = [
  {
    label: "Edit lines",
    description: "Manage status lines and line widgets",
    action: { type: "view", view: "line-list" },
  },
  {
    label: "Edit colors",
    description: "Configure per-widget foreground/background/bold",
    action: { type: "view", view: "color-line-list" },
  },
  {
    label: "Terminal Options",
    description: "Terminal width and color level",
    action: { type: "view", view: "terminal" },
  },
  {
    label: "Global Overrides",
    description: "Global presets, separators, icons, minimalist mode",
    action: { type: "view", view: "global" },
  },
  {
    label: "Pi extensions",
    description: "Published statuses and extension status row visibility",
    action: { type: "view", view: "extension-status-row" },
  },
  {
    label: "Save & Exit",
    description: "Persist changes and close the configuration UI",
    action: { type: "save-exit" },
  },
  {
    label: "Exit without saving",
    description: "Discard unsaved changes and close immediately",
    action: { type: "discard-exit" },
  },
];

export function mainMenuAction(index: number): MainMenuAction {
  return MAIN_MENU_ITEMS[index]?.action ?? { type: "discard-exit" };
}
