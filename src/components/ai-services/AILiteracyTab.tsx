import { motion } from 'framer-motion';
import { Container, Card, AnimatedText, buttonVariants } from '@/lib/ui';
import { Brain, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/ui-utils';

const offerings = [
  {
    icon: Brain,
    title: 'AI Jump-Start Lab',
    description:
      'A comprehensive introduction to AI tools and concepts, designed to get you up and running quickly.',
    features: [
      'AI Fundamentals Workshop',
      'Tool Selection & Setup',
      'Best Practices & Ethics',
      'Hands-on Implementation',
    ],
    duration: '2 Days',
    investment: '$997',
  },
  {
    icon: GraduationCap,
    title: 'Prompt-Craft Bootcamp',
    description: 'Master the art of AI prompting to get the best results from your AI tools.',
    features: [
      'Advanced Prompt Engineering',
      'Context & Tone Control',
      'Output Optimization',
      'Workflow Integration',
    ],
    duration: '3 Days',
    investment: '$1,497',
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

export const AILiteracyTab = () => {
  return (
    <div className="py-12">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-3xl md:text-4xl font-bold mb-6 text-primary"
          >
            Build Your AI Foundation
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-primary/80 leading-relaxed">
            Start your AI journey with confidence. Our foundational programs equip you with the
            knowledge and skills to leverage AI effectively.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {offerings.map((offering) => (
            <motion.div key={offering.title} variants={itemVariants}>
              <Card className="h-full p-8 bg-soft/50 backdrop-blur-lg border-primary/10 hover:border-accent/20 transition-colors group rounded-2xl shadow-glass group-hover:shadow-xl group-hover:shadow-accent/40">
                <div className="flex items-start gap-6 mb-6">
                  <div className="p-3 w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <offering.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headings text-2xl font-semibold mb-2 text-primary">
                      {offering.title}
                    </h3>
                    <p className="text-primary/80">{offering.description}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {offering.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center text-primary/70 group-hover:text-primary transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/50 mr-2 group-hover:bg-accent transition-colors" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                  <div className="space-y-1">
                    <p className="text-sm text-primary/60">Duration</p>
                    <p className="font-medium text-primary">{offering.duration}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-primary/60">Investment</p>
                    <p className="font-medium text-primary">{offering.investment}</p>
                  </div>
                </div>

                <motion.a
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'lg' }),
                    'w-full mt-8 bg-accent text-white hover:bg-accent/90 flex items-center justify-center gap-2'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-primary/80 max-w-2xl mx-auto">
            Not sure which program is right for you? Book a free strategy call to discuss your goals
            and find the perfect fit.
          </p>
        </motion.div>
      </Container>
    </div>
  );
};
