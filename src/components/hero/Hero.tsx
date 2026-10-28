import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import HeroBackground from "./HeroBackground";
import ServerIPCopy from "./ServerIPCopy";
import { links, partner, site } from "../../data/site";

const step = (i: number) => ({ "--i": i } as CSSProperties);

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section className="hero" ref={sectionRef}>
      <HeroBackground />

      <motion.div
        className="hero-content"
        style={{ y: reducedMotion ? 0 : y, opacity: reducedMotion ? 1 : opacity }}
      >
        <div className="hero-logo-wrap reveal-pop" style={step(1)}>
          <img src="/images/logo.png" alt="HFQ Network logo" className="hero-logo" />
        </div>

        <h1 className="hero-title">
          <span className="title-line from-left" style={step(2)}>
            <span className="glitch" data-text="HFQ">HFQ</span>
          </span>
          <span className="title-line from-right" style={step(3)}>
            <span className="glitch" data-text="Network">Network</span>
          </span>
        </h1>

        <p className="hero-sub reveal" style={step(5)}>
          {site.description}
        </p>

        <div className="hero-actions reveal" style={step(6)}>
          <ServerIPCopy />
          <a href={links.discord} target="_blank" rel="noreferrer" className="btn-outline">
            Join Discord
            <span className="btn-circle">
              <ArrowUpRight size={18} />
            </span>
          </a>
        </div>

        <div className="hero-strip reveal" style={step(8)}>
          <p className="hero-strip-label">
            <span className="hero-strip-line" />
            Powered By
            <span className="hero-strip-line" />
          </p>
          <a href={partner.url} target="_blank" rel="noreferrer" className="powered-by">
            <img src={partner.logo} alt={partner.name} className="powered-by-logo" />
            <span>{partner.name} · {partner.label}</span>
          </a>
        </div>
      </motion.div>

      <a href="#next" className="hero-scroll reveal-fade" style={step(10)} aria-label="Scroll down">
        <ChevronDown size={26} />
      </a>
    </section>
  );
}