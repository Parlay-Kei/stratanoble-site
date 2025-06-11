import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Container, Card, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';

interface CaseStudy {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: "E-commerce Growth Strategy",
    description: "Helped a niche e-commerce brand increase their conversion rate by 40% within 3 months through targeted SEO and ad campaigns.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b7efd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    link: "#",
  },
  {
    id: 2,
    title: "SaaS Product Launch",
    description: "Orchestrated a successful market entry for a new B2B SaaS platform, achieving 500+ sign-ups in the first month.",
    image: "https://images.unsplash.com/photo-1606132924467-333e14304859?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    link: "#",
  },
  {
    id: 3,
    title: "Non-profit Digital Transformation",
    description: "Guided a non-profit through a complete digital overhaul, improving donor engagement by 60% and streamlining operations.",
    image: "https://images.unsplash.com/photo-1543269828-170427bc5292?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    link: "#",
  },
];

const sliderVariants = {
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

export const CaseStudiesSlider = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage(([currentPage]) => [
      (currentPage + newDirection + caseStudies.length) % caseStudies.length,
      newDirection,
    ]);
  };

  const currentCaseStudy = caseStudies[page];

  return (
    <section className="relative py-24 bg-primary text-white overflow-hidden">
      {/* Gradient Overlay for Gradient Edge */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-primary opacity-70" />

      <Container className="relative z-10 text-center">
        <h2 className="font-headings text-4xl md:text-5xl font-bold mb-16 text-white">
          Case Studies
        </h2>

        <div className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center">
          <motion.div
            key={page}
            custom={direction}
            variants={sliderVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full"
          >
            <Card className="bg-primary/50 border border-soft/20 backdrop-blur-md p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8 text-left h-full">
              <img
                src={currentCaseStudy.image}
                alt={currentCaseStudy.title}
                className="w-full md:w-1/2 h-64 md:h-full object-cover rounded-lg shadow-lg"
              />
              <div className="flex-1">
                <h3 className="font-headings text-3xl font-bold mb-4 text-soft">
                  {currentCaseStudy.title}
                </h3>
                <p className="text-lg text-soft/80 mb-6">
                  {currentCaseStudy.description}
                </p>
                <a
                  href={currentCaseStudy.link}
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    'bg-accent text-white hover:bg-accent/90 inline-flex items-center'
                  )}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4 lg:px-0">
          <button
            onClick={() => paginate(-1)}
            className="z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>
      </Container>
    </section>
  );
};
