import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "zoom";

type Props = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
};

export default function Reveal({
  children,
  className,
}: Props) {
  return (
    <motion.div className={className} style={{ opacity: 1, filter: "none", x: 0, y: 0, scale: 1 }}>
      {children}
    </motion.div>
  );
}
