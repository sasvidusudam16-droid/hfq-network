import { useEffect, useState, type CSSProperties } from "react";
import { Crown, ChevronsUp, KeyRound, Coins, Gem, Check } from "lucide-react";
import {
  storeRanks,
  storeUpgrades,
  type StoreRank,
  type StoreUpgrade,
} from "../data/storeRanks";
import { storeShards, storeKeys, type StoreItem } from "../data/storeItems";
import PixelBackground from "../components/ui/PixelBackground";
import Reveal from "../components/ui/Reveal";
import FlyIn from "../components/ui/FlyIn";
import SplitText from "../components/ui/SplitText";

const categories = [
  { id: "ranks", label: "Ranks", icon: Crown, ready: true },
  { id: "upgrades", label: "Rank Upgrades", icon: ChevronsUp, ready: true },
  { id: "keys", label: "Crate Keys", icon: KeyRound, ready: true },
  { id: "shards", label: "Shards", icon: Gem, ready: true },
  { id: "coins", label: "Coins", icon: Coins, ready: false },
];

type StoreCatalog = { ranks: StoreRank[]; upgrades: StoreUpgrade[]; keys: StoreItem[]; shards: StoreItem[] };

function RankCard({ rank }: { rank: StoreRank }) {
  return (
    <div
      className={`srank ${rank.popular ? "is-popular" : ""}`}
      style={{ "--rc": rank.color, "--rc-dark": rank.dark } as CSSProperties}
    >
      {rank.popular && <span className="srank-popular">Most Popular</span>}

      {/* Character stage */}
      <div className="srank-stage">
        <div className="srank-glow" />
        <div className="srank-badge">
          <span>{rank.name}</span>
        </div>
        <img src={rank.image} alt={`${rank.name} rank`} className="srank-char" />
        <div className="srank-floor" />
      </div>

      {/* Info */}
      <div className="srank-body">
        <div className="srank-price">
          <span className="srank-amount">{rank.price}</span>
          <span className="srank-period">one-time</span>
        </div>

        {rank.description && <p className="srank-description">{rank.description}</p>}

        <ul className="srank-perks">
          {rank.perks.map((p) => (
            <li key={p}>
              <Check size={14} /> {p}
            </li>
          ))}
        </ul>

        <a href={rank.url} target="_blank" rel="noreferrer" className="mc-btn srank-btn">
          Buy {rank.name}
        </a>
      </div>
    </div>
  );
}

function UpgradeCard({ up, ranks }: { up: StoreUpgrade; ranks: StoreRank[] }) {
  const from = ranks.find((r) => r.id === up.from);
  const to = ranks.find((r) => r.id === up.to);
  if (!from || !to) return null;

  return (
    <div
      className="srank srank-upgrade"
      style={{ "--rc": to.color, "--rc-dark": to.dark } as CSSProperties}
    >
      <div className="srank-stage">
        <div className="srank-glow" />
        <div className="srank-badge">
          <span>
            {from.name} to {to.name}
          </span>
        </div>
        <img className="up-char up-from" src={from.image} alt={`${from.name} rank`} />
        <span className="up-arrow" aria-hidden="true" />
        <img className="up-char up-to" src={to.image} alt={`${to.name} rank`} />
      </div>

      <div className="srank-body">
        <div className="srank-price">
          <span className="srank-amount">{up.price}</span>
          <span className="srank-period">one-time upgrade</span>
        </div>

        {up.description && <p className="srank-description">{up.description}</p>}

        <ul className="srank-perks">
          {up.perks.map((p) => (
            <li key={p}>
              <Check size={14} /> {p}
            </li>
          ))}
        </ul>

        <a href={up.url} target="_blank" rel="noreferrer" className="mc-btn srank-btn">
          Upgrade to {to.name}
        </a>
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: StoreItem }) {
  return (
    <div
      className={`srank srank-item ${item.tag ? "is-popular" : ""}`}
      style={{ "--rc": item.color, "--rc-dark": item.dark } as CSSProperties}
    >
      {item.tag && <span className="srank-popular">{item.tag}</span>}

      <div className="srank-stage">
        <div className="srank-glow" />
        <div className="srank-badge">
          <span>{item.name}</span>
        </div>
        <img src={item.image} alt={item.name} className="item-img" />
      </div>

      <div className="srank-body">
        <div className="srank-price">
          <span className="srank-amount">{item.price}</span>
          <span className="srank-period">one-time</span>
        </div>
        {item.description && <p className="srank-description">{item.description}</p>}
        <ul className="srank-perks">
          {item.perks.map((perk) => (
            <li key={perk}>
              <Check size={14} /> {perk}
            </li>
          ))}
        </ul>
        <a href={item.url} target="_blank" rel="noreferrer" className="mc-btn srank-btn">
          Buy {item.name}
        </a>
      </div>
    </div>
  );
}

export default function Store() {
  const [active, setActive] = useState("ranks");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [catalog, setCatalog] = useState<StoreCatalog>({ ranks: storeRanks, upgrades: storeUpgrades, keys: storeKeys, shards: storeShards });

  useEffect(() => {
    let active = true;
    fetch("/api/store/products")
      .then((response) => response.ok ? response.json() : null)
      .then((data: StoreCatalog | null) => { if (active && data) setCatalog(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const go = (id: string) => {
    const from = categories.findIndex((category) => category.id === active);
    const to = categories.findIndex((category) => category.id === id);
    setDir(to > from ? "fwd" : "back");
    setActive(id);
  };

  return (
    <section className="store">
      <PixelBackground className="store-pixels" seed={31} />

      <div className="store-container">
        {/* Header */}
        <div className="store-head">
          <Reveal>
            <p className="jobs-kicker">
              <span className="pixel-line" /> HFQ Store <span className="pixel-line" />
            </p>
          </Reveal>
          <SplitText as="h1" className="store-title" text="Pick Your Rank" delay={0.15} />
          <Reveal delay={0.4}>
            <p className="store-sub">
              Stand out on HFQ with exclusive prefixes, cosmetics and perks. Every purchase helps keep the server running.
            </p>
          </Reveal>
        </div>

        {/* Category tabs */}
        <Reveal delay={0.5}>
          <div className="store-tabs">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  className={`store-tab ${active === c.id ? "is-active" : ""}`}
                  disabled={!c.ready}
                  onClick={() => c.ready && go(c.id)}
                >
                  <Icon size={16} />
                  {c.label}
                  {!c.ready && <span className="store-tab-soon">Soon</span>}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div key={active} className={`store-panel store-panel-${dir}`}>
          {active === "ranks" && (
            <div className="store-grid">
              {catalog.ranks.map((rank, i) => (
                <FlyIn key={rank.id} from={i === 2 ? "right" : "left"} delay={0.15 + i * 0.15}>
                  <RankCard rank={rank} />
                </FlyIn>
              ))}
            </div>
          )}

          {active === "upgrades" && (
            <div className="store-grid store-grid-2">
              {catalog.upgrades.map((up, i) => (
                <FlyIn key={up.id} from={i === 1 ? "right" : "left"} delay={0.15 + i * 0.15}>
                  <UpgradeCard up={up} ranks={catalog.ranks} />
                </FlyIn>
              ))}
            </div>
          )}

          {active === "keys" && (
            <div className="store-grid-center">
              {catalog.keys.map((item, i) => (
                <FlyIn key={item.id} from={i % 3 === 2 ? "right" : "left"} delay={0.1 + i * 0.1}>
                  <ItemCard item={item} />
                </FlyIn>
              ))}
            </div>
          )}

          {active === "shards" && (
            <div className="store-grid-center">
              {catalog.shards.map((item, i) => (
                <FlyIn key={item.id} from={i % 3 === 2 ? "right" : "left"} delay={0.1 + i * 0.1}>
                  <ItemCard item={item} />
                </FlyIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}