import type { Theme } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";

import { createWidget, DEFAULT_CONFIG } from "../src/config.js";
import { OverlayRender } from "../src/ui/overlay-render.js";
import { ScreenRender } from "../src/ui/screen-render.js";
import { stripAnsi } from "./helpers/ansi.js";
import { testTheme } from "./helpers/screen.js";

const identityPiTheme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
  bold: (text: string) => text,
} as unknown as Theme;

const previewData = {
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
  cwd: "/tmp/pi-footer",
  activeToolCount: 0,
  usingSubscription: false,
  contextTokens: 0,
  contextMaxTokens: 100,
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

describe("OverlayRender", () => {
  it("renders preview, title, body, fill, and bottom border", () => {
    const overlay = new OverlayRender(testTheme, new ScreenRender(testTheme));
    const lines = overlay.render({
      width: 100,
      terminalRows: 12,
      activeLineCount: 1,
      visibleRowCount: 5,
      config: { ...DEFAULT_CONFIG, lines: [[createWidget("model")]] },
      previewData,
      getExtensionStatuses: () => new Map(),
      theme: identityPiTheme,
      configStateText: "Saved",
      body: ["body line"],
    });
    const rendered = lines.join("\n");
    const plain = stripAnsi(rendered);

    expect(plain).toContain("Preview");
    expect(plain).toContain("claude-sonnet-4-5");
    expect(plain).toContain("pi-footer configuration");
    expect(plain).toContain("Saved");
    expect(plain).toContain("body line");
    expect(lines).toHaveLength(12);
    expect(lines.at(-1)).toContain("╰");
  });

  it("does not fill when the overlay already exceeds the terminal rows", () => {
    const overlay = new OverlayRender(testTheme, new ScreenRender(testTheme));
    const lines = overlay.render({
      width: 80,
      terminalRows: 2,
      activeLineCount: 1,
      visibleRowCount: 5,
      config: { ...DEFAULT_CONFIG, lines: [[createWidget("model")]] },
      previewData,
      getExtensionStatuses: () => new Map(),
      theme: identityPiTheme,
      configStateText: "",
      body: ["body line"],
    });

    expect(lines.length).toBeGreaterThan(2);
    expect(lines.at(-1)).toContain("╰");
  });
});
