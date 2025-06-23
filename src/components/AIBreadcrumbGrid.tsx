import { aiBreadcrumbs } from '../data/aiBreadcrumbs';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 * i } }),
};

const bgClasses = [
  'bg-highlight/10',
  'bg-cta/10',
  'bg-accent/60',
  'bg-highlight/20',
  'bg-cta/20',
];

const AIBreadcrumbGrid = () => (
  <section className="py-20 md:py-24 bg-gradient-to-br from-background to-white">
    <div className="container mx-auto px-4">
      <h2 className="font-headings text-3xl md:text-4xl font-bold text-primary text-center mb-10">
        AI Knowledge Breadcrumbs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {aiBreadcrumbs.map((item, i) => (
          <motion.a
            key={item.title}
            href={item.link}
            tabIndex={0}
            aria-label={`Learn more about ${item.title}`}
            className={`card border-0 shadow-card transition-all duration-200 hover:shadow-lg hover:shadow-highlight/30 hover:-translate-y-1.5 cursor-pointer flex flex-col active:shadow-lg focus:shadow-lg ${bgClasses[i % bgClasses.length]}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={cardVariants}
          >
            <div className="mb-3 text-2xl">🧠</div>
            <div className="font-headings text-lg font-semibold text-primary mb-2">
              {item.title}
            </div>
            <div className="text-primary/80 mb-4 text-base flex-1">
              {item.insight}
            </div>
            <span className="text-cta font-medium hover:underline hover:text-highlight transition-colors mt-auto">
              How this helps you build smarter →
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default AIBreadcrumbGrid; 