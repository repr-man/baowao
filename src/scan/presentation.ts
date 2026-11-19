import type { Scan } from "./cache";

export const colors = [
  "#df704c",
  "#e8a64c",
  "#8aa66e",
  "#5a9b92",
  "#6286a4",
  "#9c82a3",
  "#c88385",
  "#b5a06b",
];

export function sortedEntries(scan: Scan) {
  return [...scan.entries].sort(
    (a, b) => (b.bytes ?? -1) - (a.bytes ?? -1) || a.name.localeCompare(b.name),
  );
}

export function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB", "TiB", "PiB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${units[unit]}`;
}
