import { describe, expect, it } from "vitest";

import { ConfirmExitScreen } from "../../src/ui/screens/confirm-exit.js";
import { key } from "../helpers/keys.js";
import { createScreenHarness } from "../helpers/screen.js";

describe("ConfirmExitScreen", () => {
  it("returns, saves, and discards", () => {
    const harness = createScreenHarness();
    harness.ctx.state.viewBeforeConfirmExit = "terminal";
    const screen = new ConfirmExitScreen(harness.ctx, harness.render);

    expect(screen.renderScreen(100).join("\n")).toContain("Unsaved changes");

    screen.handleInput(key.escape);
    expect(harness.shown).toEqual(["terminal"]);

    screen.handleInput(key.down);
    screen.handleInput(key.up);
    screen.handleInput(key.right);
    screen.handleInput(key.left);
    screen.handleInput(key.enter);
    screen.handleInput("s");
    expect(harness.saves).toEqual([true, true]);

    screen.handleInput("x");
    expect(harness.exits).toBe(1);
  });
});
