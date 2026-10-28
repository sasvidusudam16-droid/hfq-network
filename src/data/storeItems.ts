export type StoreItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
  color: string;
  dark: string;
  image: string;
  url: string;
  tag?: string;
  perks: string[];
};

const BUY_LINK = "https://discord.gg/yourinvite";
const IMG = "/images/store/";

export const storeShards: StoreItem[] = [
  {
    id: "shards-100",
    name: "100 Shards",
    price: "$1.99",
    color: "#5b8cff",
    dark: "#1f3a99",
    image: IMG + "Screenshot_2026-10-17_212137.png",
    url: BUY_LINK,
    perks: ["100 Shards", "Delivered instantly", "Spend them in the shard shop"],
  },
  {
    id: "shards-250",
    name: "250 Shards",
    price: "$4.99",
    color: "#7c6bff",
    dark: "#352a99",
    image: IMG + "Screenshot_2026-10-17_212154.png",
    url: BUY_LINK,
    perks: ["250 Shards", "Delivered instantly", "Spend them in the shard shop"],
  },
  {
    id: "shards-500",
    name: "500 Shards",
    price: "$9.99",
    color: "#a05cff",
    dark: "#4a2699",
    image: IMG + "Screenshot_2026-10-17_212221.png",
    url: BUY_LINK,
    tag: "Best Value",
    perks: ["500 Shards", "+10% bonus shards", "Delivered instantly"],
  },
  {
    id: "shards-1000",
    name: "1,000 Shards",
    price: "$19.99",
    color: "#3fb8ff",
    dark: "#175a80",
    image: IMG + "Screenshot_2026-10-17_212237.png",
    url: BUY_LINK,
    perks: ["1,000 Shards", "+15% bonus shards", "Delivered instantly"],
  },
  {
    id: "shards-2500",
    name: "2,500 Shards",
    price: "$44.99",
    color: "#c15cff",
    dark: "#5a2680",
    image: IMG + "Screenshot_2026-10-17_212251.png",
    url: BUY_LINK,
    perks: ["2,500 Shards", "+20% bonus shards", "Delivered instantly"],
  },
  {
    id: "shards-5000",
    name: "5,000 Shards",
    price: "$89.99",
    color: "#ff5cf0",
    dark: "#80267a",
    image: IMG + "Screenshot_2026-10-17_212304.png",
    url: BUY_LINK,
    perks: ["5,000 Shards", "+25% bonus shards", "Delivered instantly"],
  },
];

export const storeKeys: StoreItem[] = [
  {
    id: "key-blue",
    name: "Frost Key",
    price: "$2.99",
    color: "#3aa8ff",
    dark: "#1b4f8a",
    image: IMG + "Screenshot_2026-10-17_212524.png",
    url: BUY_LINK,
    perks: ["1x Frost crate key", "Opens the Frost crate", "Buy 5, get 1 free"],
  },
  {
    id: "key-purple",
    name: "Void Key",
    price: "$4.99",
    color: "#a855ff",
    dark: "#4b2085",
    image: IMG + "Screenshot_2026-10-17_212544.png",
    url: BUY_LINK,
    perks: ["1x Void crate key", "Opens the Void crate", "Buy 5, get 1 free"],
  },
  {
    id: "key-red",
    name: "Blood Key",
    price: "$7.99",
    color: "#ff2d46",
    dark: "#6b0a16",
    image: IMG + "Screenshot_2026-10-17_212605.png",
    url: BUY_LINK,
    tag: "Most Popular",
    perks: ["1x Blood crate key", "Opens the Blood crate", "Buy 5, get 1 free"],
  },
  {
    id: "key-pink",
    name: "Rose Key",
    price: "$9.99",
    color: "#ff4fd8",
    dark: "#7a1a6a",
    image: IMG + "Screenshot_2026-10-17_212623.png",
    url: BUY_LINK,
    perks: ["1x Rose crate key", "Opens the Rose crate", "Buy 5, get 1 free"],
  },
  {
    id: "key-green",
    name: "Emerald Key",
    price: "$14.99",
    color: "#2ee6a0",
    dark: "#0f6b4a",
    image: IMG + "Screenshot_2026-10-17_212639.png",
    url: BUY_LINK,
    perks: ["1x Emerald crate key", "Opens the Emerald crate", "Buy 5, get 1 free"],
  },
];
