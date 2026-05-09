import type { Theme } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { afterEach, describe, expect, it } from "vitest";

import { configWithPreset, createWidget, DEFAULT_CONFIG } from "../src/config.js";
import {
  fishStylePath,
  formatCost,
  formatCount,
  formatDuration,
  formatPiTokenCount,
  fullHomePath,
  renderStatusline,
  renderStatuslines,
  shortenPath,
} from "../src/render.js";
import type { StatuslineData, WidgetInstance, WidgetType } from "../src/types.js";
import { WIDGET_DEFINITIONS } from "../src/types.js";

const taggedTheme = {
  fg: (color: string, text: string) => `<${color}>${text}</${color}>`,
  bg: (color: string, text: string) => `<${color}>${text}</${color}>`,
  bold: (text: string) => `<bold>${text}</bold>`,
} as unknown as Theme;

const plainConfig = {
  ...DEFAULT_CONFIG,
  terminal: { ...DEFAULT_CONFIG.terminal, colorLevel: "none" },
} satisfies typeof DEFAULT_CONFIG;

const originalHome = process.env.HOME;

afterEach(() => {
  process.env.HOME = originalHome;
});

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
    root: "pi-status-line",
    staged: 1,
    unstaged: 2,
    untracked: 3,
    insertions: 10,
    deletions: 4,
    ahead: 1,
    behind: 0,
    remote: "git@github.com:example/pi-status-line.git",
    isRepo: true,
  },
  cwd: "/Users/example/projects/pi-status-line",
  activeToolCount: 4,
  usingSubscription: false,
  contextTokens: 25_000,
  contextMaxTokens: 100_000,
  metrics: {
    inputTokens: 12_345,
    outputTokens: 6789,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 19_134,
    costUsd: 0.1234,
    userMessages: 2,
    assistantMessages: 2,
    toolResults: 3,
    firstTimestampMs: 0,
    lastTimestampMs: 120_000,
    compactions: 0,
  },
  eventWidgets: new Map(),
};

describe("renderStatusline", () => {
  it("renders configured widgets", () => {
    const line = renderStatusline({ ...plainConfig, iconMode: "text" }, data, 200);
    expect(line).toContain("model anthropic/claude-sonnet-4-5");
    expect(line).toContain("ctx len 25k");
    expect(line).toContain("git main");
    expect(line).toContain("diff (+10,-4)");
    expect(line).toContain("cost $0.1234");
  });

  it("renders pi-footer preset", () => {
    process.env.HOME = "/Users/example";
    const lines = renderStatuslines(
      {
        ...configWithPreset(plainConfig, "pi-footer"),
        terminal: { ...plainConfig.terminal, colorLevel: "none" },
      },
      data,
      100,
    );

    expect(lines[0]).toBe("~/projects/pi-status-line (main) • demo");
    expect(lines[1]).toContain("↑12k ↓6.8k $0.123 25%/100k");
    expect(lines[1]).toContain("claude-sonnet-4-5 • high");
    expect(visibleWidth(lines[1] ?? "")).toBe(100);

    const linesWithCache = renderStatuslines(
      {
        ...configWithPreset(plainConfig, "pi-footer"),
        terminal: { ...plainConfig.terminal, colorLevel: "none" },
      },
      {
        ...data,
        metrics: { ...data.metrics, cacheReadTokens: 533_000, cacheWriteTokens: 1200 },
      },
      120,
    );
    expect(linesWithCache[1]).toContain("↑12k ↓6.8k R533k W1.2k $0.123 25%/100k");
  });

  it("supports pi foreground colors", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          terminal: { ...plainConfig.terminal, colorLevel: "ansi16" },
          lines: [[createWidget("model", { fg: "pi:dim" })]],
        },
        data,
        200,
        { theme: taggedTheme },
      ),
    ).toBe("<dim>🤖 claude-sonnet-4-5</dim>");
  });

  it("renders every widget type", () => {
    const widgets = WIDGET_DEFINITIONS.map((definition) =>
      createWidget(definition.type, {
        hideWhenEmpty: false,
        externalStatusKey: "build",
        widgetId: "flag",
        ...(definition.type === "custom-text" ? { text: "hello" } : {}),
      }),
    );
    const line = renderStatusline(
      { ...plainConfig, separator: "space", lines: [widgets] },
      { ...data, eventWidgets: new Map([["flag", "on"]]) },
      2000,
      { getExtensionStatuses: () => new Map([["build", "ok"]]) },
    );

    expect(line).toContain("anthropic/claude-sonnet-4-5");
    expect(line).toContain("git@github.com:example/pi-status-line.git");
    expect(line).toContain("hello");
    expect(line).toContain("+10/-4");
    expect(line).toContain("2u/2a/3t");
  });

  it("renders widgets with missing optional options", () => {
    const bare = (type: WidgetType): WidgetInstance => ({
      id: `bare-${type}`,
      type,
      enabled: true,
      options: {},
    });
    const line = renderStatusline(
      {
        ...plainConfig,
        separator: "space",
        lines: [
          [
            bare("model"),
            bare("model-provider"),
            bare("context-window"),
            bare("cwd"),
            bare("session-name"),
            bare("event"),
            bare("external-status"),
            bare("tokens"),
            bare("input-tokens"),
            bare("output-tokens"),
            bare("total-tokens"),
            bare("cache-read"),
            bare("cache-write"),
            bare("context-length"),
            bare("context-bar"),
            bare("cost"),
            bare("input-speed"),
            bare("output-speed"),
            bare("total-speed"),
            bare("session-id"),
            bare("git-branch"),
            bare("git-sha"),
            bare("git-root"),
            bare("git-diff"),
            bare("git-remote"),
            bare("custom-text"),
            bare("separator"),
            bare("spacer"),
          ],
        ],
      },
      {
        ...data,
        model: undefined,
        provider: undefined,
        sessionName: undefined,
        sessionId: undefined,
        git: { ...data.git, branch: null, sha: null, root: null, remote: null },
        eventWidgets: new Map(),
      },
      2000,
    );

    expect(line).toContain("🤖 no-model");
    expect(line).toContain("- -");
    expect(line).toContain(" | ");
  });

  it("covers context, timing, path, and fallback formatting branches", () => {
    expect(formatPiTokenCount(1000)).toBe("1.0k");
    expect(formatPiTokenCount(10_000_000)).toBe("10M");
    expect(formatDuration(Number.NaN)).toBe("0m");
    expect(shortenPath("/", 2)).toBe("/");
    process.env.HOME = "/Users/example";
    expect(fullHomePath("/Users/example" as string)).toBe("~");
    expect(fishStylePath("/Users/example/a/b/c", 1)).toBe("~/a/b/c");

    const unknownContext = renderStatusline(
      {
        ...plainConfig,
        lines: [
          [
            createWidget("context-length"),
            createWidget("context"),
            createWidget("context-remaining"),
            createWidget("context-bar"),
            createWidget("context-window"),
            createWidget("input-speed"),
            createWidget("output-speed"),
            createWidget("total-speed"),
            createWidget("session-total-time"),
          ],
        ],
      },
      {
        ...data,
        contextTokens: undefined,
        contextMaxTokens: undefined,
        metrics: { ...data.metrics, firstTimestampMs: 10_000, lastTimestampMs: 1000 },
      },
      200,
    );
    expect(unknownContext).toContain(
      "? • 🧩 ? • 🧩 ? • 📊 ? • 🪟 ? • ⏫ 0/min • ⏬ 0/min • ⚡ 0/min",
    );

    expect(
      renderStatusline(
        { ...plainConfig, lines: [[createWidget("context", { raw: true })]] },
        { ...data, contextMaxTokens: 0 },
        80,
      ),
    ).toBe("25k ctx");
    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [
            [
              createWidget("git-branch", {
                gitBranchDisplayStyle: "custom",
                surroundLeft: "[",
                surroundRight: "]",
              }),
            ],
          ],
        },
        data,
        80,
      ),
    ).toContain("[main]");
  });

  it("supports emoji, nerd icon, and text label modes", () => {
    expect(
      renderStatusline(
        { ...plainConfig, iconMode: "emoji", lines: [[createWidget("model")]] },
        data,
        200,
      ),
    ).toContain("🤖 claude-sonnet-4-5");
    expect(
      renderStatusline(
        { ...plainConfig, iconMode: "nerd", lines: [[createWidget("model")]] },
        data,
        200,
      ),
    ).toContain("󰚩 claude-sonnet-4-5");
    expect(
      renderStatusline(
        { ...plainConfig, iconMode: "text", lines: [[createWidget("model")]] },
        data,
        200,
      ),
    ).toContain("model claude-sonnet-4-5");
  });

  it("lets custom icons override icon mode", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "emoji",
          lines: [[createWidget("model", { icon: "M" })]],
        },
        data,
        200,
      ),
    ).toContain("Mclaude-sonnet-4-5");
  });

  it("renders model capability widgets only when supported", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        iconMode: "text",
        lines: [[createWidget("thinking-level"), createWidget("text-verbosity")]],
      },
      data,
      200,
    );
    expect(line).toContain("thinking high");
    expect(line).toContain("verbosity low");
  });

  it("hides empty session name by default and supports fallback text", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("session-name")]],
        },
        { ...data, sessionName: undefined },
        200,
      ),
    ).toBe("");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "text",
          lines: [[createWidget("session-name", { hideWhenEmpty: false })]],
        },
        { ...data, sessionName: undefined },
        200,
      ),
    ).toBe("session -");
  });

  it("renders event widgets from pi event values", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        lines: [[createWidget("event", { widgetId: "service_tier" })]],
      },
      { ...data, eventWidgets: new Map([["service_tier", "fast"]]) },
      200,
    );
    expect(line).toBe("fast");
  });

  it("hides empty event widgets by default", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        lines: [[createWidget("event", { widgetId: "service_tier" })]],
      },
      data,
      200,
    );
    expect(line).toBe("");
  });

  it("renders cwd display styles", () => {
    process.env.HOME = "/Users/example";

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("cwd", { raw: true, segments: 2 })]],
        },
        data,
        200,
      ),
    ).toBe("~/…/projects/pi-status-line");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("cwd", { cwdDisplayStyle: "full-home", raw: true })]],
        },
        data,
        200,
      ),
    ).toBe("~/projects/pi-status-line");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("cwd", { cwdDisplayStyle: "fish", raw: true, segments: 1 })]],
        },
        data,
        200,
      ),
    ).toBe("~/p/pi-status-line");
  });

  it("renders conditional context colors", () => {
    const config = {
      ...DEFAULT_CONFIG,
      terminal: { ...DEFAULT_CONFIG.terminal, colorLevel: "ansi16" as const },
      lines: [
        [
          createWidget("context", {
            raw: true,
            contextConditionalColors: true,
            warningFg: "yellow",
            dangerFg: "red",
          }),
        ],
      ],
    };

    expect(
      renderStatusline(config, { ...data, contextTokens: 80_000, contextMaxTokens: 100_000 }, 200),
    ).toBe("\x1b[33m80%\x1b[39m");

    expect(
      renderStatusline(config, { ...data, contextTokens: 95_000, contextMaxTokens: 100_000 }, 200),
    ).toBe("\x1b[31m95%\x1b[39m");

    expect(
      renderStatusline(
        {
          ...config,
          lines: [
            [createWidget("context", { raw: true, fg: "green", contextConditionalColors: true })],
          ],
        },
        { ...data, contextTokens: 50_000, contextMaxTokens: 100_000 },
        200,
      ),
    ).toBe("\x1b[32m50%\x1b[39m");
  });

  it("renders token format styles", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("tokens", { tokenFormatStyle: "compact", raw: true })]],
        },
        data,
        200,
      ),
    ).toBe("↑12k ↓6.8k");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("context-bar", { tokenFormatStyle: "compact", raw: true })]],
        },
        { ...data, contextTokens: 123_456, contextMaxTokens: 2_000_000 },
        200,
      ),
    ).toContain("123k/2.0M");
  });

  it("renders cost format styles", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("cost", { costFormatStyle: "compact", raw: true })]],
        },
        data,
        200,
      ),
    ).toBe("$0.123");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [
            [
              createWidget("cost", {
                costFormatStyle: "compact",
                showSubscription: true,
                raw: true,
              }),
            ],
          ],
        },
        { ...data, usingSubscription: true },
        200,
      ),
    ).toBe("$0.123 (sub)");
  });

  it("renders context length", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "emoji",
          lines: [[createWidget("context-length")]],
        },
        data,
        200,
      ),
    ).toBe("📏 25k");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "text",
          lines: [[createWidget("context-length")]],
        },
        { ...data, contextTokens: undefined },
        200,
      ),
    ).toBe("ctx len ?");
  });

  it("renders git branch display styles", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("git-branch", { raw: true })]],
        },
        data,
        200,
      ),
    ).toBe("main");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [
            [createWidget("git-branch", { gitBranchDisplayStyle: "round-brackets", raw: true })],
          ],
        },
        data,
        200,
      ),
    ).toBe("(main)");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [
            [
              createWidget("git-branch", {
                gitBranchDisplayStyle: "custom",
                surroundLeft: "[",
                surroundRight: "]",
                raw: true,
              }),
            ],
          ],
        },
        data,
        200,
      ),
    ).toBe("[main]");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [
            [createWidget("git-branch", { gitBranchDisplayStyle: "round-brackets", raw: true })],
          ],
        },
        { ...data, git: { ...data.git, branch: null } },
        200,
      ),
    ).toBe("");
  });

  it("renders git diff display modes", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "text",
          lines: [[createWidget("git-diff")]],
        },
        data,
        200,
      ),
    ).toBe("diff +10/-4");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("git-diff", { gitDiffMode: "compact", raw: true })]],
        },
        data,
        200,
      ),
    ).toBe("(+10,-4)");
  });

  it("renders context bar display modes", () => {
    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "text",
          lines: [[createWidget("context-bar")]],
        },
        { ...data, contextTokens: 50_000, contextMaxTokens: 200_000 },
        200,
      ),
    ).toBe("Context: [████████░░░░░░░░░░░░░░░░░░░░░░░░] 50k/200k (25%)");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          iconMode: "text",
          lines: [[createWidget("context-bar", { contextBarMode: "short" })]],
        },
        { ...data, contextTokens: 50_000, contextMaxTokens: 200_000 },
        200,
      ),
    ).toBe("Context: ▓▓▓░░░░░░░ 50k/200k (25%)");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("context-bar", { contextBarMode: "short-only", raw: true })]],
        },
        { ...data, contextTokens: 50_000, contextMaxTokens: 200_000 },
        200,
      ),
    ).toBe("▓▓▓░░░░░░░");

    expect(
      renderStatusline(
        {
          ...plainConfig,
          lines: [[createWidget("context-bar", { contextBarMode: "medium", raw: true })]],
        },
        { ...data, contextTokens: 50_000, contextMaxTokens: 200_000 },
        200,
      ),
    ).toBe("[████░░░░░░░░░░░░] 50k/200k (25%)");
  });

  it("renders event widget fallback text when not hidden", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        lines: [[createWidget("event", { widgetId: "service_tier", hideWhenEmpty: false })]],
      },
      data,
      200,
    );
    expect(line).toBe("-");
  });

  it("renders model widget without provider by default", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        iconMode: "text",
        lines: [[createWidget("model")]],
      },
      data,
      200,
    );
    expect(line).toContain("model claude-sonnet-4-5");
    expect(line).not.toContain("anthropic/claude-sonnet-4-5");
  });

  it("respects model widget showProvider option", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        iconMode: "text",
        lines: [[createWidget("model", { showProvider: true })]],
      },
      data,
      200,
    );
    expect(line).toContain("model anthropic/claude-sonnet-4-5");
  });

  it("supports duplicate widget instances", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("model")]],
      },
      data,
      200,
    );
    expect(line.match(/model claude-sonnet-4-5/g)).toHaveLength(2);
  });

  it("supports no global separator", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        separator: "none",
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("cost")]],
      },
      data,
      200,
    );
    expect(line).toBe("model claude-sonnet-4-5cost $0.1234");
  });

  it("applies global separator colors only to global separators", () => {
    const globalLine = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        separatorFg: "red",
        lines: [
          [createWidget("custom-text", { text: "A" }), createWidget("custom-text", { text: "B" })],
        ],
      },
      data,
      200,
    );
    expect(globalLine).toBe("A\x1b[31m • \x1b[39mB");

    const widgetLine = renderStatusline(
      {
        ...DEFAULT_CONFIG,
        separatorFg: "red",
        lines: [
          [
            createWidget("custom-text", { text: "A" }),
            createWidget("separator"),
            createWidget("custom-text", { text: "B" }),
          ],
        ],
      },
      data,
      200,
    );
    expect(widgetLine).toBe("A | B");
  });

  it("does not add global separators around separator widgets", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        separator: "dot",
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("separator"), createWidget("cost")]],
      },
      data,
      200,
    );
    expect(line).toContain("model claude-sonnet-4-5 | cost $0.1234");
    expect(line).not.toContain("• | ");
    expect(line).not.toContain(" |  •");
  });

  it("supports custom separator widgets", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        separator: "dot",
        iconMode: "text",
        lines: [
          [
            createWidget("model"),
            createWidget("separator", { separator: "custom", text: " ~~ " }),
            createWidget("cost"),
          ],
        ],
      },
      data,
      200,
    );
    expect(line).toContain("model claude-sonnet-4-5 ~~ cost $0.1234");
  });

  it("supports dash and comma separator widgets", () => {
    const commaLine = renderStatusline(
      {
        ...plainConfig,
        separator: "dot",
        iconMode: "text",
        lines: [
          [
            createWidget("model"),
            createWidget("separator", { separator: "comma" }),
            createWidget("thinking-level"),
          ],
        ],
      },
      data,
      200,
    );
    expect(commaLine).toBe("model claude-sonnet-4-5, thinking high");

    const dashLine = renderStatusline(
      {
        ...plainConfig,
        separator: "dot",
        iconMode: "text",
        lines: [
          [
            createWidget("model"),
            createWidget("separator", { separator: "dash" }),
            createWidget("thinking-level"),
          ],
        ],
      },
      data,
      200,
    );
    expect(dashLine).toBe("model claude-sonnet-4-5 - thinking high");
  });

  it("supports dash and comma separators", () => {
    const commaLine = renderStatusline(
      {
        ...plainConfig,
        separator: "comma",
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("thinking-level")]],
      },
      data,
      200,
    );
    expect(commaLine).toBe("model claude-sonnet-4-5, thinking high");

    const dashLine = renderStatusline(
      {
        ...plainConfig,
        separator: "dash",
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("thinking-level")]],
      },
      data,
      200,
    );
    expect(dashLine).toBe("model claude-sonnet-4-5 - thinking high");
  });

  it("supports flex layout", () => {
    const line = renderStatusline(
      {
        ...plainConfig,
        iconMode: "text",
        lines: [[createWidget("model"), createWidget("flex-separator"), createWidget("cost")]],
      },
      data,
      80,
    );
    expect(visibleWidth(line)).toBe(80);
    expect(line).toContain("cost $0.1234");
  });

  it("respects width", () => {
    const line = renderStatusline(plainConfig, data, 20);
    expect(visibleWidth(line)).toBeLessThanOrEqual(20);
  });

  it("returns empty when disabled", () => {
    expect(renderStatusline({ ...plainConfig, enabled: false }, data, 200)).toBe("");
  });
});

describe("format helpers", () => {
  it("formats large counts", () => {
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(2_000_000)).toBe("2m");
    expect(formatPiTokenCount(9999)).toBe("10.0k");
    expect(formatPiTokenCount(12_345)).toBe("12k");
    expect(formatPiTokenCount(2_000_000)).toBe("2.0M");
  });

  it("formats costs", () => {
    expect(formatCost(0.1234, "default")).toBe("$0.1234");
    expect(formatCost(0.1234, "compact")).toBe("$0.123");
  });

  it("formats durations", () => {
    expect(formatDuration(30_000)).toBe("1m");
    expect(formatDuration(3_600_000)).toBe("1h");
    expect(formatDuration(3_900_000)).toBe("1h 5m");
  });

  it("formats paths", () => {
    process.env.HOME = "/Users/example";

    expect(shortenPath("/a/b/c/d", 2)).toBe("…/c/d");
    expect(fullHomePath("/Users/example/projects/pi-status-line")).toBe(
      "~/projects/pi-status-line",
    );
    expect(fishStylePath("/Users/example/projects/pi-status-line", 1)).toBe("~/p/pi-status-line");
  });
});
