import { FileText, FileCheck, FileSearch, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection, AnimatedText, Container, Card, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';

const resources = [
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: 'Ethical Finance Templates',
    description:
      'Startup-friendly financial planning documents that prioritize sustainable growth.',
    downloadUrl: '/downloads/ethical-finance-templates.pdf',
  },
  {
    icon: <FileCheck className="w-10 h-10 text-primary" />,
    title: 'CSR Framework',
    description: 'Corporate social responsibility guidelines for small businesses with big impact.',
    downloadUrl: '/downloads/csr-framework.pdf',
  },
  {
    icon: <FileSearch className="w-10 h-10 text-primary" />,
    title: 'Waste-OPS White Paper',
    description:
      'Our proprietary methodology for identifying and eliminating operational inefficiencies.',
    downloadUrl: '/downloads/waste-ops-whitepaper.pdf',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const ResourceCard = ({ resource, index }: { resource: (typeof resources)[0]; index: number }) => (
  <motion.div variants={itemVariants}>
    <Card className="group h-full p-6 bg-soft hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 rounded-2xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="flex justify-center mb-6 group-hover:scale-110 transition-transform"
      >
        {resource.icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-3 text-center text-primary group-hover:text-accent transition-colors">
        {resource.title}
      </h3>
      <p className="text-primary/80 text-center mb-6">{resource.description}</p>
      <div className="text-center">
        <a
          href={resource.downloadUrl}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'text-accent hover:text-primary inline-flex items-center'
          )}
        >
          Download PDF
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </Card>
  </motion.div>
);

export const ResourcesSection = () => {
  return (
    <section id="resources" className="py-20 bg-background">
      <Container>
        <AnimatedText
          text="Resource Library"
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary"
        />
        <AnimatedSection delay={0.2}>
          <p className="text-primary/80 text-center max-w-2xl mx-auto mb-16">
            Free tools and frameworks to help you start implementing better business practices
            today.
          </p>
        </AnimatedSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12"
        >
          {resources.map((resource, index) => (
            <ResourceCard key={resource.title} resource={resource} index={index} />
          ))}
        </motion.div>

        <AnimatedSection delay={0.4} className="text-center">
          <a
            href="/resources"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'text-primary border-primary hover:bg-primary hover:text-background'
            )}
          >
            Browse All Resources
          </a>
        </AnimatedSection>
      </Container>
    </section>
  );
};
