import { MessageCircle } from "lucide-react";
import PixelBackground from "./ui/PixelBackground";
import Reveal from "./ui/Reveal";
import FlyIn from "./ui/FlyIn";

/* Change the invite here. The button link and the sign on the balloon both use it. */
const INVITE = "discord.gg/hfq";

const [host, slug] = INVITE.split("/");
const perks = ["Server updates", "Giveaways", "Friendly support"];

export default function DiscordCard() {
  return (
    <section className="dc">
      <PixelBackground className="dc-pixels" seed={23} />

      <div className="dc-wrap">
        <Reveal>
          <div className="dc-card">
            {/* Left: mascot with a sign that shows the invite */}
            <FlyIn from="left">
              <div className="dc-art">
                <img src="/images/discord-balloons.png" alt="Discord mascot holding balloons" />
                <div className="dc-sign" aria-hidden="true">
                  <span>{host}/</span>
                  <strong>{slug}</strong>
                </div>
              </div>
            </FlyIn>

            {/* Right: text */}
            <div className="dc-body">
              <p className="section-label">Community</p>
              <h2 className="dc-title">Come say hello</h2>
              <p className="dc-desc">
                Meet the players behind the battles, catch server updates, and ask the community for a
                hand whenever you need one.
              </p>

              <ul className="dc-perks">
                {perks.map((p) => <li key={p}>{p}</li>)}
              </ul>

              <a className="mc-btn dc-btn" href={`https://${INVITE}`} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Join Discord
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}