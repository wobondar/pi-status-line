import { describe, expect, it } from "vitest";

import { gradientText, retroText, sampleLoopingGradient } from "../src/ui/gradient.js";

describe("retro gradient", () => {
  it("handles empty, single-character, and multi-character text", () => {
    expect(gradientText("", [[1, 2, 3]], 0)).toBe("");
    expect(gradientText("A", [[1, 2, 3]], 0.5)).toContain("38;2;1;2;3mA");
    expect(retroText("AB", 0)).toContain("A");
  });

  it("samples fallback, single-stop, looping, and sparse gradients", () => {
    expect(sampleLoopingGradient([], 0)).toEqual([255, 255, 255]);
    expect(sampleLoopingGradient([[1, 2, 3]], 0.5)).toEqual([1, 2, 3]);
    expect(
      sampleLoopingGradient(
        [
          [0, 0, 0],
          [10, 10, 10],
        ],
        -0.25,
      ),
    ).toEqual([5, 5, 5]);
    expect(
      sampleLoopingGradient(Array.from({ length: 2 }) as [[number, number, number]], 0),
    ).toEqual([255, 255, 255]);
    expect(
      sampleLoopingGradient([[1, 1, 1], undefined] as unknown as [[number, number, number]], 0.4),
    ).toEqual([1, 1, 1]);
  });
});
