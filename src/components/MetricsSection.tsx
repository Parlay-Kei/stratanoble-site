import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, AnimatedText, Container, Card, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/utils';

const metrics = [
  {
    value: '20+',
    label: 'Founders Empowered',
  },
  {
    value: '$3.5M',
    label: 'Raised/Earned',
  },
  {
    value: '94%',
    label: 'Client Retention',
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

const MetricCard = ({ value, label, index }: { value: string; label: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-bold text-[#003366] mb-2"
    >
      {value}
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
      viewport={{ once: true }}
      className="text-gray-600"
    >
      {label}
    </motion.div>
  </motion.div>
);

export const MetricsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        <AnimatedText
          text="Success Metrics"
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#003366]"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} index={index} />
          ))}
        </div>

        <AnimatedSection delay={0.2}>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#003366]">
            Client Success Stories
          </h3>
        </AnimatedSection>

        <div className="relative max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTestimonial}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                <div className="mb-6 text-lg md:text-xl text-gray-600 italic">
                  "{testimonials[currentTestimonial].quote}"
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-[#50C878]"
                  />
                  <div>
                    <div className="font-bold text-[#003366]">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 space-x-4 pt-[200px]">
              <button
                onClick={prevTestimonial}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'icon' }),
                  'rounded-full'
                )}
              >
                <ChevronLeft className="w-5 h-5 text-[#003366]" />
              </button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentTestimonial ? 1 : -1);
                      setCurrentTestimonial(index);
                    }}
                    className={cn(
                      'w-3 h-3 rounded-full transition-colors',
                      index === currentTestimonial ? 'bg-[#50C878]' : 'bg-gray-300 hover:bg-gray-400'
                    )}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'icon' }),
                  'rounded-full'
                )}
              >
                <ChevronRight className="w-5 h-5 text-[#003366]" />
              </button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
};
