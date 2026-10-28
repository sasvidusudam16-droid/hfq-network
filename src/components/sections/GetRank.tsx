import type { CSSProperties } from "react";
import { Link } from "react-router-dom"; // swap for your own link component if you use another router
import { ArrowRight } from "lucide-react";
import PixelBackground from "../ui/PixelBackground";
import Reveal from "../ui/Reveal";
import { storeRanks } from "../../data/storeRanks";

export default function GetRank() {
  return (
    <section className="rank">
      <PixelBackground className="rank-pixels" seed={17} />

      <div className="rank-container">
        <Reveal>
          <div className="gr-card">
            {/* Left: text */}
            <div className="gr-body">
              <p className="section-label">Ranks and perks</p>
              <h2 className="rank-title">Get a rank</h2>
              <p className="rank-sub">Make your mark on the server.</p>
              <p className="rank-desc">
                Explore ranks, kits and cosmetics in the HFQ store. Find the perks that suit the way you play, and help support the server along the way.
              </p>

              <ul className="gr-ranks">
                {storeRanks.map((r) => (
                  <li
                    key={r.id}
                    className="gr-chip"
                    style={{ "--rc": r.color, "--rc-dark": r.dark } as CSSProperties}
                  >
                    <i aria-hidden="true" />
                    {r.name}
                    <small>{r.price}</small>
                  </li>
                ))}
              </ul>

              <Link to="/store" className="mc-btn gr-btn">
                Explore the store <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right: knight on a block podium */}
            <div className="gr-stage" aria-hidden="true">
              <div className="gr-podium" />
              <img className="gr-knight" src="/images/ranks/elite.png" alt="" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}