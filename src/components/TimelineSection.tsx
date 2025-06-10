import { motion } from 'framer-motion';
import { AnimatedSection, AnimatedText, Container } from '@/lib/ui';

const timelineItems = [
  {
    title: 'Weekly Stand-Ups',
    description: 'Quick check-ins to ensure alignment and address immediate concerns',
    icon: '📊',
  },
  {
    title: 'Bi-Weekly Pipeline Sync',
    description: 'Review progress on key initiatives and adjust priorities as needed',
    icon: '🔄',
  },
  {
    title: 'Monthly KPI Deep-Dive',
    description: 'Comprehensive analysis of performance metrics and strategic adjustments',
    icon: '📈',
  },
  {
    title: 'Quarterly Strategy Refresh',
    description: 'Full review of business direction and long-term planning',
    icon: '🎯',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const TimelineItem = ({ item, index }: { item: typeof timelineItems[0]; index: number }) => (
  <motion.div
    variants={itemVariants}
    className="flex flex-col items-center group"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="bg-[#003366] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span className="text-2xl">{item.icon}</span>
      </div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#003366] rotate-45"></div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h3 className="text-lg font-bold mb-2 text-[#003366] group-hover:text-[#50C878] transition-colors">
        {item.title}
      </h3>
      <p className="text-gray-600 text-sm">{item.description}</p>
    </motion.div>
  </motion.div>
);

export const TimelineSection = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <AnimatedText
          text="Operating Rhythm"
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#003366]"
        />
        <AnimatedSection delay={0.2}>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Our structured approach ensures consistent progress toward your business goals.
          </p>
        </AnimatedSection>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated horizontal line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] via-[#50C878] to-[#003366] transform -translate-y-1/2 z-0"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {timelineItems.map((item, index) => (
              <TimelineItem key={item.title} item={item} index={index} />
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
