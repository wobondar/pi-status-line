import type { Theme } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";

import { createWidget, DEFAULT_CONFIG } from "../src/config.js";
import { EMPTY_EXTENSION_STATUSES } from "../src/extension-statuses.js";
import type { StatuslineConfig, StatuslineData } from "../src/types.js";
import { StatuslineConfigScreen } from "../src/ui.js";

const identityTheme = {
  fg: (_color: string, text: string) => text,
  bg: (_color: string, text: string) => text,
  bold: (text: string) => text,
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

function screenHarness(
  config: StatuslineConfig = { ...DEFAULT_CONFIG, lines: [[createWidget("model")]] },
) {
  const changes: StatuslineConfig[] = [];
  const saves: StatuslineConfig[] = [];
  const closes: Array<{ config: StatuslineConfig; saved: boolean }> = [];
  const screen = new StatuslineConfigScreen(
    config,
    data,
    () => EMPTY_EXTENSION_STATUSES,
    () => {},
    () => 40,
    {
      onChange: (next) => changes.push(next),
      onSave: async (next) => {
        saves.push(next);
      },
      onClose: (result) => closes.push(result),
      getTheme: () => identityTheme,
    },
  );
  return { screen, changes, saves, closes };
}

describe("StatuslineConfigScreen", () => {
  it("closes immediately on escape when unchanged", () => {
    const { screen, closes } = screenHarness();
    try {
      screen.handleInput("\x1b");

      expect(closes).toHaveLength(1);
      expect(closes[0]?.saved).toBe(false);
    } finally {
      screen.dispose();
    }
  });

  it("saves on ctrl+s without closing", async () => {
    const { screen, saves, closes } = screenHarness();
    try {
      screen.handleInput("\x13");
      screen.handleInput("\x13");
      await Promise.resolve();
      await Promise.resolve();

      expect(saves).toHaveLength(1);
      expect(closes).toHaveLength(0);
    } finally {
      screen.dispose();
    }
  });

  it("renders with an invalid selected line fallback", () => {
    const { screen } = screenHarness({ ...DEFAULT_CONFIG, lines: [] });
    try {
      screen.handleInput("\r");
      screen.handleInput("\r");
      expect(screen.render(100).join("\n")).toContain("Empty line");
    } finally {
      screen.dispose();
    }
  });

  it("opens unsaved changes confirmation on escape", () => {
    const { screen } = screenHarness();
    try {
      screen.handleInput("\r");
      screen.handleInput("a");
      screen.handleInput("\x1b");
      screen.handleInput("\x1b");
      const rendered = screen.render(100).join("\n");

      expect(rendered).toContain("Unsaved changes");
      expect(rendered).toContain("Return to config UI");
    } finally {
      screen.dispose();
    }
  });

  it("saves and exits from main menu", async () => {
    const { screen, saves, closes } = screenHarness();
    try {
      for (let index = 0; index < 5; index += 1) screen.handleInput("\x1b[B");
      screen.handleInput("\r");
      await Promise.resolve();
      await Promise.resolve();

      expect(saves).toHaveLength(1);
      expect(closes).toHaveLength(1);
      expect(closes[0]?.saved).toBe(true);
    } finally {
      screen.dispose();
    }
  });

  it("exits without saving from main menu", () => {
    const { screen, saves, closes } = screenHarness();
    try {
      for (let index = 0; index < 6; index += 1) screen.handleInput("\x1b[B");
      screen.handleInput("\r");

      expect(saves).toHaveLength(0);
      expect(closes).toHaveLength(1);
      expect(closes[0]?.saved).toBe(false);
    } finally {
      screen.dispose();
    }
  });

  it("exits without saving from confirmation", () => {
    const { screen, closes } = screenHarness();
    try {
      screen.handleInput("\r");
      screen.handleInput("a");
      screen.handleInput("\x1b");
      screen.handleInput("\x1b");
      screen.handleInput("x");

      expect(closes).toHaveLength(1);
      expect(closes[0]?.saved).toBe(false);
    } finally {
      screen.dispose();
    }
  });
});
