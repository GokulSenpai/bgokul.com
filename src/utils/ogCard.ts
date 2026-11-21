/**
 * The share image (1200x630, what LinkedIn, WhatsApp, X and the rest show
 * for a link), drawn in the site's own style: a navy HUD window on the
 * night-sky navy, a gold kicker, the title in the pixel font, and the
 * address at the foot. Used for Journal entries (and /og.png).
 */
import { fontData, experimental_getFontFileURL } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import config from "@/config";

const NAVY = "#07081a";
const CREAM = "#efecdc";
const GOLD = "#ffd27a";
const DUSK = "#9aa0d6";

export async function ogCard(url: URL, { kicker, title }: { kicker: string; title: string }) {
  const fonts = fontData["--font-pixel"];
  // Each weight comes as woff2 and ttf (separate entries): take the ttf.
  const ttf = (w: number) =>
    fonts.find(f => f.weight === String(w) && f.src.some(s => s.format === "truetype"))?.src.find(s => s.format === "truetype")?.url;
  const paths = [500, 700].map(ttf);
  if (paths.some(p => !p)) throw new Error("Pixelify Sans: no ttf to draw the share image with.");
  const [regular, bold] = await Promise.all(
    paths.map(p => fetch(experimental_getFontFileURL(p!, url)).then(r => r.arrayBuffer()))
  );

  const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
    type,
    props: { style, children },
  });

  const svg = await satori(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 50% 40%, #1b1f4d 0%, ${NAVY} 70%)`,
        fontFamily: "Pixelify Sans",
      },
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 1040,
          height: 470,
          padding: "52px 60px",
          border: `6px solid ${GOLD}`,
          borderRadius: 10,
          background: "linear-gradient(180deg, #202668 0%, #0e1138 100%)",
          boxShadow: "14px 14px 0 rgba(3, 4, 14, 0.85)",
        },
        [
          el("div", { display: "flex", flexDirection: "column" }, [
            el("div", { color: GOLD, fontSize: 28, fontWeight: 500, letterSpacing: 6 }, kicker.toUpperCase()),
            el(
              "div",
              {
                marginTop: 22,
                color: CREAM,
                fontSize: title.length > 40 ? 64 : 80,
                fontWeight: 700,
                lineHeight: 1.1,
                maxHeight: 270,
                overflow: "hidden",
                textShadow: "5px 5px 0 rgba(5, 6, 20, 0.9)",
              },
              title
            ),
          ]),
          el("div", { display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 500 }, [
            el("div", { color: GOLD }, new URL(config.site.url).hostname),
            el("div", { color: DUSK }, "Gokul Naga Sai"),
          ]),
        ]
      )
    ) as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: [
        { name: "Pixelify Sans", data: regular, weight: 500, style: "normal" },
        { name: "Pixelify Sans", data: bold, weight: 700, style: "normal" },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
