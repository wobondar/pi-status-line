import { describe, expect, it } from "vitest";

import { createWidget, DEFAULT_CONFIG } from "../src/config.js";
import {
  createEventWidgetId,
  eventWidgetUsage,
  EventWidgetValues,
  UPDATE_EVENT_WIDGET_EVENT,
} from "../src/event-widgets.js";
import { renderStatusline } from "../src/render.js";
import type { StatuslineData } from "../src/types.js";
import { eventWidgetUsageLines } from "../src/ui/events.js";
import { fieldsForWidget, fieldValue } from "../src/ui/fields.js";

const data: StatuslineData = {
  model: undefined,
  provider: undefined,
  sessionName: undefined,
  sessionId: undefined,
  thinkingLevel: undefined,
  textVerbosity: undefined,
  git: {
    branch: null,
    sha: null,
    root: null,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    insertions: 0,
    deletions: 0,
    ahead: 0,
    behind: 0,
    remote: null,
    isRepo: false,
  },
  cwd: "/tmp",
  activeToolCount: 0,
  usingSubscription: false,
  contextTokens: undefined,
  contextMaxTokens: undefined,
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

describe("event widget UI", () => {
  it("renders usage lines", () => {
    const lines = eventWidgetUsageLines(
      createWidget("event", { widgetId: "fast_mode" }),
      80,
      (content) => content,
      (text) => `<${text}>`,
    );

    expect(lines[0]).toBe("");
    expect(lines[1]).toBe("<Send events with a value:>");
    expect(lines[2]).toContain("fast_mode");
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("<Send events to remove status:>");
    expect(lines[5]).toContain("fast_mode");

    const eventWithoutId = createWidget("event");
    delete eventWithoutId.options.widgetId;
    const linesWithoutId = eventWidgetUsageLines(
      eventWithoutId,
      80,
      (content) => content,
      (text) => text,
    );
    expect(linesWithoutId[2]).toContain('"widgetId": ""');
    expect(linesWithoutId[5]).toContain('"value": null');
  });

  it("offers raw value and custom icon options without a predefined icon", () => {
    const widget = createWidget("event", { widgetId: "fast_mode" });

    expect(
      fieldsForWidget(widget).map((field) => `${field.label}: ${fieldValue(widget, field)}`),
    ).toEqual([
      "Enabled: on",
      "Widget ID: fast_mode",
      "Raw value only: off",
      "Hide when empty: on",
      "Custom icon: (empty)",
    ]);
    expect(widget.options.raw).toBe(false);
    expect(widget.options.icon).toBeUndefined();
  });
});

describe("event widgets", () => {
  it("generates editable prefixed widget IDs", () => {
    const id = createEventWidgetId();
    expect(id).toMatch(/^event_[a-z0-9]+$/);
  });

  it("documents the pi.events payload for extension authors", () => {
    expect(eventWidgetUsage("service_tier")).toBe(
      `pi.events.emit("${UPDATE_EVENT_WIDGET_EVENT}", { "widgetId": "service_tier", "value": "" })`,
    );
  });

  it("stores, updates, and clears values", () => {
    const values = new EventWidgetValues();

    expect(values.update({ widgetId: "service_tier", value: "fast" })).toBe(true);
    expect(values.values.get("service_tier")).toBe("fast");

    expect(values.update({ widgetId: "service_tier", value: "fast" })).toBe(false);
    expect(values.update({ widgetId: "service_tier", value: "slow" })).toBe(true);
    expect(values.values.get("service_tier")).toBe("slow");

    expect(values.update({ widgetId: "service_tier", value: null })).toBe(true);
    expect(values.values.has("service_tier")).toBe(false);
  });

  it("ignores malformed payloads", () => {
    const values = new EventWidgetValues();
    expect(values.update({ widgetId: "service_tier", value: 1 })).toBe(false);
    expect(values.update({ value: "fast" })).toBe(false);
    expect(values.values.size).toBe(0);
  });

  it("renders a custom icon unless raw value only is enabled", () => {
    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [[createWidget("event", { widgetId: "fast_mode", icon: "⚡" })]],
        },
        { ...data, eventWidgets: new Map([["fast_mode", "on"]]) },
        200,
      ),
    ).toBe("⚡on");

    expect(
      renderStatusline(
        {
          ...DEFAULT_CONFIG,
          lines: [[createWidget("event", { widgetId: "fast_mode", icon: "⚡", raw: true })]],
        },
        { ...data, eventWidgets: new Map([["fast_mode", "on"]]) },
        200,
      ),
    ).toBe("on");
  });
});
