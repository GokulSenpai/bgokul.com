/**
 * Rehype plugin: glue the last two words of every paragraph together with a
 * non-breaking space, so a paragraph never ends on a single orphaned word.
 * Works in every browser (CSS `text-wrap: pretty` does the same job, but
 * not everywhere yet). Skips very short paragraphs and long last words,
 * where joining would force an awkward break of its own.
 */
const NBSP = " ";
const MAX_LAST_WORD = 14;

/** Last text node inside a node, depth first from the end. */
function lastTextNode(node) {
  if (node.type === "text") return node;
  if (!node.children) return null;
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    // Code is literal; never rewrite it.
    if (child.type === "element" && (child.tagName === "code" || child.tagName === "pre")) return null;
    const found = lastTextNode(child);
    if (found) return found;
  }
  return null;
}

function visit(node) {
  if (node.type === "element" && node.tagName === "p") {
    const text = lastTextNode(node);
    if (text) {
      const value = text.value.replace(/\s+$/, "");
      const at = value.lastIndexOf(" ");
      const lastWord = value.slice(at + 1);
      // Needs a space in this text node and a few words in the paragraph.
      if (at > 0 && lastWord.length <= MAX_LAST_WORD && value.split(" ").length >= 2) {
        text.value = value.slice(0, at) + NBSP + lastWord + text.value.slice(value.length);
      }
    }
    return;
  }
  if (node.children) node.children.forEach(visit);
}

export default function rehypeNoOrphans() {
  return tree => visit(tree);
}
