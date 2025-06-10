import { AnimatedText, Container, Card, buttonVariants } from '@/lib/ui';
import { Users, Shield, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const audienceItems = [
  {
    icon: <Users className="w-5 h-5" />,
    title: '25-45 Age Range',
    description: 'Ambitious professionals ready to build their own path',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'New Citizens',
    description: 'First and second generation immigrants with unique perspectives',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Tech-Novices',
    description: 'Passionate about their craft but need tech & data guidance',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'High Drive',
    description: 'Motivated self-starters willing to put in the work',
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const AudienceItem = ({ item, index }: { item: typeof audienceItems[0]; index: number }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-start group"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white bg-opacity-10 p-2 rounded-full mr-4 group-hover:bg-opacity-20 transition-colors"
    >
      {item.icon}
    </motion.div>
    <div>
      <h4 className="font-medium group-hover:text-[#50C878] transition-colors">{item.title}</h4>
      <p className="text-sm text-gray-300">{item.description}</p>
    </div>
  </motion.div>
);

export const TargetAudienceSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <AnimatedText
          text="Who We Serve"
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#003366]"
        />

        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="md:flex">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:w-1/2 bg-[#003366] p-8 md:p-12 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">Our Target Entrepreneurs</h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-4"
              >
                {audienceItems.map((item, index) => (
                  <AudienceItem key={item.title} item={item} index={index} />
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:w-1/2 p-8 md:p-12"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#003366]">Ready for Transformation?</h3>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <p className="text-gray-600 mb-6">
                  If you're ready to trade uncertainty for execution, you're in the right place. We
                  work with entrepreneurs who are committed to growth and ready to implement
                  data-driven strategies.
                </p>
                <p className="text-gray-600 mb-8">
                  Our clients come from diverse backgrounds but share a common trait: the
                  determination to succeed despite limited access to traditional business resources.
                </p>
                <a
                  href="#contact"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-[#50C878] hover:bg-opacity-90 text-white'
                  )}
                >
                  See If We're a Good Fit
                </a>
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </Container>
    </section>
  );
};
