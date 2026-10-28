import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  from?: "left" | "right";
  delay?: number;
  className?: string;
};

export default function FlyIn({ children, className }: Props) {
  return (
    <motion.div className={className} style={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}>
      {children}
    </motion.div>
  );
}
