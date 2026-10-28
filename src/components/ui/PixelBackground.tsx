import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const BIG = 160;
const SMALL = 40;
const TONES = ["#2a1215", "#33161a", "#3d1a1f", "#241013", "#45202a", "#2e1418", "#3a1c20"];

function seeded(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = { className?: string; seed?: number; parallax?: number };

export default function PixelBackground({ className, seed = 42, parallax = 80 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-parallax, parallax]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      const rand = seeded(seed);

      for (let yy = 0; yy < h; yy += BIG)
        for (let x = 0; x < w; x += BIG) {
          ctx.fillStyle = TONES[Math.floor(rand() * TONES.length)];
          ctx.fillRect(x, yy, BIG, BIG);
        }

      for (let yy = 0; yy < h; yy += SMALL)
        for (let x = 0; x < w; x += SMALL) {
          const r = rand();
          if (r < 0.15) ctx.fillStyle = `rgba(255, 90, 100, ${rand() * 0.07})`;
          else if (r < 0.4) ctx.fillStyle = `rgba(0, 0, 0, ${rand() * 0.25})`;
          else continue;
          ctx.fillRect(x, yy, SMALL, SMALL);
        }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [seed]);

  return <motion.canvas ref={ref} className={className} style={{ y }} aria-hidden />;
}