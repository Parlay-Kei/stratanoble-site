import { motion } from 'framer-motion';
import { Building2, Users, Rocket, Target } from 'lucide-react';
import { Container, AnimatedText, Card } from '@/lib/ui';

const audiences = [
  {
    icon: Building2,
    title: 'Growing Businesses',
    description:
      'Companies seeking to scale operations and expand market reach while maintaining efficiency.',
    needs: [
      'Scalable growth strategies',
      'Operational optimization',
      'Market expansion support',
      'Resource allocation',
    ],
  },
  {
    icon: Users,
    title: 'Enterprise Teams',
    description:
      'Established organizations looking to innovate and transform their business models.',
    needs: [
      'Digital transformation',
      'Process improvement',
      'Innovation strategy',
      'Change management',
    ],
  },
  {
    icon: Rocket,
    title: 'Startups & Scale-ups',
    description: 'Ambitious ventures ready to accelerate growth and establish market leadership.',
    needs: [
      'Go-to-market strategy',
      'Business model optimization',
      'Growth acceleration',
      'Investor readiness',
    ],
  },
  {
    icon: Target,
    title: 'Industry Leaders',
    description:
      'Market leaders focused on maintaining competitive advantage and driving innovation.',
    needs: [
      'Competitive analysis',
      'Innovation strategy',
      'Performance optimization',
      'Strategic planning',
    ],
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

export const TargetAudienceSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0%,transparent_70%)]" />

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Who We Serve
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-primary/90 leading-relaxed">
            We partner with forward-thinking organizations across various stages of growth,
            delivering tailored solutions for their unique challenges.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {audiences.map((audience) => (
            <motion.div key={audience.title} variants={itemVariants}>
              <Card className="h-full p-6 bg-soft/50 backdrop-blur-lg border-primary/10 hover:border-accent/20 transition-colors group rounded-2xl shadow-glass group-hover:shadow-xl group-hover:shadow-accent/40">
                <div className="flex items-start gap-6">
                  <div className="p-3 w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <audience.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headings text-xl font-semibold mb-3 text-primary">
                      {audience.title}
                    </h3>
                    <p className="text-primary/80 mb-4">{audience.description}</p>
                    <ul className="space-y-2">
                      {audience.needs.map((need) => (
                        <li
                          key={need}
                          className="flex items-center text-primary/70 group-hover:text-primary transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/50 mr-2 group-hover:bg-accent transition-colors" />
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
          <AnimatedText as="p" className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto">
            Our expertise spans across industries, helping organizations of all sizes achieve their
            growth objectives through data-driven strategies and innovative solutions.
          </AnimatedText>
        </motion.div>
      </Container>
    </section>
  );
};
