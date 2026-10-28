import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { links } from "../../data/site";
import PixelBackground from "./PixelBackground";
import DiscordIcon from "./DiscordIcon";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

type Props = {
  page: string;
  icon: LucideIcon;
  text: string;
};

const BLOCKS = 14;

export default function ComingSoon({ page, icon: Icon, text }: Props) {
  return (
    <section className="soon">
      <PixelBackground className="soon-pixels" seed={23} />

      <div className="soon-container">
        <motion.img
          src="/images/heart.png"
          alt=""
          aria-hidden
          className="soon-heart"
          initial={{ opacity: 0, scale: 0, rotate: -120 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 11, delay: 0.5 }}
        />

        <Reveal delay={0.6}>
          <p className="soon-kicker">
            <Icon size={16} /> {page}
          </p>
        </Reveal>

        <SplitText as="h1" className="soon-title" text="Coming Soon" delay={0.7} />

        <Reveal delay={0.95}>
          <p className="soon-text">{text}</p>
        </Reveal>

        {/* Pixel loading bar */}
        <Reveal delay={1.05}>
          <div className="soon-bar" aria-label="Loading">
            {Array.from({ length: BLOCKS }, (_, i) => (
              <span key={i} className="soon-block" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={1.2} direction="zoom">
          <div className="soon-actions">
            <Link to="/" className="mc-btn">
              Back Home
            </Link>
            <a href={links.discord} target="_blank" rel="noreferrer" className="mc-btn mc-btn-dark">
              <DiscordIcon size={16} />
              Get Notified
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}