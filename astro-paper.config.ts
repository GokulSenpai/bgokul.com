import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://bgokul.com/",
    title: "Gokul",
    description:
      "I make games, write stories, and spend an unreasonable amount of time convincing myself I should learn yet another creative skill.",
    author: "Gokul",
    profile: "https://bgokul.com",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "UTC",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    // Dark only: every portfolio world is designed for a dark room.
    lightAndDarkMode: false,
    dynamicOgImage: true,
    // The Journal's archives (entries by year and month).
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "linkedin", url: "https://www.linkedin.com/in/gokulnagasai/" },
    { name: "mail",     url: "mailto:hi@bgokul.com" },
    { name: "github",   url: "https://github.com/GokulSenpai" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});