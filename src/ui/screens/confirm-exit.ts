import { Key, matchesKey } from "@earendil-works/pi-tui";

import {
  CONFIRM_EXIT_HINT,
  CONFIRM_EXIT_ITEMS,
  confirmExitAction,
  confirmExitShortcut,
  type ConfirmExitAction,
} from "../confirm-exit.js";
import { wrap } from "../helpers.js";
import { Controller } from "./controller.js";

export class ConfirmExitScreen extends Controller {
  private selected = 0;

  renderScreen(width: number): string[] {
    return [
      this.render.line(
        this.render.menuTitle("Unsaved changes", "Choose how to close configuration"),
        width,
      ),
      this.render.line(this.ctx.theme.dim(CONFIRM_EXIT_HINT), width),
      this.render.line(
        this.ctx.theme.warning("You have unsaved statusline configuration changes."),
        width,
      ),
      ...CONFIRM_EXIT_ITEMS.map((item, index) =>
        this.render.menuLine(index === this.selected, item, width),
      ),
    ];
  }

  handleInput(data: string): void {
    if (matchesKey(data, Key.escape)) {
      this.ctx.show(this.ctx.state.viewBeforeConfirmExit);
      return;
    }
    if (matchesKey(data, Key.up) || matchesKey(data, Key.left))
      this.selected = wrap(this.selected - 1, CONFIRM_EXIT_ITEMS.length);
    else if (matchesKey(data, Key.down) || matchesKey(data, Key.right))
      this.selected = wrap(this.selected + 1, CONFIRM_EXIT_ITEMS.length);
    else if (matchesKey(data, Key.enter)) this.applyAction(confirmExitAction(this.selected));
    else {
      const action = confirmExitShortcut(data);
      if (action) this.applyAction(action);
    }
  }

  private applyAction(action: ConfirmExitAction): void {
    if (action === "save") this.ctx.save(true);
    else if (action === "discard") this.ctx.exitWithoutSaving();
    else this.ctx.show(this.ctx.state.viewBeforeConfirmExit);
  }
}
