import { motion } from 'framer-motion';

export function LandingShowcase() {
  return (
    <section id="features" className="bg-[#FFF8F5] px-6 py-20 md:px-16 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-[2rem] leading-tight tracking-tight text-[#8b734b] md:text-5xl">
            Everything in One Beautiful Place
          </h2>
          <p className="mt-6 font-body text-base leading-relaxed text-on-surface md:text-lg">
            Manage your guest list, track RSVPs, and organize your events from a single, elegant
            dashboard designed for simplicity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 md:mt-20"
        >
          <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[var(--radius-card)] shadow-ambient-lg">
            <img
              src="/img/lap.png"
              alt="Ever After wedding dashboard on laptop"
              className="block h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
