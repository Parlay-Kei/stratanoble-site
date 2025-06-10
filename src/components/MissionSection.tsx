import { motion } from 'framer-motion';
import { Target, Users, Lightbulb, Award } from 'lucide-react';
import { Container, AnimatedText, Card } from '@/lib/ui';

const values = [
  {
    icon: Target,
    title: 'Strategic Excellence',
    description:
      'Delivering data-driven strategies that drive measurable results and sustainable growth.',
  },
  {
    icon: Users,
    title: 'Client Partnership',
    description:
      'Building long-term relationships through collaboration, trust, and shared success.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation Focus',
    description:
      'Embracing cutting-edge methodologies and technologies to solve complex challenges.',
  },
  {
    icon: Award,
    title: 'Quality Commitment',
    description: 'Maintaining the highest standards of excellence in every aspect of our work.',
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
      ease: 'easeOut',
    },
  },
};

export const MissionSection = () => {
  return (
    <section id="about" className="py-24 bg-gradient-primary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0%,transparent_70%)]" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Our Mission
          </AnimatedText>
          <AnimatedText as="p" className="text-xl md:text-2xl text-soft/90 leading-relaxed">
            To empower businesses with data-driven insights and strategic solutions that drive
            sustainable growth and operational excellence.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value) => (
            <motion.div key={value.title} variants={itemVariants}>
              <Card className="h-full p-6 bg-background/50 backdrop-blur-sm border-soft/10 hover:border-primary/20 transition-colors group">
                <div className="mb-6 p-3 w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="font-headings text-xl font-semibold mb-3 text-primary">
                  {value.title}
                </h3>
                <p className="text-soft/80">{value.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <AnimatedText as="p" className="text-lg md:text-xl text-soft/80 max-w-3xl mx-auto italic">
            &quot;We believe in the power of data-driven decision making and strategic thinking to
            transform businesses and create lasting impact in the marketplace.&quot;
          </AnimatedText>
        </motion.div>
      </Container>
    </section>
  );
};
