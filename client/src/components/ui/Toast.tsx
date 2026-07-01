import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string | null;
  className?: string;
}

export function Toast({ message, className }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-full border border-[#e8dfd6] bg-white px-5 py-2.5 font-body text-sm font-medium text-[#4e342e] shadow-[0_8px_32px_rgba(78,52,46,0.14)]',
            className,
          )}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
