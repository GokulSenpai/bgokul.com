export const STATUS_LABEL = {
  published: "Published",
  "in-game": "In a game",
  "in-progress": "Work in progress",
  concept: "Concept",
  draft: "Unfinished",
} as const;

/** 1 -> "I", 4 -> "IV", ... for chapter numbers. */
export function roman(n: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [value, glyph] of map) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}
