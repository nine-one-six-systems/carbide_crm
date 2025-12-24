import { motion, AnimatePresence } from 'framer-motion';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem } from '@/lib/animation';

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: AnimatedListProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div key={keyExtractor(item)} variants={staggerItem} layout>
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

