export const CONFIRM_EXIT_ITEMS = [
  "Save & Exit",
  "Exit without saving",
  "Return to config UI",
] as const;

export const CONFIRM_EXIT_HINT = "↑/↓ select • enter confirm • s save • x discard • esc/r back";

export type ConfirmExitAction = "save" | "discard" | "return";

export function confirmExitAction(selected: number): ConfirmExitAction {
  if (selected === 0) return "save";
  if (selected === 1) return "discard";
  return "return";
}

export function confirmExitShortcut(data: string): ConfirmExitAction | undefined {
  if (data === "s") return "save";
  if (data === "x") return "discard";
  if (data === "r") return "return";
  return undefined;
}
