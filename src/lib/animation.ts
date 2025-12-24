import { Variants } from 'framer-motion';

// Standard timing
export const TIMING = {
  micro: 0.1, // 100ms - micro-interactions
  small: 0.15, // 150ms - small transitions
  medium: 0.2, // 200ms - medium transitions
  large: 0.3, // 300ms - large transitions
  slow: 0.5, // 500ms - page transitions
};

// Easing curves
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
};

// Reusable variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: TIMING.medium } },
  exit: { opacity: 0, transition: { duration: TIMING.small } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.medium, ease: EASING.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: TIMING.small },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.medium, ease: EASING.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: TIMING.small },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.small, ease: EASING.easeOut },
  },
};

