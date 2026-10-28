import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { links, navLinks, partner, routes, site } from "../../data/site";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import DiscordIcon from "../ui/DiscordIcon";
import Reveal from "../ui/Reveal";

const year = new Date().getFullYear();

export default function Footer() {
	const { copied, copy } = useCopyToClipboard();
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
	const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
	const swordY = useTransform(p, [0, 1], [180, 0]);
	const swordRotate = useTransform(p, [0, 1], [22, 8]);
	const swordOpacity = useTransform(p, [0, 0.6], [0, 0.35]);

	return (
		<footer className="footer" ref={ref}>
			<motion.div
				className="footer-art-wrap"
				style={{ y: swordY, rotate: swordRotate, opacity: swordOpacity }}
				aria-hidden
			>
				<img src="/images/footer-sword.png" alt="" className="footer-art" />
			</motion.div>

			<div className="footer-container">
				<div className="footer-grid">
					<Reveal className="footer-brand">
						  <Link to={routes.home} className="nav-brand">
							<img src="/images/logo.png" alt="HFQ" className="nav-logo" />
							<span>
								HFQ <span className="nav-brand-accent">Network</span>
							</span>
						</Link>
						<p className="footer-about">{site.description}</p>

						<button onClick={() => copy(site.ip)} className="footer-ip" type="button">
							<span>
								  <span className="footer-ip-label">Server address</span>
								  <span className="footer-ip-value">{copied ? "Address copied" : site.ip}</span>
							</span>
							{copied ? <Check size={18} /> : <Copy size={18} />}
						</button>
					</Reveal>

					<Reveal delay={0.1}>
						<h4 className="footer-heading">Navigation</h4>
						<ul className="footer-links">
							{navLinks.map((link) => (
								<li key={link.to}>
									<Link to={link.to}>{link.label}</Link>
								</li>
							))}
						</ul>
					</Reveal>

					<Reveal delay={0.2}>
						<h4 className="footer-heading">Community</h4>
						<ul className="footer-links">
							<li><a href={links.discord} target="_blank" rel="noreferrer">Discord</a></li>
							<li><Link to={routes.store}>Store</Link></li>
							<li><Link to={routes.vote}>Vote</Link></li>
							<li><Link to={routes.jobs}>Jobs</Link></li>
							<li><Link to={routes.aurex}>Aurex Partner</Link></li>
						</ul>
					</Reveal>

					<Reveal delay={0.3}>
						<h4 className="footer-heading">Support</h4>
						<ul className="footer-links">
							<li><a href={links.discord} target="_blank" rel="noreferrer">Open a Ticket</a></li>
							<li><a href={links.discord} target="_blank" rel="noreferrer">Ban Appeals</a></li>
							<li><a href={links.discord} target="_blank" rel="noreferrer">Report a Player</a></li>
						</ul>
						<a href={links.discord} target="_blank" rel="noreferrer" className="footer-social" aria-label="Discord">
							<DiscordIcon size={20} />
						</a>
					</Reveal>
				</div>

				<Reveal delay={0.4} className="footer-bottom">
					<div>
						<p>© {year} HFQ Network. All rights reserved.</p>
						<p className="footer-disclaimer">
							Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
						</p>
					</div>
					<a href={partner.url} target="_blank" rel="noreferrer" className="footer-powered">
						{partner.label}
						<img src={partner.logo} alt="" />
						<strong>{partner.name}</strong>
					</a>
				</Reveal>

				<div className="footer-dev-row">
					<a href="https://from.jakenetwork.xyz" target="_blank" rel="noreferrer" className="footer-dev" aria-label="Developed by from">
						<span>Developed by</span>
						<img src="/images/from-logo-white.svg" alt="from" />
					</a>
				</div>
			</div>
		</footer>
	);
}