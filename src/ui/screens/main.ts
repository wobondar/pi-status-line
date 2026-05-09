import { Key, matchesKey } from "@earendil-works/pi-tui";

import { wrap } from "../helpers.js";
import { MAIN_MENU_HINT, MAIN_MENU_ITEMS, mainMenuAction } from "../main-menu.js";
import { Controller } from "./controller.js";

export class MainScreen extends Controller {
  private selected = 0;

  renderScreen(width: number): string[] {
    return [
      this.render.line(
        this.render.menuTitle(
          "Main Menu",
          "Configure any number of status lines with various widgets",
        ),
        width,
      ),
      this.render.line(this.ctx.theme.dim(MAIN_MENU_HINT), width),
      ...MAIN_MENU_ITEMS.map((item, index) =>
        this.render.menuLine(
          index === this.selected,
          `${item.label} ${this.ctx.theme.dim(item.description)}`,
          width,
        ),
      ),
    ];
  }

  handleInput(data: string): void {
    if (matchesKey(data, Key.up)) this.selected = wrap(this.selected - 1, MAIN_MENU_ITEMS.length);
    else if (matchesKey(data, Key.down))
      this.selected = wrap(this.selected + 1, MAIN_MENU_ITEMS.length);
    else if (matchesKey(data, Key.enter)) this.applySelectedAction();
  }

  private applySelectedAction(): void {
    const action = mainMenuAction(this.selected);
    if (action.type === "view") this.ctx.show(action.view);
    else if (action.type === "save-exit") this.ctx.save(true);
    else this.ctx.exitWithoutSaving();
  }
}
