const COLORS = [
  "#ff0000",
  "#007aff",
  "#34c759",
  "#ff9500",
  "#af52de",
  "#ff2d55",
];

export function colorByIndex(index: number) {
  return COLORS[index % COLORS.length];
}
