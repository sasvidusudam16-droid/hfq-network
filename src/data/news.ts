export type NewsTag = "Update" | "Event" | "Season" | "Store";

export type NewsPost = {
  id: number;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  tag: NewsTag;
  image: string;
  url?: string;
};

export const news: NewsPost[] = [
  {
    id: 1,
    title: "Season 1 Is Releasing Soon",
    excerpt:
      "A brand new lifesteal world is almost ready. Fresh map, fresh hearts, and a fair start for everyone. Join our Discord so you don't miss the launch.",
    date: "2026-10-04",
    tag: "Season",
    image: "/images/news/news-1.webp",
    url: "/",
  },
  {
    id: 2,
    title: "Store Opening Soon",
    excerpt:
      "Ranks, kits and cosmetics are coming. Get ready for exclusive perks and launch-day deals when the store goes live.",
    date: "2026-10-03",
    tag: "Store",
    image: "/images/news/news-4.webp",
    url: "/store",
  },
  {
    id: 3,
    title: "Staff Applications Are Open",
    excerpt:
      "We're hiring admins, staff, media, graphic designers and thumbnail makers. Apply now and help build HFQ.",
    date: "2026-10-02",
    tag: "Update",
    image: "/images/news/news-3.webp",
    url: "/jobs",
  },
  {
    id: 4,
    title: "Launch Event Announced",
    excerpt:
      "Be online for the Season 1 launch for a special opening event and early rewards. Details coming on Discord.",
    date: "2026-10-01",
    tag: "Event",
    image: "/images/news/news-2.webp",
    url: "/",
  },
];