import { motion } from 'framer-motion';
import { Container, AnimatedText, Card } from '@/lib/ui';

const timelineSteps = [
  {
    title: 'Discovery & Analysis',
    description:
      'We begin by understanding your business, goals, and challenges through comprehensive analysis.',
    duration: '1-2 weeks',
  },
  {
    title: 'Strategy Development',
    description:
      'Our team crafts a tailored strategy based on data insights and industry best practices.',
    duration: '2-3 weeks',
  },
  {
    title: 'Implementation Planning',
    description:
      'We create a detailed roadmap for executing the strategy with clear milestones and metrics.',
    duration: '1-2 weeks',
  },
  {
    title: 'Execution & Support',
    description:
      'Working closely with your team to implement solutions and drive measurable results.',
    duration: 'Ongoing',
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const TimelineSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-soft opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.05)_0%,transparent_70%)]" />

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedText
            as="h2"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Our Process
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-soft/80 leading-relaxed">
            A structured approach to delivering exceptional results and driving sustainable growth.
          </AnimatedText>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 transform -translate-x-1/2" />

          {/* Timeline Steps */}
          <div className="space-y-12">
            {timelineSteps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                {/* Content */}
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <Card className="p-6 bg-background/50 backdrop-blur-sm border-soft/10 hover:border-primary/20 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-headings text-xl font-semibold text-primary">
                        {step.title}
                      </h3>
                      <span className="text-sm font-medium text-soft/70 bg-primary/10 px-3 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-soft/80">{step.description}</p>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <AnimatedText as="p" className="text-lg md:text-xl text-soft/80 max-w-3xl mx-auto">
            Our flexible approach adapts to your unique needs while maintaining a focus on
            delivering measurable results.
          </AnimatedText>
        </motion.div>
      </Container>
    </section>
  );
};
