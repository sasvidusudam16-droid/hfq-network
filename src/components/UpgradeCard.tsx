import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { storeRanks, type StoreUpgrade } from "../data/storeRanks";

export default function UpgradeCard({ up }: { up: StoreUpgrade }) {
  const from = storeRanks.find((r) => r.id === up.from)!;
  const to = storeRanks.find((r) => r.id === up.to)!;

  return (
    <div
      className="srank srank-upgrade"
      style={{ "--rc": to.color, "--rc-dark": to.dark } as CSSProperties}
    >
      <div className="srank-stage">
        <div className="srank-glow" />
        <div className="srank-badge">
          <span>{from.name} to {to.name}</span>
        </div>
        <img className="up-char up-from" src={from.image} alt={from.name} />
        <span className="up-arrow" aria-hidden="true" />
        <img className="up-char up-to" src={to.image} alt={to.name} />
      </div>

      <div className="srank-body">
        <div className="srank-price">
          <span className="srank-amount">{up.price}</span>
          <span className="srank-period">one-time upgrade</span>
        </div>
        <ul className="srank-perks">
          {up.perks.map((p) => (
            <li key={p}><Check size={16} />{p}</li>
          ))}
        </ul>
        <a className="mc-btn srank-btn" href={up.url} target="_blank" rel="noreferrer">
          Upgrade to {to.name}
        </a>
      </div>
    </div>
  );
}