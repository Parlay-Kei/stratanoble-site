import { Activity, BarChart3, Workflow, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection, AnimatedText, Container, Card, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/utils';

const services = [
  {
    icon: <Activity className="w-8 h-8 text-[#50C878]" />,
    title: 'Business Model Design & Validation',
    description:
      'Create sustainable, profitable business models tailored to your unique market position and capabilities.',
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#50C878]" />,
    title: 'Data Analytics & BI Road-Mapping',
    description:
      'Transform raw data into actionable insights with custom analytics frameworks and business intelligence solutions.',
  },
  {
    icon: <Workflow className="w-8 h-8 text-[#50C878]" />,
    title: 'Operational Process Engineering',
    description:
      'Identify and eliminate inefficiencies with our Waste-OPS methodology to streamline your business operations.',
  },
  {
    icon: <Target className="w-8 h-8 text-[#50C878]" />,
    title: 'Branding & Go-to-Market Strategy',
    description:
      'Develop compelling brand positioning and effective market entry strategies to connect with your ideal customers.',
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

export const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <Container>
        <AnimatedText
          text="Core Services"
          className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#003366]"
        />
        <AnimatedSection delay={0.2}>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            We provide targeted consulting solutions designed specifically for emerging entrepreneurs.
          </p>
        </AnimatedSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full p-8 hover:shadow-xl transition-all duration-300">
                <div className="bg-[#003366] bg-opacity-5 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#003366] group-hover:text-[#50C878] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <a
                  href="#contact"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'text-[#50C878] hover:text-[#003366] p-0 h-auto'
                  )}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
