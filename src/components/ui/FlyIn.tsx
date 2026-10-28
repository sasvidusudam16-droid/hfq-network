import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  from?: "left" | "right";
  delay?: number;
  className?: string;
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FlyIn({ children, from = "left", delay = 0, className }: Props) {
  const reduced = useReducedMotion();
  const xFrom = from === "left" ? -64 : 64;

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, x: xFrom }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
