export type StoreRank = {
  id: string;
  name: string;
  price: string;
  description?: string;
  color: string;   // badge colour
  dark: string;    // badge border / outline
  image: string;
  url: string;     // where "Buy" goes
  popular?: boolean;
  perks: string[];
};

const BUY_LINK = "https://discord.gg/yourinvite"; // ← Tebex link later, Discord ticket for now

export type StoreUpgrade = {
  id: string;
  from: string;   // id of the rank they already have
  to: string;     // id of the rank they are buying
  price: string;
  description?: string;
  url: string;
  perks: string[];
};

export const storeRanks: StoreRank[] = [
  {
    id: "elite",
    name: "ELITE",
    price: "$1.99",
    color: "#6fb5c4",
    dark: "#2c5561",
    image: "/images/ranks/elite.png",
    url: BUY_LINK,
    perks: ["[ELITE] prefix", "8 home slots", "Custom nickname colour", "Elite-only kit"],
  },
  {
    id: "heroic",
    name: "HEROIC",
    price: "$3.99",
    color: "#a66bff",
    dark: "#4b2a8a",
    image: "/images/ranks/heroic.png",
    url: BUY_LINK,
    popular: true,
    perks: ["Everything in ELITE", "[HEROIC] prefix", "10 home slots", "Heroic particle aura", "Reserved slot when full"],
  },
  {
    id: "legend",
    name: "LEGEND",
    price: "$5.99",
    color: "#ff7a1a",
    dark: "#7a3000",
    image: "/images/ranks/legend.png",
    url: BUY_LINK,
    perks: ["Everything in HEROIC", "[LEGEND] prefix", "15 home slots", "Legend-only cosmetics", "Free monthly crate key"],
  },
];

export const storeUpgrades: StoreUpgrade[] = [
  {
    id: "elite-heroic",
    from: "elite",
    to: "heroic",
    price: "$2.00",
    url: BUY_LINK,
    perks: ["Upgrade from ELITE to HEROIC", "Heroic prefix and aura", "10 home slots", "Keeps all your ELITE perks"],
  },
  {
    id: "heroic-legend",
    from: "heroic",
    to: "legend",
    price: "$4.00",
    url: BUY_LINK,
    perks: ["Upgrade from HEROIC to LEGEND", "Legend prefix and cosmetics", "15 home slots", "Free monthly crate key"],
  },
];