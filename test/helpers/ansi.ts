export function stripAnsi(text: string): string {
  // oxlint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}
