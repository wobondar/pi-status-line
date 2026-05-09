export const LINE_LIST_HINT =
  "↑/↓ select • pgup/pgdn jump • enter edit • a add • c clone • w/s move • d delete • esc back";

export function lineListCountLabel(total: number, start: number, end: number): string {
  return `${total} line(s), showing ${rangeLabel(start, end, total)}`;
}

export function lineListItemLabel(
  index: number,
  widgetCount: number,
  dim: (text: string) => string,
): string {
  return `☰ Line ${index + 1} ${dim(`(${widgetCount} widget${widgetCount === 1 ? "" : "s"})`)}`;
}

function rangeLabel(start: number, end: number, total: number): string {
  if (total === 0) return "0-0";
  return `${start + 1}-${end}`;
}
