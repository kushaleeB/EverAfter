import { motion } from 'framer-motion';

export function LandingShowcase() {
  return (
    <section
      id="features"
      className="bg-surface px-6 py-20 md:px-16 md:py-[120px]"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl leading-tight tracking-tight text-on-surface md:text-[3rem]">
            Everything in One Beautiful Place
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-on-surface-variant md:text-lg">
            Manage your guest list, track RSVPs, and organize your seating from a single, elegant
            dashboard designed for your big day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 md:mt-20"
        >
          <div className="overflow-hidden rounded-[var(--radius-card)] shadow-ambient-lg">
            <img
              src="/img/lap.png"
              alt="Ever After wedding dashboard on laptop and mobile"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
