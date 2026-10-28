import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { links } from "../../data/site";
import DiscordIcon from "../ui/DiscordIcon";
import PixelBackground from "../ui/PixelBackground";
import Reveal from "../ui/Reveal";
import FlyIn from "../ui/FlyIn";
import SplitText from "../ui/SplitText";

export default function DiscordCTA() {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
	const charY = useTransform(scrollYProgress, [0, 1], [80, -80]);

	return (
		<section className="dcta" ref={sectionRef}>
			<PixelBackground className="dcta-pixels" />

			<div className="dcta-container">
				<FlyIn from="left" className="dcta-art">
					<motion.div style={{ y: charY }}>
						<img src="/images/discord-character.png" alt="HFQ Discord" className="dcta-char" />
					</motion.div>
				</FlyIn>

				<div className="dcta-body">
					<Reveal>
						<div className="dcta-deco">
							<span className="pixel-line" />
							<span className="dcta-icon">
								<DiscordIcon size={40} />
							</span>
							<span className="pixel-line" />
						</div>
					</Reveal>

					<SplitText as="h2" className="dcta-title" text="Come say hello" delay={0.15} />

					<Reveal delay={0.4}>
						<p className="dcta-desc">
							Meet the players behind the battles, catch server updates, and ask the community
							for a hand whenever you need one.
						</p>
					</Reveal>

					<Reveal delay={0.55} direction="zoom">
						<a href={links.discord} target="_blank" rel="noreferrer" className="mc-btn dcta-btn">
							<DiscordIcon size={18} />
							Join Discord
						</a>
					</Reveal>

					<Reveal delay={0.7}>
						<div className="dcta-deco">
							<span className="pixel-line" />
							<span className="pixel-diamond" />
							<span className="pixel-line" />
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
