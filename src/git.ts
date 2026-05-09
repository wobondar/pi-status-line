import { execFileSync } from "node:child_process";
import { basename } from "node:path";

import type { GitInfo } from "./types.js";

const CACHE_TTL_MS = 2000;

const EMPTY_GIT_INFO: GitInfo = {
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
};

const cache = new Map<string, { timestamp: number; info: GitInfo }>();

export function getGitInfo(cwd: string, branchHint: string | null): GitInfo {
  const cached = cache.get(cwd);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.info;

  const rootPath = git(cwd, ["rev-parse", "--show-toplevel"]);
  if (!rootPath) return EMPTY_GIT_INFO;

  const info: GitInfo = {
    branch: branchHint ?? git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
    sha: git(cwd, ["rev-parse", "--short", "HEAD"]),
    root: basename(rootPath),
    ...parsePorcelain(git(cwd, ["status", "--porcelain=v1"])),
    ...parseShortstat(git(cwd, ["diff", "--shortstat"])),
    ...parseAheadBehind(git(cwd, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"])),
    remote: git(cwd, ["remote", "get-url", "origin"]),
    isRepo: true,
  };

  cache.set(cwd, { timestamp: Date.now(), info });
  return info;
}

function git(cwd: string, args: string[]): string | null {
  try {
    return (
      execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 500,
      }).trim() || null
    );
  } catch {
    return null;
  }
}

function parsePorcelain(output: string | null): Pick<GitInfo, "staged" | "unstaged" | "untracked"> {
  let staged = 0;
  let unstaged = 0;
  let untracked = 0;

  for (const line of output?.split("\n") ?? []) {
    if (line.length < 2) continue;
    const x = line[0];
    const y = line[1];
    if (x === "?" && y === "?") {
      untracked += 1;
      continue;
    }
    if (x !== " " && x !== undefined) staged += 1;
    if (y !== " " && y !== undefined) unstaged += 1;
  }

  return { staged, unstaged, untracked };
}

function parseShortstat(output: string | null): Pick<GitInfo, "insertions" | "deletions"> {
  const insertions = /([0-9]+) insertion/.exec(output ?? "")?.[1];
  const deletions = /([0-9]+) deletion/.exec(output ?? "")?.[1];
  return {
    insertions: insertions ? Number(insertions) : 0,
    deletions: deletions ? Number(deletions) : 0,
  };
}

function parseAheadBehind(output: string | null): Pick<GitInfo, "ahead" | "behind"> {
  const [behind, ahead] = output?.split(/\s+/).map(Number) ?? [];
  return {
    ahead: Number.isFinite(ahead) ? (ahead ?? 0) : 0,
    behind: Number.isFinite(behind) ? (behind ?? 0) : 0,
  };
}
