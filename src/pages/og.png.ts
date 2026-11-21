import type { APIRoute } from "astro";
import { ogCard } from "@/utils/ogCard";

// The site's fallback share image (the main one is public/default-og.jpg,
// the lighthouse scene). Same card as the Journal entries.
export const GET: APIRoute = async ({ url }) =>
  ogCard(url, { kicker: "Games, stories and code", title: "Gokul Naga Sai" });
