import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/lib/ui';
import useScrollToSection from '../lib/useScrollToSection';

const StickyCTA = () => {
  const scrollToServices = useScrollToSection('services');
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 sm:right-1/2 sm:translate-x-1/2 sm:left-1/2 sm:w-auto w-full flex justify-center"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <button
        type="button"
        className={buttonVariants({
          size: 'lg',
          variant: 'cta',
          className: 'rounded-full shadow-lg font-bold flex items-center gap-2 px-8 py-3 whitespace-nowrap',
        })}
        onClick={scrollToServices}
      >
        Contact Us
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </motion.div>
  );
};

export default StickyCTA;
