import { describe, expect, it } from "vitest";

import {
  addWidgetCountLabel,
  addWidgetHint,
  addWidgetItemLabel,
  filterWidgetDefinitions,
} from "../src/ui/add-widget.js";

describe("add widget UI", () => {
  it("formats filter hint", () => {
    expect(addWidgetHint("")).toContain("filter: (none)");
    expect(addWidgetHint("git")).toContain("filter: git");
    expect(addWidgetHint("git")).toContain("enter add");
  });

  it("formats result count", () => {
    expect(addWidgetCountLabel(10, 0, 5)).toBe("10 result(s), showing 1-5");
    expect(addWidgetCountLabel(10, 8, 5)).toBe("10 result(s), showing 9-10");
    expect(addWidgetCountLabel(0, 0, 0)).toBe("0 result(s), showing 1-0");
  });

  it("filters widget definitions by category, label, and type", () => {
    expect(filterWidgetDefinitions("").length).toBeGreaterThan(0);
    expect(
      filterWidgetDefinitions("git").every((definition) => definition.type.includes("git")),
    ).toBe(true);
    expect(filterWidgetDefinitions("working dir").map((definition) => definition.type)).toContain(
      "cwd",
    );
  });

  it("formats widget definition rows", () => {
    expect(
      addWidgetItemLabel(
        {
          type: "model",
          label: "Model",
          category: "Core",
          description: "Active model id",
        },
        (text) => `<${text}>`,
      ),
    ).toBe("Core / Model <Active model id>");
  });
});
