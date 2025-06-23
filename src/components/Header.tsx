import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Container, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';
import Logo from './Logo';

const navItems = [
  { label: 'AI Services', href: '/ai-services' },
  { label: 'About', href: '/about' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Traditional Services', href: '/traditional-services' },
  { label: 'Contact', href: '/contact' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="flex items-center justify-between h-20">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <Logo size={120} />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={item.href}
                className={cn(
                  'transition-colors',
                  isScrolled
                    ? 'text-background/80 hover:text-accent'
                    : 'text-primary/80 hover:text-accent',
                  location.pathname === item.href && 'text-accent font-medium'
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ size: 'sm', variant: 'default' }),
                'bg-accent text-background hover:bg-accent/90'
              )}
            >
              Book Call
            </Link>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className={cn(
            'md:hidden p-2 transition-colors',
            isScrolled
              ? 'text-background/80 hover:text-accent'
              : 'text-primary/80 hover:text-accent'
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
                    <motion.div key={item.href} whileHover={{ x: 8 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to={item.href}
                        className={cn(
                          'text-background/80 hover:text-accent transition-colors py-2 block',
                          location.pathname === item.href && 'text-accent font-medium'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/contact"
                      className={cn(
                        buttonVariants({ variant: 'default' }),
                        'bg-accent text-background hover:bg-accent/90'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Book Call
                    </Link>
                  </motion.div>
                </nav>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
};
