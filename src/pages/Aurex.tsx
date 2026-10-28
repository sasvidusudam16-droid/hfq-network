import { Zap, ShieldCheck, Server, Headset, ArrowRight, ExternalLink, Handshake, LifeBuoy, Users } from "lucide-react";
import Reveal from "../components/ui/Reveal";
import FlyIn from "../components/ui/FlyIn";
import SplitText from "../components/ui/SplitText";

const DISCORD = "https://discord.gg/yourinvite"; // put the real invite here
const AUREX_SITE = "https://aurex.lk";
const HFQ_LOGO = "/images/logo.png"; // change to your HFQ logo path

const stats = ["99.9% uptime", "DDoS protected", "Instant setup"];

const partnerPerks = [
  { icon: ShieldCheck, title: "Trusted by HFQ", text: "The hosting we use and recommend to our community." },
  { icon: LifeBuoy, title: "Priority support", text: "Tell the Aurex team you are from HFQ and get help fast." },
  { icon: Users, title: "Joint events", text: "Giveaways and events run together on both Discords." },
];

const steps = [
  { n: "1", title: "Visit Aurex", text: "Open aurex.lk and choose what you want to host." },
  { n: "2", title: "Say you are from HFQ", text: "Mention HFQ Network when you contact the Aurex team." },
  { n: "3", title: "Get online", text: "Your server is ready within minutes." },
];

const features = [
  { icon: Zap, title: "Instant setup", text: "Your server is ready minutes after you order." },
  { icon: ShieldCheck, title: "DDoS protection", text: "Stay online when others get attacked." },
  { icon: Server, title: "Fast hardware", text: "Strong CPUs and NVMe storage for smooth play." },
  { icon: Headset, title: "24/7 support", text: "Real people on Discord when you need help." },
];

export default function Aurex() {
  return (
    <main className="axp">
      {/* Hero */}
      <section className="axp-hero">
        <div className="axp-wrap axp-hero-grid">
          <FlyIn from="left">
            <div className="axp-art">
              <div className="axp-orb" aria-hidden="true" />
              <img src="/images/aurex-man.png" alt="Aurex mascot" />
            </div>
          </FlyIn>

          <FlyIn from="right" delay={0.15}>
            <div className="axp-intro">
              <span className="axp-badge"><Handshake size={16} /> Official partner of HFQ Network</span>
              <SplitText as="h1" className="axp-title" text="Aurex Hosting" delay={0.2} />
              <p className="axp-lead">
                Aurex is the official hosting partner of the HFQ Network. Fast and reliable hosting for
                Minecraft servers and Discord bots.
              </p>
              <ul className="axp-stats">
                {stats.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <div className="axp-actions">
                <a className="axp-btn" href={AUREX_SITE} target="_blank" rel="noreferrer">
                  Visit aurex.lk <ExternalLink size={16} />
                </a>
                <a className="axp-btn axp-btn-dark" href={DISCORD} target="_blank" rel="noreferrer">Join Discord</a>
              </div>
            </div>
          </FlyIn>
        </div>
      </section>

      {/* Partnership */}
      <section className="axp-section">
        <div className="axp-wrap">
          <Reveal>
            <div className="axp-card axp-partner">
              <p className="axp-kicker">Partnership</p>
              <h2 className="axp-h2">HFQ Network × Aurex Hosting</h2>

              <div className="axp-pair">
                <div className="axp-logo">
                  <img src={HFQ_LOGO} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <span>HFQ Network</span>
                </div>
                <span className="axp-x" aria-hidden="true">×</span>
                <div className="axp-logo">
                  <img src="/images/aurex.png" alt="" />
                  <span>Aurex Hosting</span>
                </div>
              </div>

              <p className="axp-sub">
                We trust Aurex to host what we build, and we recommend it to our community. If you want
                your own server or bot, Aurex is the partner we stand behind.
              </p>
            </div>
          </Reveal>

          <div className="axp-features axp-perk-grid">
            {partnerPerks.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="axp-card axp-feature">
                  <span className="axp-icon"><Icon size={22} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="axp-section">
        <div className="axp-wrap">
          <Reveal>
            <h2 className="axp-h2">How to get started</h2>
            <p className="axp-sub">Three quick steps for HFQ players.</p>
          </Reveal>
          <div className="axp-steps">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="axp-card axp-step">
                  <span className="axp-step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="axp-section">
        <div className="axp-wrap">
          <Reveal>
            <h2 className="axp-h2">Why choose Aurex</h2>
            <p className="axp-sub">Everything you need to keep your server fast, safe and online.</p>
          </Reveal>
          <div className="axp-features">
            {features.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="axp-card axp-feature">
                  <span className="axp-icon"><Icon size={22} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="axp-section axp-last">
        <div className="axp-wrap">
          <Reveal>
            <div className="axp-cta">
              <h2 className="axp-h2">Ready to get online?</h2>
              <p className="axp-sub">Head to Aurex, or ask us on Discord if you have any questions.</p>
              <a className="axp-btn" href={AUREX_SITE} target="_blank" rel="noreferrer">
                Visit aurex.lk <ArrowRight size={18} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}