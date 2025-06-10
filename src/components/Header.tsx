import { Menu, X, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { Disclosure } from '@headlessui/react';

const navigation = [
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Resources', href: '#resources' },
  { name: 'Contact Us', href: '#contact' },
];

export const Header = () => {
  return (
    <Disclosure as="header" className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 shadow-sm z-50">
      {({ open }) => (
        <>
          <Container className="py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <div className="text-[#003366] font-bold text-xl flex items-center">
                  <ChevronUp className="w-5 h-5 mr-1 text-[#50C878]" />
                  <span>Strata Noble</span>
                </div>
              </motion.div>

              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      item.name === 'Contact Us'
                        ? buttonVariants({ variant: 'default', size: 'sm' })
                        : 'text-gray-600 hover:text-[#003366] transition-colors'
                    )}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </nav>

              <Disclosure.Button className="md:hidden text-gray-600 hover:text-[#003366] focus:outline-none">
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Disclosure.Button>
            </div>
          </Container>

          <AnimatePresence>
            {open && (
              <Disclosure.Panel
                static
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden bg-white border-t"
              >
                <Container className="py-4">
                  <div className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={cn(
                          'block py-2',
                          item.name === 'Contact Us'
                            ? buttonVariants({ variant: 'default', size: 'sm' })
                            : 'text-gray-600 hover:text-[#003366]'
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </Container>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
};
