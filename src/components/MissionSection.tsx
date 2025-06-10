import { TrendingUp, Compass, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection, AnimatedText, Container, Card } from '@/lib/ui';
import { cn } from '@/lib/utils';

const missionItems = [
  {
    icon: <TrendingUp className="w-8 h-8 text-[#003366]" />,
    title: 'Mission',
    description: 'Empower solo & small-business owners—especially new citizens and first-gen founders—to launch sustainable ventures.',
    bgColor: 'bg-[#003366] bg-opacity-10',
  },
  {
    icon: <Compass className="w-8 h-8 text-[#003366]" />,
    title: 'Vision',
    description: 'Become the most trusted partner for ambitious self-starters who lack access to traditional consulting.',
    bgColor: 'bg-[#C0C0C0] bg-opacity-20',
  },
  {
    icon: <LineChart className="w-8 h-8 text-[#50C878]" />,
    title: 'Values',
    description: null,
    bgColor: 'bg-[#50C878] bg-opacity-10',
    values: ['Elevation', 'Guidance', 'Insight'],
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

const MissionCard = ({ item, index }: { item: typeof missionItems[0]; index: number }) => (
  <motion.div variants={itemVariants}>
    <Card className="group h-full p-8 hover:shadow-xl transition-all duration-300">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className={cn(item.bgColor, 'w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform')}
      >
        {item.icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-4 text-[#003366] group-hover:text-[#50C878] transition-colors">
        {item.title}
      </h3>
      {item.description ? (
        <p className="text-gray-600">{item.description}</p>
      ) : (
        <ul className="text-gray-600 space-y-3">
          {item.values?.map((value, i) => (
            <motion.li
              key={value}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start"
            >
              <span className="text-[#50C878] font-bold mr-2">•</span>
              <span>{value}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  </motion.div>
);

export const MissionSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <Container>
        <AnimatedText
          text="Why Strata Noble"
          className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#003366]"
        />
        <AnimatedSection delay={0.2}>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Our foundation is built on three core principles that guide everything we do.
          </p>
        </AnimatedSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {missionItems.map((item, index) => (
            <MissionCard key={item.title} item={item} index={index} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
