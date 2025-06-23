import { faqs } from '../data/faqs';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 * i } }),
};

const FAQCardGrid = () => (
  <section className="py-20 md:py-24 bg-gradient-to-br from-accent/30 to-white">
    <div className="container mx-auto px-4">
      <h2 className="font-headings text-3xl md:text-4xl font-bold text-primary text-center mb-10">
        Service FAQs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {faqs.map((faq, i) => (
          <motion.div
            key={faq.question}
            tabIndex={0}
            aria-label={`FAQ: ${faq.question}`}
            className="card bg-white border border-accent/40 shadow-card transition-all duration-200 hover:shadow-lg hover:shadow-highlight/30 hover:-translate-y-1.5 cursor-pointer flex flex-col active:shadow-lg focus:shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={cardVariants}
          >
            <div className="mb-3 text-2xl">❓</div>
            <div className="font-headings text-lg font-semibold text-primary mb-2">
              {faq.question}
            </div>
            <div className="text-primary/70 mb-4 text-base flex-1">
              {faq.answer}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-highlight/10 text-highlight text-xs font-medium">
                {faq.tag}
              </span>
            </div>
            <a href={faq.link} className="text-cta font-medium hover:underline hover:text-highlight transition-colors mt-auto">
              Learn How
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQCardGrid; 