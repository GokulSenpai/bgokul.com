/** Minutes to read a post's markdown body (about 220 words a minute). */
export function readingTime(body: string | undefined): number {
  const words = (body ?? "")
    .replace(/```[\s\S]*?```/g, " ") // code blocks read differently; skip them
    .replace(/<[^>]+>|import .+ from .+|[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
