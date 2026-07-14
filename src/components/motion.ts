/**
 * Shared motion vocabulary.
 *
 * Conventions:
 * - Below-the-fold content reveals with `whileInView="visible"` +
 *   `viewport={VIEWPORT_ONCE}`; above-the-fold uses `animate="visible"`.
 * - Lists animate via ONE parent with `staggerChildren`, never per-item
 *   `delay: index * x` (unbounded delays on long lists feel broken).
 * - Hover lift: -2px for standard cards, -4px for media cards.
 * - Press feedback: scale 0.98.
 * - No infinite ambient loops outside the marketing hero, and any loop
 *   must be gated behind framer-motion's useReducedMotion().
 */
import { Variants } from "framer-motion";

export const DUR = { fast: 0.15, base: 0.3, slow: 0.5 } as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT_ONCE = { once: true, margin: "-60px" } as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DUR.base, ease: EASE_OUT },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE_OUT },
  },
};

export const staggerChildren = (stagger = 0.06): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});
