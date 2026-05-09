import { describe, expect, it } from "vitest";

import { MainScreen } from "../../src/ui/screens/main.js";
import { key } from "../helpers/keys.js";
import { createScreenHarness } from "../helpers/screen.js";

describe("MainScreen", () => {
  it("renders and applies selected view actions", () => {
    const harness = createScreenHarness();
    const screen = new MainScreen(harness.ctx, harness.render);

    expect(screen.renderScreen(100).join("\n")).toContain("Main Menu");

    screen.handleInput(key.up);
    screen.handleInput(key.down);
    screen.handleInput(key.down);
    screen.handleInput(key.enter);
    expect(harness.shown).toEqual(["color-line-list"]);
  });

  it("saves from save action", () => {
    const harness = createScreenHarness();
    const screen = new MainScreen(harness.ctx, harness.render);

    for (let index = 0; index < 5; index += 1) screen.handleInput(key.down);
    screen.handleInput(key.enter);

    expect(harness.saves).toEqual([true]);
  });
});
