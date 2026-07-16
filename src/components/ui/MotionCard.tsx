"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { fadeInUp } from "@/components/motion";
import { cardClasses } from "./Card";

type Padding = "sm" | "md" | "lg" | "none";

type Props = {
  children: ReactNode;
  padding?: Padding;
  hover?: boolean;
  selected?: boolean;
  className?: string;
  /** Reveal variants; stagger is owned by the parent list. */
  variants?: Variants;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * A card that participates in list reveal animations. Surface + hover come
 * from cardClasses() (shared with the server Card); reveals default to
 * fadeInUp. Hover lift is CSS-only — do not pass whileHover.
 */
export default function MotionCard({
  children,
  padding = "md",
  hover = false,
  selected = false,
  className = "",
  variants = fadeInUp,
  ...rest
}: Props) {
  return (
    <motion.div
      variants={variants}
      className={cardClasses({ padding, hover, selected, className })}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
