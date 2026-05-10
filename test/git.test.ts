import { execFileSync } from "node:child_process";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EMPTY_GIT_INFO, getGitInfo } from "../src/git.js";

type ExecFileSyncMock = (command: string, args?: readonly string[], options?: unknown) => string;

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn<ExecFileSyncMock>(),
}));

const execFileSyncMock = vi.mocked(execFileSync);

function mockGit(rootPath: string, branch = "main"): void {
  execFileSyncMock.mockImplementation((_command, args) => {
    const gitArgs = Array.isArray(args) ? args.join(" ") : "";
    switch (gitArgs) {
      case "rev-parse --show-toplevel":
        return rootPath;
      case "rev-parse --abbrev-ref HEAD":
        return branch;
      case "rev-parse --short HEAD":
        return "abc123";
      case "status --porcelain=v1":
        return "M  staged.txt\n M unstaged.txt\n?? new.txt\n";
      case "diff --shortstat":
        return "1 file changed, 2 insertions(+), 1 deletion(-)";
      case "rev-list --left-right --count @{upstream}...HEAD":
        return "3\t4";
      case "remote get-url origin":
        return "git@example.com:repo.git";
      default:
        throw new Error(`unexpected git args: ${gitArgs}`);
    }
  });
}

describe("getGitInfo", () => {
  beforeEach(() => {
    execFileSyncMock.mockReset();
    vi.spyOn(Date, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    execFileSyncMock.mockReset();
  });

  it("reuses fresh git info for the same cwd", () => {
    mockGit("/repo-cache");

    const first = getGitInfo("/repo-cache", "main");
    const second = getGitInfo("/repo-cache", "main");

    expect(second).toBe(first);
    expect(first).toMatchObject({
      branch: "main",
      sha: "abc123",
      root: "repo-cache",
      staged: 1,
      unstaged: 1,
      untracked: 1,
      insertions: 2,
      deletions: 1,
      ahead: 4,
      behind: 3,
      remote: "git@example.com:repo.git",
      isRepo: true,
    });
    expect(execFileSyncMock).toHaveBeenCalledTimes(6);
  });

  it("caches non-repo lookups", () => {
    execFileSyncMock.mockImplementation(() => {
      throw new Error("not a repo");
    });

    const first = getGitInfo("/not-a-repo", null);
    const second = getGitInfo("/not-a-repo", null);

    expect(first).toBe(EMPTY_GIT_INFO);
    expect(second).toBe(EMPTY_GIT_INFO);
    expect(execFileSyncMock).toHaveBeenCalledTimes(1);
  });

  it("invalidates a fresh repo cache when pi reports a new branch", () => {
    mockGit("/repo-branch");

    const first = getGitInfo("/repo-branch", "main");
    const second = getGitInfo("/repo-branch", "feature/cache");

    expect(first.branch).toBe("main");
    expect(second.branch).toBe("feature/cache");
    expect(second).not.toBe(first);
    expect(execFileSyncMock).toHaveBeenCalledTimes(12);
  });

  it("shares cached repo info with child directories after root discovery", () => {
    mockGit("/repo-root");

    const root = getGitInfo("/repo-root", "main");
    const child = getGitInfo("/repo-root/packages/pkg", "main");

    expect(child).toBe(root);
    expect(execFileSyncMock).toHaveBeenCalledTimes(7);
  });
});
