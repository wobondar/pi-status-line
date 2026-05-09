import { describe, expect, it } from "vitest";

import { DEFAULT_CONFIG } from "../src/config.js";
import { createScreenState } from "../src/ui/screen-state.js";

describe("ScreenState", () => {
  it("contains only shared screen state", () => {
    const state = createScreenState(DEFAULT_CONFIG);

    expect(state).toEqual({
      config: DEFAULT_CONFIG,
      view: "main",
      viewBeforeConfirmExit: "main",
      selectedLine: 0,
      selectedWidget: 0,
    });
    expect("selectedMain" in state).toBe(false);
    expect("filter" in state).toBe(false);
  });
});
