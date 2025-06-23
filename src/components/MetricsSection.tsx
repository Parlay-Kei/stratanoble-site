import { motion, useScroll, useTransform } from 'framer-motion';
import { Container, AnimatedText } from '@/lib/ui';
import { TrendingUp, Users, Award, Clock } from 'lucide-react';

const metrics = [
  {
    icon: TrendingUp,
    value: '150%',
    label: 'Average Client Growth',
    description: 'Year-over-year revenue increase for our clients',
  },
  {
    icon: Users,
    value: '50+',
    label: 'Successful Projects',
    description: 'Businesses transformed through our consulting',
  },
  {
    icon: Award,
    value: '95%',
    label: 'Client Satisfaction',
    description: 'Based on post-engagement surveys',
  },
  {
    icon: Clock,
    value: '3x',
    label: 'Faster Growth',
    description: 'Compared to industry averages',
  },
];

const testimonials = [
  {
    quote:
      'Strata Noble transformed my business from a struggling startup to a profitable venture in just six months. Their data-driven approach made all the difference.',
    name: 'Sarah J.',
    role: 'Tech Founder',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
  },
  {
    quote:
      'As a first-generation entrepreneur, I was lost in the complexities of business strategy. Strata Noble provided clear guidance that helped me secure my first major client.',
    name: 'Michael T.',
    role: 'Service Business Owner',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
  },
  {
    quote:
      "The Waste-OPS methodology helped us identify inefficiencies we never noticed. We've reduced operational costs by 30% while improving our customer experience.",
    name: 'Priya K.',
    role: 'Retail Entrepreneur',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
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

export const MetricsSection = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-soft opacity-5" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.05)_0%,transparent_70%)]"
        style={{ opacity, scale }}
      />

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Our Impact
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-primary/80 leading-relaxed">
            Measurable results that demonstrate our commitment to client success and business
            transformation.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {metrics.map((metric) => (
            <motion.div key={metric.label} variants={itemVariants} className="relative group">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
              <div className="relative p-8 bg-background/50 backdrop-blur-sm border border-soft/10 rounded-2xl group-hover:border-primary/20 transition-colors">
                <div className="mb-6 p-3 w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <metric.icon className="w-6 h-6" />
                </div>
                <div className="font-headings text-4xl font-bold text-primary mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-primary mb-2">{metric.label}</div>
                <p className="text-primary/70">{metric.description}</p>
              </div>
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
          <AnimatedText as="p" className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto">
            These metrics represent our commitment to delivering exceptional value and driving
            meaningful growth for our clients.
          </AnimatedText>
        </motion.div>
      </Container>
    </section>
  );
};
