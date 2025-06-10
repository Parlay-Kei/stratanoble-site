import { motion } from 'framer-motion';
import { Activity, BarChart3, Workflow, Target } from 'lucide-react';
import { Container, AnimatedText, Card } from '@/lib/ui';

const services = [
  {
    icon: Activity,
    title: 'Performance Analytics',
    description:
      'Deep dive into your business metrics to identify growth opportunities and optimize performance.',
    features: [
      'Custom KPI Development',
      'Real-time Analytics Dashboard',
      'Performance Benchmarking',
      'ROI Optimization',
    ],
  },
  {
    icon: BarChart3,
    title: 'Strategic Planning',
    description:
      'Develop comprehensive growth strategies aligned with your business objectives and market dynamics.',
    features: [
      'Market Analysis',
      'Competitive Intelligence',
      'Growth Roadmapping',
      'Resource Allocation',
    ],
  },
  {
    icon: Workflow,
    title: 'Process Optimization',
    description:
      'Streamline operations and enhance efficiency through data-driven process improvements.',
    features: [
      'Workflow Analysis',
      'Efficiency Metrics',
      'Automation Strategy',
      'Quality Assurance',
    ],
  },
  {
    icon: Target,
    title: 'Market Expansion',
    description:
      'Identify and capture new market opportunities with data-backed expansion strategies.',
    features: ['Market Research', 'Entry Strategy', 'Channel Development', 'Risk Assessment'],
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

export const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-soft opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.05)_0%,transparent_70%)]" />

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Our Services
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-soft/80 leading-relaxed">
            Comprehensive consulting solutions designed to drive sustainable growth and operational
            excellence.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="h-full p-6 bg-background/50 backdrop-blur-sm border-soft/10 hover:border-primary/20 transition-colors group">
                <div className="mb-6 p-3 w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="font-headings text-xl font-semibold mb-3 text-primary">
                  {service.title}
                </h3>
                <p className="text-soft/80 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-soft/70 group-hover:text-soft transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2 group-hover:bg-primary transition-colors" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
