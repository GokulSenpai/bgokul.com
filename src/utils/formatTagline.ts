/**
 * Taglines are plain frontmatter strings (not Markdown), but support two
 * lightweight bits of formatting:
 *  - **bold** for a phrase that should stand out slightly.
 *  - A literal newline (e.g. via a YAML "\n" escape in a quoted string)
 *    for a line break.
 * Two views of the same source string:
 *  - `taglineHtml` — for rendering (`**word**` -> `<strong>`, "\n" -> `<br />`).
 *  - `taglinePlain` — for anywhere HTML shouldn't appear (meta description,
 *    alt text) — strips the `**` markers and collapses newlines to spaces.
 */
export function taglineHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export function taglinePlain(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\n/g, " ");
}
