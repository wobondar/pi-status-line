import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it } from "vitest";

import {
  configWithPreset,
  createWidget,
  DEFAULT_CONFIG,
  getConfigPath,
  loadConfig,
  normalizeConfig,
  saveConfig,
  widgetsForPreset,
} from "../src/config.js";

let tempDir: string | undefined;
const originalConfigEnv = process.env.PI_STATUSLINE_CONFIG;

afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = undefined;
  if (originalConfigEnv === undefined) delete process.env.PI_STATUSLINE_CONFIG;
  else process.env.PI_STATUSLINE_CONFIG = originalConfigEnv;
});

describe("config", () => {
  it("uses pi agent extension config path by default and supports env override", () => {
    delete process.env.PI_STATUSLINE_CONFIG;
    expect(getConfigPath()).toBe(join(getAgentDir(), "extensions", "pi-footer.json"));

    process.env.PI_STATUSLINE_CONFIG = "/tmp/custom-pi-footer.json";
    expect(getConfigPath()).toBe("/tmp/custom-pi-footer.json");
  });

  it("normalizes line widget arrays and preserves duplicates", () => {
    const config = normalizeConfig({
      lines: [[createWidget("model"), createWidget("cost"), createWidget("model")]],
      enabled: false,
    });
    expect(config.enabled).toBe(false);
    expect(config.lines[0]?.map((widget) => widget.type)).toEqual(["model", "cost", "model"]);
  });

  it("normalizes icon mode", () => {
    expect(normalizeConfig({ iconMode: "nerd" }).iconMode).toBe("nerd");
    expect(normalizeConfig({ iconMode: "text" }).iconMode).toBe("text");
    expect(normalizeConfig({ iconMode: "nonsense" }).iconMode).toBe(DEFAULT_CONFIG.iconMode);
  });

  it("applies presets", () => {
    const config = configWithPreset(DEFAULT_CONFIG, "compact");
    expect(config.lines[0]?.map((widget) => widget.type)).toEqual(
      widgetsForPreset("compact").map((widget) => widget.type),
    );
    expect(config.preset).toBe("compact");
    expect(config.separator).toBe("space");
    expect(config.terminal.widthMode).toBe("full-minus-40");
  });

  it("applies the powerline preset with explicit colored separator widgets", () => {
    const config = configWithPreset(DEFAULT_CONFIG, "powerline");

    expect(config.separator).toBe("none");
    expect(config.iconMode).toBe("nerd");
    expect(config.terminal.widthMode).toBe("full");
    expect(config.lines[0]?.map((widget) => widget.type)).toEqual([
      "model-provider",
      "separator",
      "git-branch",
      "separator",
      "tokens",
      "separator",
      "context-bar",
      "separator",
      "output-speed",
      "separator",
      "session-total-time",
    ]);
    expect(
      config.lines[0]
        ?.filter((widget) => widget.type === "separator")
        .every(
          (widget) =>
            widget.options.separator === "powerline-right-spaced" &&
            widget.options.fg &&
            widget.options.bg,
        ),
    ).toBe(true);
    expect(config.lines[0]?.[6]?.options).toMatchObject({
      fg: "ansi256:234",
      bg: "ansi256:136",
      contextBarMode: "medium",
    });
    expect(config.lines[0]?.[7]?.options).toMatchObject({
      fg: "ansi256:136",
      bg: "ansi256:37",
    });
  });

  it("applies additional powerline presets", () => {
    for (const preset of ["powerline-bright", "powerline-blocks", "powerline-mono"] as const) {
      const config = configWithPreset(DEFAULT_CONFIG, preset);
      expect(config.separator).toBe("none");
      expect(config.terminal.widthMode).toBe("full");
      expect(config.lines.length).toBeGreaterThan(1);
      expect(config.lines.flat().some((widget) => widget.type === "separator")).toBe(true);
    }
  });

  it("applies the demo preset with pi-footer first", () => {
    const config = configWithPreset(DEFAULT_CONFIG, "demo");

    expect(config.separator).toBe("none");
    expect(config.iconMode).toBe("nerd");
    expect(config.lines.slice(0, 4).map((line) => line.map((widget) => widget.type))).toEqual([
      ["custom-text"],
      ["cwd", "git-branch", "session-name"],
      [
        "tokens",
        "cache-read",
        "cache-write",
        "cost",
        "context",
        "context-window",
        "flex-separator",
        "model",
        "thinking-level",
      ],
      ["custom-text"],
    ]);
    expect(config.lines[0]?.[0]?.options).toMatchObject({
      raw: true,
      fg: "pi:success",
      text: "Preset 'pi-footer':",
    });
    expect(config.lines[3]?.[0]?.options).toMatchObject({ raw: true, text: "" });
    expect(config.lines[4]?.[0]?.options).toMatchObject({ text: "Preset 'powerline':" });
    expect(config.lines.flat().some((widget) => widget.type === "separator")).toBe(true);
  });

  it("applies the pi-footer preset", () => {
    const config = configWithPreset(DEFAULT_CONFIG, "pi-footer");

    expect(config.separator).toBe("none");
    expect(config.iconMode).toBe("text");
    expect(config.lines).toHaveLength(2);
    expect(config.lines[0]?.map((widget) => widget.type)).toEqual([
      "cwd",
      "git-branch",
      "session-name",
    ]);
    expect(config.lines[1]?.map((widget) => widget.type)).toEqual([
      "tokens",
      "cache-read",
      "cache-write",
      "cost",
      "context",
      "context-window",
      "flex-separator",
      "model",
      "thinking-level",
    ]);
    expect(config.lines[0]?.[0]?.options).toMatchObject({
      raw: true,
      fg: "pi:dim",
      cwdDisplayStyle: "full-home",
    });
    expect(config.lines[0]?.[1]?.options).toMatchObject({
      icon: " ",
      fg: "pi:dim",
      hideWhenEmpty: true,
      gitBranchDisplayStyle: "round-brackets",
    });
    expect(config.lines[1]?.[0]?.options).toMatchObject({
      raw: true,
      fg: "pi:dim",
      tokenFormatStyle: "compact",
    });
    expect(config.lines[1]?.[1]?.options).toMatchObject({
      icon: " R",
      fg: "pi:dim",
      tokenFormatStyle: "compact",
      hideWhenZero: true,
    });
    expect(config.lines[1]?.[2]?.options).toMatchObject({
      icon: " W",
      fg: "pi:dim",
      tokenFormatStyle: "compact",
      hideWhenZero: true,
    });
    expect(config.lines[1]?.[3]?.options).toMatchObject({
      icon: " ",
      fg: "pi:dim",
      costFormatStyle: "compact",
      showSubscription: true,
    });
    expect(config.lines[1]?.[4]?.options).toMatchObject({
      icon: " ",
      fg: "pi:dim",
      contextConditionalColors: true,
      warningFg: "pi:warning",
      dangerFg: "pi:error",
      tokenFormatStyle: "compact",
    });
    expect(config.lines[1]?.[5]?.options).toMatchObject({
      icon: "/",
      fg: "pi:dim",
      contextConditionalColors: true,
      warningFg: "pi:warning",
      dangerFg: "pi:error",
      tokenFormatStyle: "compact",
    });
  });

  it("uses semantic default widget foreground colors", () => {
    expect(createWidget("model").options.fg).toBe("cyan");
    expect(createWidget("git-deletions").options.fg).toBe("red");
    expect(createWidget("git-diff").options.fg).toBe("yellow");
    expect(createWidget("context-length").options.fg).toBe("brightBlack");
    expect(createWidget("external-status").options.fg).toBe("default");
    expect(createWidget("external-status").options.trimValue).toBe(0);
    expect(createWidget("external-status").options.preserveTrimStyles).toBe(true);
    expect(createWidget("input-speed").options.fg).toBe("brightMagenta");
    expect(createWidget("output-speed").options.fg).toBe("brightCyan");
    expect(createWidget("total-speed").options.fg).toBe("brightGreen");
    expect(createWidget("model", { fg: "default" }).options.fg).toBe("default");
    expect(createWidget("model", { fg: "pi:dim" }).options.fg).toBe("pi:dim");
  });

  it("hides empty session names by default", () => {
    expect(createWidget("session-name").options).toMatchObject({
      hideWhenEmpty: true,
      text: "-",
    });
  });

  it("defaults and normalizes cwd display style", () => {
    expect(createWidget("cwd").options.cwdDisplayStyle).toBe("default");
    expect(createWidget("cwd", { cwdDisplayStyle: "full-home" }).options.cwdDisplayStyle).toBe(
      "full-home",
    );
    expect(
      normalizeConfig({
        lines: [[{ type: "cwd", options: { cwdDisplayStyle: "fish" } }]],
      }).lines[0]?.[0]?.options.cwdDisplayStyle,
    ).toBe("fish");
  });

  it("defaults and normalizes git branch display style", () => {
    expect(createWidget("git-branch").options.gitBranchDisplayStyle).toBe("default");
    expect(
      createWidget("git-branch", {
        gitBranchDisplayStyle: "custom",
        surroundLeft: "[",
        surroundRight: "]",
      }).options,
    ).toMatchObject({
      gitBranchDisplayStyle: "custom",
      surroundLeft: "[",
      surroundRight: "]",
    });
    expect(
      normalizeConfig({
        lines: [[{ type: "git-branch", options: { gitBranchDisplayStyle: "round-brackets" } }]],
      }).lines[0]?.[0]?.options.gitBranchDisplayStyle,
    ).toBe("round-brackets");
  });

  it("defaults and normalizes context conditional color options", () => {
    expect(createWidget("context").options).toMatchObject({
      contextConditionalColors: false,
      contextWarningPercent: 70,
      contextDangerPercent: 90,
      warningFg: "yellow",
      warningBg: "default",
      dangerFg: "red",
      dangerBg: "default",
    });
    expect(
      createWidget("context", {
        contextConditionalColors: true,
        contextWarningPercent: 60,
        contextDangerPercent: 80,
        warningFg: "ansi256:220",
        dangerBg: "red",
      }).options,
    ).toMatchObject({
      contextConditionalColors: true,
      contextWarningPercent: 60,
      contextDangerPercent: 80,
      warningFg: "ansi256:220",
      dangerBg: "red",
    });
  });

  it("defaults and normalizes extension status trim options", () => {
    expect(createWidget("external-status", { trimValue: 2 }).options.trimValue).toBe(2);
    expect(createWidget("external-status", { trimValue: 20 }).options.trimValue).toBe(10);
    expect(createWidget("external-status", { preserveTrimStyles: false }).options).toMatchObject({
      preserveTrimStyles: false,
    });
    const config = normalizeConfig({
      lines: [[{ type: "external-status", options: { trimValue: 3, preserveTrimStyles: false } }]],
    });
    expect(config.lines[0]?.[0]?.options.trimValue).toBe(3);
    expect(config.lines[0]?.[0]?.options.preserveTrimStyles).toBe(false);
  });

  it("defaults and normalizes token and cost format styles", () => {
    expect(createWidget("tokens").options.tokenFormatStyle).toBe("default");
    expect(createWidget("context-bar").options.tokenFormatStyle).toBe("default");
    expect(createWidget("cost").options.costFormatStyle).toBe("default");
    expect(createWidget("cost").options.showSubscription).toBe(false);
    expect(createWidget("input-speed").options.tokenFormatStyle).toBe("default");
    expect(createWidget("output-speed").options.tokenFormatStyle).toBe("default");
    expect(createWidget("total-speed").options.tokenFormatStyle).toBe("default");
    expect(createWidget("tokens", { tokenFormatStyle: "compact" }).options.tokenFormatStyle).toBe(
      "compact",
    );
    expect(createWidget("cost", { costFormatStyle: "compact" }).options.costFormatStyle).toBe(
      "compact",
    );
    expect(createWidget("cost", { showSubscription: true }).options.showSubscription).toBe(true);
    expect(
      normalizeConfig({
        lines: [[{ type: "tokens", options: { tokenFormatStyle: "compact" } }]],
      }).lines[0]?.[0]?.options.tokenFormatStyle,
    ).toBe("compact");
    expect(
      normalizeConfig({
        lines: [[{ type: "cost", options: { costFormatStyle: "compact" } }]],
      }).lines[0]?.[0]?.options.costFormatStyle,
    ).toBe("compact");
  });

  it("loads defaults when config does not exist", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "pi-footer-"));
    const config = await loadConfig(join(tempDir, "missing.json"));
    expect(config.lines[0]?.map((widget) => widget.type)).toEqual(
      DEFAULT_CONFIG.lines[0]?.map((widget) => widget.type),
    );
  });

  it("preserves empty lines", () => {
    const config = normalizeConfig({ lines: [["model"], []] });
    expect(config.lines).toHaveLength(2);
    expect(config.lines[1]).toEqual([]);
  });

  it("saves normalized config", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "pi-footer-"));
    const path = join(tempDir, "settings.json");
    await saveConfig({ ...DEFAULT_CONFIG, lines: [[createWidget("model")]] }, path);
    const saved = JSON.parse(await readFile(path, "utf8")) as {
      lines: Array<Array<{ type: string }>>;
    };
    expect(saved.lines[0]?.map((widget) => widget.type)).toEqual(["model"]);
  });
});
