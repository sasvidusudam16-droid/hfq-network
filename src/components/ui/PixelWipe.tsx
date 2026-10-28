import { motion } from "framer-motion";

const COLS = 12;
const ROWS = 8;
const SHADES = ["#d81f36", "#c41a30", "#b3001b", "#e0263d"];

// Random delay + colour per block (fixed once so it doesn't change every render)
const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
  i,
  d: Math.random(),
  c: SHADES[Math.floor(Math.random() * SHADES.length)],
}));

const ease = [0.6, 0, 0.4, 1] as [number, number, number, number];

export default function PixelWipe() {
  return (
    <div className="pixel-wipe" aria-hidden>
      {cells.map((cell) => (
        <motion.span
          key={cell.i}
          className="pixel-wipe-cell"
          style={{ background: cell.c }}
          variants={{
            initial: { scale: 1.02 },
            enter: { scale: 0, transition: { duration: 0.35, delay: 0.05 + cell.d * 0.35, ease } },
            exit: { scale: 1.02, transition: { duration: 0.3, delay: cell.d * 0.3, ease } },
          }}
        />
      ))}
    </div>
  );
}