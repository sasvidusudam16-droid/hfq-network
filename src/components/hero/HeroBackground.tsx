import type { CSSProperties } from "react";

const CORNER = [
  { side: "left", x: -70, y: 250, size: 130, rot: -28, delay: 0 },
  { side: "left", x: -45, y: 95, size: 190, rot: -14, delay: 0.4 },
  { side: "left", x: 120, y: 140, size: 115, rot: 6, delay: 0.8 },

  { side: "right", x: -60, y: 230, size: 175, rot: 16, delay: 0.2 },
  { side: "right", x: 125, y: 115, size: 150, rot: -8, delay: 0.6 },
  { side: "right", x: 60, y: 105, size: 100, rot: 22, delay: 1.0 },
];

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-bg-img" />
      <div className="hero-spotlight" />
      <div className="hero-red-glow" />

      {CORNER.map((h, i) => (
        <img
          key={i}
          src="/images/heart.png"
          alt=""
          className={`heart-corner heart-${h.side}`}
          style={{
            [h.side]: `${h.x}px`,
            bottom: `${h.y}px`,
            "--s": `${h.size}px`,
            "--rot": `${h.rot}deg`,
            "--d": `${h.delay}`,
          } as CSSProperties}
        />
      ))}

      <div className="hero-bottom-line" />
    </div>
  );
}