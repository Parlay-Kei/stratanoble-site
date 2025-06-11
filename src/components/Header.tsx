import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Container, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-primary shadow-lg" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="flex items-center justify-between h-20">
        {/* Logo */}
        <motion.a
          href="/"
          className={cn(
            "text-2xl font-headings font-bold",
            isScrolled ? "text-background" : "text-primary"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Strata Noble
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors",
                isScrolled ? "text-background/80 hover:text-accent" : "text-primary/80 hover:text-accent"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.a>
          ))}
          <motion.a
            href="#contact"
            className={cn(
              buttonVariants({ size: 'sm', variant: 'default' }),
              "bg-accent text-background hover:bg-accent/90"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.a>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className={cn(
            "md:hidden p-2 transition-colors",
            isScrolled ? "text-background/80 hover:text-accent" : "text-primary/80 hover:text-accent"
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="absolute top-20 left-0 right-0 bg-primary/95 backdrop-blur-md border-t border-background/10 md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Container className="py-4">
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="text-background/80 hover:text-accent transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                  <motion.a
                    href="#contact"
                    className={cn(
                      buttonVariants({ variant: 'default' }),
                      "bg-accent text-background hover:bg-accent/90"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.a>
                </nav>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
};
