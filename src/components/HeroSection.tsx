import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container, AnimatedText, buttonVariants } from '@/lib/ui';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-primary overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.1)_0%,transparent_70%)]" />

      <Container className="relative z-10 flex flex-col h-full py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto flex-grow flex flex-col justify-center items-center"
        >
          <AnimatedText
            as="h1"
            className="font-headings text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-soft"
          >
            Strategic Growth Through Data-Driven Excellence
          </AnimatedText>

          <AnimatedText
            as="p"
            className="text-xl md:text-2xl text-soft/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Empowering businesses with actionable insights and transformative strategies for
            sustainable growth in the digital age.
          </AnimatedText>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="#contact"
              className={buttonVariants({ size: 'lg', variant: 'primary' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.a>

            <motion.a
              href="#services"
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Services
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full p-1">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full mx-auto"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
