import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Container, AnimatedText, buttonVariants } from '@/lib/ui';
import useScrollToSection from '../lib/useScrollToSection';

export const HeroSection = () => {
  const scrollToServices = useScrollToSection('services');
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-background to-white overflow-hidden">
      {/* Animated SVG background element */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.circle
          cx="200"
          cy="200"
          r="60"
          fill="#50C87822"
          animate={{ cy: [200, 220, 200], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <motion.circle
          cx="1240"
          cy="400"
          r="40"
          fill="#FF6B6B22"
          animate={{ cy: [400, 420, 400], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <motion.circle
          cx="720"
          cy="100"
          r="30"
          fill="#00336622"
          animate={{ cy: [100, 120, 100], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      </motion.svg>
      <Container className="relative z-10 flex flex-col justify-center items-center min-h-screen py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <AnimatedText
            as="h1"
            className="font-headings text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary uppercase flex items-center justify-center gap-2"
          >
            Build Smart. Operate Lean. Grow with Confidence.
          </AnimatedText>

          <AnimatedText
            as="p"
            className="text-xl md:text-2xl text-primary/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered strategy for first-time founders and early-stage entrepreneurs.
          </AnimatedText>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              type="button"
              className={buttonVariants({
                size: 'lg',
                variant: 'cta',
                className: 'font-bold whitespace-nowrap',
              })}
              onClick={scrollToServices}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <ChevronDown className="w-8 h-8 text-highlight/80" />
        </motion.div>
      </Container>
    </section>
  );
};
