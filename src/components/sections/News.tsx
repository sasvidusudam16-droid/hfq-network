import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { news, type NewsPost } from "../../data/news";
import FlyIn from "../ui/FlyIn";
import PixelBackground from "../ui/PixelBackground";
import Reveal from "../ui/Reveal";
import SplitText from "../ui/SplitText";

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function ZoomImage({ src, delay = 0 }: { src: string; delay?: number }) {
  return (
    <motion.div
      className="news-img-anim"
      initial={{ scale: 1.4 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.6, delay, ease }}
    >
      <div className="news-img" style={{ backgroundImage: `url(${src})` }} />
    </motion.div>
  );
}

function FeaturedCard({ post }: { post: NewsPost }) {
  const content = (
    <>
      <ZoomImage src={post.image} delay={0.1} />
      <div className="news-featured-shade" />
      <div className="news-featured-body">
        <Reveal delay={0.55}>
          <div className="news-meta">
            <span className="news-date">
              <CalendarDays size={14} /> {formatDate(post.date)}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.7}>
          <h3 className="news-featured-title">{post.title}</h3>
        </Reveal>
        <Reveal delay={0.85}>
          <p className="news-excerpt">{post.excerpt}</p>
        </Reveal>
      </div>
    </>
  );
  const cardClass = "news-featured";

  return post.url ? (
    <a href={post.url} className={cardClass} target="_blank" rel="noreferrer">{content}</a>
  ) : (
    <article className={cardClass}>{content}</article>
  );
}

function SmallCard({ post, i }: { post: NewsPost; i: number }) {
  const base = 0.35 + i * 0.18;

  const content = (
    <>
      <span className="news-shine" aria-hidden />

      <div className="news-small-img">
        <ZoomImage src={post.image} delay={base} />
      </div>
      <div className="news-small-body">
        <Reveal direction="right" delay={base + 0.2}>
          <div className="news-meta">
            <span className="news-date">{formatDate(post.date)}</span>
          </div>
        </Reveal>
        <Reveal direction="right" delay={base + 0.3}>
          <h3 className="news-small-title">{post.title}</h3>
        </Reveal>
        <Reveal direction="right" delay={base + 0.4}>
          <p className="news-excerpt news-excerpt-sm">{post.excerpt}</p>
        </Reveal>
      </div>
      {post.url && <ArrowUpRight size={18} className="news-small-arrow" aria-hidden="true" />}
    </>
  );
  const cardClass = `news-small accent-${post.tag.toLowerCase()}`;

  return post.url ? (
    <a href={post.url} className={cardClass} target="_blank" rel="noreferrer">{content}</a>
  ) : (
    <article className={cardClass}>{content}</article>
  );
}

export default function News() {
  const [featured, ...rest] = news;

  if (!featured) return null;

  return (
    <section id="next" className="news">
      <PixelBackground className="news-pixels" />

      <div className="news-container">
        <div className="news-head">
          <div>
            <SplitText as="h2" className="rank-title" text="Latest News" />
            <Reveal delay={0.3}>
              <p className="rank-sub">News and updates from the server</p>
            </Reveal>
          </div>
        </div>

        <div className="news-grid">
          <FlyIn from="left" className="news-anim-wrap">
            <FeaturedCard post={featured} />
          </FlyIn>

          <div className="news-list">
            {rest.slice(0, 3).map((post, index) => (
              <FlyIn key={post.id} from="right" delay={0.2 + index * 0.2} className="news-anim-wrap">
                <SmallCard post={post} i={index} />
              </FlyIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
