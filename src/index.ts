import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

import { cloneConfig, configWithPreset, DEFAULT_CONFIG, loadConfig, saveConfig } from "./config.js";
import { STATUS_KEY } from "./constants.js";
import { EventWidgetValues, UPDATE_EVENT_WIDGET_EVENT } from "./event-widgets.js";
import {
  EMPTY_EXTENSION_STATUSES,
  visibleExtensionStatusRowEntries,
} from "./extension-statuses.js";
import { getGitInfo } from "./git.js";
import { collectSessionMetrics } from "./metrics.js";
import { renderStatuslines } from "./render.js";
import type { StatuslineConfig, StatuslineData, StatuslinePreset } from "./types.js";
import { openStatuslineConfigUi } from "./ui.js";

interface FooterDataLike {
  getGitBranch(): string | null;
}

export default async function statuslineExtension(pi: ExtensionAPI): Promise<void> {
  let config = await loadConfig();
  const eventWidgets = new EventWidgetValues();
  let renderCurrentFooter: (() => void) | undefined;
  let getExtensionStatuses = (): ReadonlyMap<string, string> => EMPTY_EXTENSION_STATUSES;

  function apply(ctx: ExtensionContext | ExtensionCommandContext): void {
    if (!ctx.hasUI || !config.enabled) {
      ctx.ui.setFooter(undefined);
      ctx.ui.setStatus(STATUS_KEY, undefined);
      return;
    }

    ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg("accent", "statusline"));
    ctx.ui.setFooter((tui, theme, footerData) => {
      getExtensionStatuses = () => footerData.getExtensionStatuses();
      renderCurrentFooter = () => tui.requestRender();
      const unsubscribeBranch = footerData.onBranchChange(() => tui.requestRender());
      return {
        dispose(): void {
          unsubscribeBranch();
          if (renderCurrentFooter) renderCurrentFooter = undefined;
          getExtensionStatuses = () => EMPTY_EXTENSION_STATUSES;
        },
        invalidate(): void {},
        render(width: number): string[] {
          const data = collectStatuslineData(ctx, pi, footerData, eventWidgets.values);
          const lines = renderStatuslines(config, data, width, { getExtensionStatuses, theme });
          if (lines.length === 0) return [];

          const statuses = visibleExtensionStatusRowEntries(
            footerData.getExtensionStatuses(),
            config.extensionStatusRow.hiddenKeys,
            STATUS_KEY,
          ).map((entry) => entry.value);
          const renderedLines = lines.map((line) => truncateToWidth(line, width, "…"));
          if (statuses.length === 0) return renderedLines;
          return [
            ...renderedLines,
            truncateToWidth(theme.fg("dim", statuses.join(" ")), width, "…"),
          ];
        },
      };
    });
  }

  async function setConfig(
    next: StatuslineConfig,
    ctx: ExtensionContext | ExtensionCommandContext,
  ): Promise<void> {
    config = next;
    await saveConfig(config);
    apply(ctx);
  }

  pi.events.on(UPDATE_EVENT_WIDGET_EVENT, (payload: unknown) => {
    const changed = eventWidgets.update(payload);
    if (changed) renderCurrentFooter?.();
  });

  pi.registerCommand("statusline", {
    description: "Configure the pi statusline/footer",
    handler: async (args, ctx) => {
      const handled = await handleArgs(args, ctx, config, async (next) => setConfig(next, ctx));
      if (handled) return;

      const previewData = collectStatuslineData(
        ctx,
        pi,
        {
          getGitBranch: () => "main",
        },
        eventWidgets.values,
      );
      const result = await openStatuslineConfigUi(
        ctx,
        config,
        previewData,
        (updated) => {
          config = updated;
          apply(ctx);
        },
        async (updated) => setConfig(updated, ctx),
        getExtensionStatuses,
      );
      config = result.config;
      apply(ctx);
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    config = await loadConfig();
    apply(ctx);
  });

  pi.on("model_select", async (_event, ctx) => {
    apply(ctx);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    ctx.ui.setFooter(undefined);
    ctx.ui.setStatus(STATUS_KEY, undefined);
  });
}

function collectStatuslineData(
  ctx: ExtensionContext | ExtensionCommandContext,
  pi: ExtensionAPI,
  footerData: Pick<FooterDataLike, "getGitBranch">,
  eventWidgets: ReadonlyMap<string, string>,
): StatuslineData {
  const contextUsage = ctx.getContextUsage();
  return {
    model: ctx.model?.id,
    provider: ctx.model?.provider,
    sessionName: pi.getSessionName(),
    sessionId: ctx.sessionManager.getSessionId(),
    thinkingLevel: ctx.model?.reasoning ? pi.getThinkingLevel() : undefined,
    textVerbosity: getTextVerbosity(ctx.model),
    git: getGitInfo(ctx.cwd, footerData.getGitBranch()),
    cwd: ctx.cwd,
    activeToolCount: pi.getActiveTools().length,
    usingSubscription: ctx.model ? ctx.modelRegistry.isUsingOAuth(ctx.model) : false,
    contextTokens: contextUsage?.tokens ?? undefined,
    contextMaxTokens: contextUsage?.contextWindow,
    metrics: collectSessionMetrics(ctx.sessionManager.getBranch()),
    eventWidgets,
  };
}

async function handleArgs(
  args: string,
  ctx: ExtensionCommandContext,
  currentConfig: StatuslineConfig,
  setConfig: (config: StatuslineConfig) => Promise<void>,
): Promise<boolean> {
  const [command, value] = args.trim().split(/\s+/, 2);
  if (!command) return false;

  if (command === "on" || command === "enable") {
    await setConfig({ ...currentConfig, enabled: true });
    ctx.ui.notify("Statusline enabled", "info");
    return true;
  }
  if (command === "off" || command === "disable") {
    await setConfig({ ...currentConfig, enabled: false });
    ctx.ui.notify("Statusline disabled", "info");
    return true;
  }
  if (command === "reset") {
    await setConfig(cloneConfig(DEFAULT_CONFIG));
    ctx.ui.notify("Statusline reset to defaults", "info");
    return true;
  }
  if (command === "preset" && isPreset(value)) {
    await setConfig(configWithPreset(currentConfig, value));
    ctx.ui.notify(`Statusline preset: ${value}`, "info");
    return true;
  }

  ctx.ui.notify(
    "Usage: /statusline [on|off|reset|preset compact|default|powerline|powerline-bright|powerline-blocks|powerline-mono|git-heavy|pi-footer|demo|demo-standard]",
    "warning",
  );
  return true;
}

function getTextVerbosity(model: ExtensionContext["model"]): string | undefined {
  if (!model) return undefined;
  // pi currently exposes text verbosity only through the OpenAI Codex Responses provider,
  // where the provider default is "low" unless the request overrides it internally.
  return model.api === "openai-codex-responses" ? "low" : undefined;
}

function isPreset(value: string | undefined): value is StatuslinePreset {
  return (
    value === "compact" ||
    value === "default" ||
    value === "powerline" ||
    value === "powerline-bright" ||
    value === "powerline-blocks" ||
    value === "powerline-mono" ||
    value === "git-heavy" ||
    value === "pi-footer" ||
    value === "demo" ||
    value === "demo-standard"
  );
}
