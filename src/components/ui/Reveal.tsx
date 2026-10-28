import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "zoom";

type Props = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getHidden(direction: Direction) {
  switch (direction) {
    case "left":  return { opacity: 0, x: -48, y: 0, scale: 1 };
    case "right": return { opacity: 0, x: 48,  y: 0, scale: 1 };
    case "down":  return { opacity: 0, y: -20, x: 0, scale: 1 };
    case "zoom":  return { opacity: 0, scale: 0.92, x: 0, y: 0 };
    default:      return { opacity: 0, y: 28, x: 0, scale: 1 };
  }
}

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : getHidden(direction)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
