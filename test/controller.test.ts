import { describe, expect, it } from "vitest";

import { Controller } from "../src/ui/screens/controller.js";

describe("Controller", () => {
  it("defines the screen controller contract", () => {
    class TestScreen extends Controller {
      renderScreen(width: number): string[] {
        return [`width:${width}`];
      }

      handleInput(_data: string): void {}
    }

    const screen = new TestScreen({} as never, {} as never);

    expect(screen.renderScreen(80)).toEqual(["width:80"]);
  });
});
