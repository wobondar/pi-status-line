import { describe, expect, it } from "vitest";

import { createWidget, DEFAULT_CONFIG, normalizeConfig } from "../src/config.js";
import { STATUS_KEY } from "../src/constants.js";
import {
  allExtensionStatusEntries,
  EMPTY_STATUS_LABEL,
  extensionStatusEntries,
  toggleExtensionStatusRowKey,
  visibleExtensionStatusRowEntries,
} from "../src/extension-statuses.js";
import { renderStatusline } from "../src/render.js";
import type { StatuslineData } from "../src/types.js";
import { cycleExternalStatusKey, statusKeyPickerLines } from "../src/ui/extension-status-picker.js";
import {
  extensionStatusRowLines,
  toggleExtensionStatusRowSelection,
} from "../src/ui/extension-statuses.js";
import { fieldsForWidget, fieldValue } from "../src/ui/fields.js";

const data: StatuslineData = {
  model: "claude-sonnet-4-5",
  provider: "anthropic",
  sessionName: "demo",
  sessionId: "session-123",
  thinkingLevel: "high",
  textVerbosity: "low",
  git: {
    branch: "main",
    sha: "abc1234",
    root: "pi-footer",
    staged: 0,
    unstaged: 0,
    untracked: 0,
    insertions: 0,
    deletions: 0,
    ahead: 0,
    behind: 0,
    remote: null,
    isRepo: true,
  },
  cwd: "/Users/example/projects/pi-footer",
  activeToolCount: 0,
  usingSubscription: false,
  contextTokens: 25_000,
  contextMaxTokens: 100_000,
  metrics: {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    costUsd: 0,
    userMessages: 0,
    assistantMessages: 0,
    toolResults: 0,
    firstTimestampMs: 0,
    lastTimestampMs: 0,
    compactions: 0,
  },
  eventWidgets: new Map(),
};

describe("extension status helpers", () => {
  it("returns sorted non-empty extension statuses except the pi-footer itself", () => {
    expect(
      extensionStatusEntries(
        new Map([
          ["z-extension", "z"],
          [STATUS_KEY, "ours"],
          ["empty-extension", ""],
          ["a-extension", "a"],
        ]),
        STATUS_KEY,
      ),
    ).toEqual([
      { key: "a-extension", value: "a", published: true },
      { key: "z-extension", value: "z", published: true },
    ]);
  });

  it("filters hidden extension status row keys", () => {
    expect(
      visibleExtensionStatusRowEntries(
        new Map([
          ["visible", "on"],
          ["hidden", "off"],
        ]),
        ["hidden"],
        STATUS_KEY,
      ),
    ).toEqual([{ key: "visible", value: "on", published: true }]);
  });

  it("includes hidden unpublished keys in complete status lists", () => {
    expect(
      allExtensionStatusEntries(
        new Map([
          ["visible", "on"],
          [STATUS_KEY, "ours"],
        ]),
        { hiddenKeys: ["hidden"], knownKeys: [] },
        STATUS_KEY,
      ),
    ).toEqual([
      { key: "hidden", value: EMPTY_STATUS_LABEL, published: false },
      { key: "visible", value: "on", published: true },
    ]);
  });

  it("toggles hidden extension status row keys and remembers interacted keys", () => {
    expect(toggleExtensionStatusRowKey({ hiddenKeys: ["b"], knownKeys: [] }, "a")).toEqual({
      hiddenKeys: ["a", "b"],
      knownKeys: ["a"],
    });
    expect(toggleExtensionStatusRowKey({ hiddenKeys: ["a", "b"], knownKeys: ["a"] }, "a")).toEqual({
      hiddenKeys: ["b"],
      knownKeys: ["a"],
    });
  });

  it("normalizes extension status row config", () => {
    const config = normalizeConfig({
      extensionStatusRow: { hiddenKeys: ["z", "", "a", "z", 1], knownKeys: ["k", "", "k"] },
    });
    expect(config.extensionStatusRow).toEqual({ hiddenKeys: ["a", "z"], knownKeys: ["k"] });
  });
});
describe("extension status UI helpers", () => {
  const line = (content: string) => content;
  const menuLine = (selected: boolean, content: string) => `${selected ? "> " : "  "}${content}`;
  const identity = (text: string) => text;

  it("renders Pi extensions menu with title, hint, aligned states, and hidden empty keys", () => {
    const lines = extensionStatusRowLines(
      {
        ...DEFAULT_CONFIG,
        extensionStatusRow: { hiddenKeys: ["hidden"], knownKeys: [] },
      },
      () =>
        new Map([
          ["visible", "on"],
          [STATUS_KEY, "ours"],
        ]),
      0,
      120,
      (title, subtitle) => `${title} ${subtitle}`,
      line,
      menuLine,
      identity,
      identity,
      identity,
    );

    expect(lines[0]).toBe("Pi extensions Published statuses and extension status row visibility");
    expect(lines[1]).toBe("↑/↓ select • pgup/pgdn jump • ←/→ or enter toggle • esc back");
    expect(lines).toContain(`> off hidden ${EMPTY_STATUS_LABEL}`);
    expect(lines).toContain("  on  visible on");
    expect(lines.join("\n")).not.toContain(STATUS_KEY);
    expect(lines.find((entry) => entry.includes("hidden"))?.indexOf("hidden")).toBe(
      lines.find((entry) => entry.includes("visible"))?.indexOf("visible"),
    );
  });

  it("renders empty extension status menus and ignores invalid selections", () => {
    const config = { ...DEFAULT_CONFIG, extensionStatusRow: { hiddenKeys: [], knownKeys: [] } };

    expect(
      extensionStatusRowLines(
        config,
        () => new Map(),
        0,
        80,
        (title, subtitle) => `${title} ${subtitle}`,
        line,
        menuLine,
        identity,
        identity,
        identity,
      ).join("\n"),
    ).toContain("No extension statuses are currently available.");
    expect(toggleExtensionStatusRowSelection(config, () => new Map(), 0)).toBe(false);
    expect(
      statusKeyPickerLines(
        createWidget("external-status"),
        () => new Map(),
        { hiddenKeys: [], knownKeys: [] },
        1,
        80,
        line,
        menuLine,
        identity,
      ).join("\n"),
    ).toContain("Type a key manually");
    expect(
      cycleExternalStatusKey(
        createWidget("external-status"),
        () => new Map(),
        { hiddenKeys: [], knownKeys: [] },
        1,
      ),
    ).toBe(false);
  });

  it("keeps an unpublished status visible after toggling it back on", () => {
    const config = {
      ...DEFAULT_CONFIG,
      extensionStatusRow: { hiddenKeys: ["hidden"], knownKeys: ["hidden"] },
    };

    expect(toggleExtensionStatusRowSelection(config, () => new Map(), 0)).toBe(true);
    expect(config.extensionStatusRow).toEqual({ hiddenKeys: [], knownKeys: ["hidden"] });

    const lines = extensionStatusRowLines(
      config,
      () => new Map(),
      0,
      120,
      (title, subtitle) => `${title} ${subtitle}`,
      line,
      menuLine,
      identity,
      identity,
      identity,
    );

    expect(lines).toContain(`> on  hidden ${EMPTY_STATUS_LABEL}`);
  });

  it("shows hidden unpublished keys in the status key picker and filters our own key", () => {
    const widget = createWidget("external-status", { externalStatusKey: "visible" });
    const lines = statusKeyPickerLines(
      widget,
      () =>
        new Map([
          ["visible", "on"],
          [STATUS_KEY, "ours"],
        ]),
      { hiddenKeys: ["hidden"], knownKeys: [] },
      1,
      120,
      line,
      menuLine,
      identity,
    );

    expect(lines).toContain(`hidden ${EMPTY_STATUS_LABEL}`);
    expect(lines).toContain("visible on");
    expect(lines.join("\n")).not.toContain(STATUS_KEY);
  });

  it("cycles status picker keys through current and hidden remembered statuses", () => {
    const missing = createWidget("external-status", { externalStatusKey: "missing" });
    expect(
      cycleExternalStatusKey(
        missing,
        () => new Map([["visible", "on"]]),
        { hiddenKeys: ["hidden"], knownKeys: [] },
        -1,
      ),
    ).toBe(true);
    expect(missing.options.externalStatusKey).toBe("visible");

    const widget = createWidget("external-status", { externalStatusKey: "visible" });

    expect(
      cycleExternalStatusKey(
        widget,
        () =>
          new Map([
            ["visible", "on"],
            [STATUS_KEY, "ours"],
          ]),
        { hiddenKeys: ["hidden"], knownKeys: [] },
        1,
      ),
    ).toBe(true);
    expect(widget.options.externalStatusKey).toBe("hidden");
  });

  it("offers raw value and custom icon options without a predefined icon", () => {
    const widget = createWidget("external-status", { externalStatusKey: "pi-codex-fast" });

    expect(
      fieldsForWidget(widget).map((field) => `${field.label}: ${fieldValue(widget, field)}`),
    ).toEqual([
      "Enabled: on",
      "Status key: pi-codex-fast",
      "Trim value: 0",
      "Preserve trim styles: on",
      "Raw value only: off",
      "Hide when empty: on",
      "Custom icon: (empty)",
    ]);
    expect(widget.options.raw).toBe(false);
    expect(widget.options.icon).toBeUndefined();
  });
});

describe("Pi Extension Status widget", () => {
  it("renders a value from current extension statuses", () => {
    const line = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        lines: [[createWidget("external-status", { externalStatusKey: "pi-codex-fast" })]],
      },
      data,
      200,
      { getExtensionStatuses: () => new Map([["pi-codex-fast", "fast"]]) },
    );

    expect(line).toBe("fast");
  });

  it("allows duplicate widgets for the same status key", () => {
    const line = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        separator: "space",
        lines: [
          [
            createWidget("external-status", { externalStatusKey: "pi-codex-fast" }),
            createWidget("external-status", { externalStatusKey: "pi-codex-fast" }),
          ],
        ],
      },
      data,
      200,
      { getExtensionStatuses: () => new Map([["pi-codex-fast", "fast"]]) },
    );

    expect(line).toBe("fast fast");
  });

  it("hides missing values by default", () => {
    const line = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        lines: [[createWidget("external-status", { externalStatusKey: "missing" })]],
      },
      data,
      200,
      { getExtensionStatuses: () => new Map() },
    );

    expect(line).toBe("");
  });

  it("renders configured empty text when not hidden", () => {
    const line = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        lines: [
          [
            createWidget("external-status", {
              externalStatusKey: "missing",
              hideWhenEmpty: false,
              text: "not set",
            }),
          ],
        ],
      },
      data,
      200,
      { getExtensionStatuses: () => new Map() },
    );

    expect(line).toBe("not set");
  });

  it("does not read current extension statuses when the status key is empty", () => {
    const line = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        lines: [
          [createWidget("external-status", { externalStatusKey: "  ", hideWhenEmpty: false })],
        ],
      },
      data,
      200,
      {
        getExtensionStatuses: () => {
          throw new Error("should not read statuses for an empty key");
        },
      },
    );

    expect(line).toBe("-");
  });

  it("trims leading visible characters from status values", () => {
    const statuses = new Map([
      ["enabled", "● Enabled"],
      ["disabled", "◌ Disabled"],
    ]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [createWidget("external-status", { externalStatusKey: "enabled", trimValue: 2 })],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("Enabled");

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [createWidget("external-status", { externalStatusKey: "disabled", trimValue: 2 })],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("Disabled");
  });

  it("preserves trim-boundary ANSI styles by default", () => {
    const statuses = new Map([["styled", "\x1b[33m● Enabled\x1b[39m"]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [[createWidget("external-status", { externalStatusKey: "styled", trimValue: 2 })]],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("\x1b[33mEnabled\x1b[39m");
  });

  it("applies preserved trim-boundary ANSI styles to custom icons", () => {
    const statuses = new Map([["styled", "\x1b[33m● auto-accept\x1b[39m"]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [
              createWidget("external-status", {
                externalStatusKey: "styled",
                trimValue: 2,
                icon: "⚔︎ ",
              }),
            ],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("\x1b[33m⚔︎ auto-accept\x1b[39m");
  });

  it("can trim status values without preserving trim-boundary ANSI styles", () => {
    const statuses = new Map([["styled", "\x1b[33m● Enabled\x1b[39m"]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [
              createWidget("external-status", {
                externalStatusKey: "styled",
                trimValue: 2,
                preserveTrimStyles: false,
              }),
            ],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("Enabled\x1b[39m");
  });

  it("preserves existing styles after the trimmed prefix", () => {
    const statuses = new Map([["styled", "\x1b[31m●\x1b[39m \x1b[32mEnabled\x1b[39m"]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [[createWidget("external-status", { externalStatusKey: "styled", trimValue: 2 })]],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toContain("\x1b[32mEnabled\x1b[39m");
  });

  it("renders a custom icon unless raw value only is enabled", () => {
    const statuses = new Map([["pi-codex-fast", "fast"]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [createWidget("external-status", { externalStatusKey: "pi-codex-fast", icon: "⚡" })],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("⚡fast");

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [
              createWidget("external-status", {
                externalStatusKey: "pi-codex-fast",
                icon: "⚡",
                raw: true,
              }),
            ],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("fast");
  });

  it("preserves incoming styling unless widget colors override it", () => {
    const styledStatus = "\x1b[31mfast\x1b[39m";
    const statuses = new Map([["pi-codex-fast", styledStatus]]);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [[createWidget("external-status", { externalStatusKey: "pi-codex-fast" })]],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe(styledStatus);

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [
            [createWidget("external-status", { externalStatusKey: "pi-codex-fast", fg: "blue" })],
          ],
        },
        data,
        200,
        { getExtensionStatuses: () => statuses },
      ),
    ).toBe("\x1b[34mfast\x1b[39m");
  });
});
