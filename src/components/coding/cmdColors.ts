/**
 * cmd's 16 console colours (Windows Terminal "Campbell" scheme). A coding
 * entry picks one by name in its frontmatter (`color: yellow`), the same
 * names `color /?` lists. Black and the greys are left out: they'd vanish on
 * the black background or look like plain text.
 */
export const CMD_COLORS = {
  red: "#e74856", // cmd "Light Red". Dark red is too dim on black.
  green: "#13a10e",
  yellow: "#c19c00", // cmd's dark yellow: the closest thing to orange
  blue: "#3b78ff", // "Light Blue"; dark blue is unreadable on black
  purple: "#b4009e",
  aqua: "#3a96dd",
  "light-green": "#16c60c",
  "light-aqua": "#61d6d6",
  "light-yellow": "#f9f1a5",
  "light-purple": "#d670d6",
  // cmd's own Gray (#767676) is darker than the dim prompt text, so a name
  // in it reads as disabled. Lifted a step so it's still clearly a name.
  gray: "#a6a6a6",
  // Legacy cmd's dark yellow was #808000, i.e. olive. Same lift as gray.
  olive: "#a0a020",
  // Not a cmd colour: sampled from Sling's back wall (#927176), lifted to read on black.
  rose: "#b8939a",
} as const;

export type CmdColor = keyof typeof CMD_COLORS;
export const CMD_COLOR_NAMES = Object.keys(CMD_COLORS) as [CmdColor, ...CmdColor[]];

export const cmdColor = (name?: CmdColor) => (name ? CMD_COLORS[name] : undefined);
