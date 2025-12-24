import { motion, AnimatePresence, Variants } from 'framer-motion';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SafeMotionProps {
  children: React.ReactNode;
  variants: Variants;
  reducedVariants?: Variants;
  className?: string;
}

// Minimal variants for reduced motion
const reducedMotionFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

export function SafeMotion({
  children,
  variants,
  reducedVariants = reducedMotionFade,
  className,
}: SafeMotionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedVariants : variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

