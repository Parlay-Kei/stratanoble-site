import { motion } from 'framer-motion';

const steps = [
  {
    icon: '🔍',
    title: 'Discover',
    explainer: 'We listen, learn, and map your unique challenges.',
  },
  {
    icon: '🛠️',
    title: 'Design',
    explainer: 'We co-create a solution that fits your goals and resources.',
  },
  {
    icon: '🚀',
    title: 'Deliver',
    explainer: 'We help you launch, iterate, and grow with confidence.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 * i } }),
};

const HowWeWork = () => (
  <section className="py-20 md:py-24 bg-gradient-to-br from-[#F4F4F4] to-white">
    <div className="container mx-auto px-4">
      <h2 className="font-headings text-3xl md:text-4xl font-bold text-primary text-center mb-10">
        How We Work
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="bg-white rounded-lg shadow-card p-8 flex flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={cardVariants}
          >
            <div className="mb-4 text-highlight text-4xl">{step.icon}</div>
            <div className="font-headings text-xl font-semibold text-primary mb-2 uppercase tracking-wide">
              {step.title}
            </div>
            <div className="text-primary/70 text-base">
              {step.explainer}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowWeWork; 