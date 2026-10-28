import { motion, useReducedMotion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function SplitText({ text, className, as = "h2", delay = 0 }: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          transition={{ duration: 0.55, ease }}
          style={{ display: "inline-block" }}
        >
          {w}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </Tag>
  );
}
