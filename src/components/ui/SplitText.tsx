import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
};

export default function SplitText({ text, className, as = "h2" }: Props) {
  const Tag = motion[as];
  const words = text.split(" ");

  return (
    <Tag className={className} style={{ opacity: 1 }}>
      {words.map((w, i) => (
        <span key={i} className="split-word">
          <span className="split-inner" style={{ display: "inline-block", opacity: 1, transform: "none" }}>
            {w}
          </span>
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </Tag>
  );
}
