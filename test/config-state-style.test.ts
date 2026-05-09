import type { Theme } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";

import { createWidget, DEFAULT_CONFIG } from "../src/config.js";
import { EMPTY_EXTENSION_STATUSES } from "../src/extension-statuses.js";
import type { StatuslineConfig, StatuslineData } from "../src/types.js";
import { StatuslineConfigScreen } from "../src/ui.js";

const taggedTheme = {
  fg: (color: string, text: string) => `<${color}>${text}</${color}>`,
  bg: (color: string, text: string) => `<${color}>${text}</${color}>`,
  bold: (text: string) => `<bold>${text}</bold>`,
} as unknown as Theme;

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
  cwd: "/tmp/pi-status-line",
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

function screenHarness(
  onSave: (config: StatuslineConfig) => Promise<void> = async () => {},
): StatuslineConfigScreen {
  return new StatuslineConfigScreen(
    { ...DEFAULT_CONFIG, lines: [[createWidget("model")]] },
    data,
    () => EMPTY_EXTENSION_STATUSES,
    () => {},
    () => 20,
    {
      onChange: () => {},
      onSave,
      onClose: () => {},
      getTheme: () => taggedTheme,
    },
  );
}

describe("config state styling", () => {
  it("renders unsaved status as bold warning", () => {
    const screen = screenHarness();
    try {
      screen.handleInput("\r");
      screen.handleInput("a");

      expect(screen.render(120).join("\n")).toContain("<bold><warning>Unsaved</warning></bold>");
    } finally {
      screen.dispose();
    }
  });

  it("renders saved status as accent", async () => {
    const screen = screenHarness();
    try {
      screen.handleInput("\x13");
      await Promise.resolve();
      await Promise.resolve();

      expect(screen.render(120).join("\n")).toContain("<accent>Saved</accent>");
    } finally {
      screen.dispose();
    }
  });

  it("renders failed saves as bold error", async () => {
    const screen = screenHarness(async () => {
      throw new Error("boom");
    });
    try {
      screen.handleInput("\x13");
      await Promise.resolve();
      await Promise.resolve();

      expect(screen.render(120).join("\n")).toContain("<bold><error>Save failed</error></bold>");
    } finally {
      screen.dispose();
    }
  });
});
