export const site = {
  name: "HFQ Network",
  ip: "hfq.mcc.lk", // change to your real IP
  tagline: "Lifesteal SMP",
  description:
    "A Lifesteal SMP where every fight can change your story. Take hearts, protect your own, and find your place on HFQ.",
};

export const routes = {
  home: "/",
  store: "/store",
  vote: "/vote",
  jobs: "/jobs",
  aurex: "/aurex",
} as const;

export const links = {
  discord: "https://discord.gg/5uEdufXZa",
  aurex: "https://aurex.lk",
  store: routes.store,
  apply: "https://discord.gg/5uEdufXZa",
};

export const navLinks = [
  { label: "Home", to: routes.home },
  { label: "Store", to: routes.store, soon: true },
  { label: "Vote", to: routes.vote, soon: true },
  { label: "Jobs", to: routes.jobs },
  { label: "Aurex Partner", to: routes.aurex },
];

export const features = [
  "Lifesteal",
  "PvP Arenas",
  "Custom Enchants",
  "Weekly Events",
  "Ranks & Kits",
  "Anti-Cheat",
];

export const partner = {
  name: "Aurex",
  label: "Official Hosting Partner",
  logo: "/images/aurex.png",
  url: links.aurex,
};