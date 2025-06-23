import { services } from '../data/services';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 * i } }),
};

const ServiceCardGrid = () => (
  <section id="services" className="py-20 md:py-24 bg-gradient-to-br from-accent/50 to-white">
    <div className="container mx-auto px-4">
      <h2 className="font-headings text-3xl md:text-4xl font-bold text-primary text-center mb-10">
        What We Help You With
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {services.map((service, i) => (
          <motion.a
            key={service.title}
            href={service.link}
            tabIndex={0}
            aria-label={`Learn more about ${service.title}`}
            className="group card bg-white hover:shadow-card-hover border border-accent/40 transition-all duration-200 flex flex-col items-center text-center p-8 cursor-pointer active:shadow-lg focus:shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={cardVariants}
          >
            <div className="mb-4 text-highlight text-4xl">{service.icon}</div>
            <div className="font-headings text-xl font-semibold text-primary mb-2">
              {service.title}
            </div>
            <div className="text-primary/70 mb-4 text-base">
              {service.subtitle}
            </div>
            <span className="inline-block mt-auto text-cta font-medium group-hover:underline group-hover:text-highlight transition-colors">
              Learn More →
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default ServiceCardGrid; 