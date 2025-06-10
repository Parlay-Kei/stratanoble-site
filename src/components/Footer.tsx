import React from 'react';
import { ChevronUp, Facebook, Twitter, Linkedin, Instagram, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/utils';

const footerLinks = {
  services: [
    { name: 'Business Model Design', href: '#' },
    { name: 'Data Analytics', href: '#' },
    { name: 'Waste-OPS', href: '#' },
    { name: 'Go-to-Market Strategy', href: '#' },
  ],
  resources: [
    { name: 'Case Studies', href: '#' },
    { name: 'White Papers', href: '#' },
    { name: 'Templates', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Team', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
  { name: 'CSR Statement', href: '#' },
  { name: 'NDA Policy', href: '#' },
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

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <motion.li variants={itemVariants}>
    <a
      href={href}
      className="text-gray-400 hover:text-white transition-colors duration-200"
    >
      {children}
    </a>
  </motion.li>
);

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) => (
  <motion.div variants={itemVariants}>
    <h3 className="text-white font-bold mb-4">{title}</h3>
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-2"
    >
      {links.map((link) => (
        <FooterLink key={link.name} href={link.href}>
          {link.name}
        </FooterLink>
      ))}
    </motion.ul>
  </motion.div>
);

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 relative">
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
        >
          <motion.div variants={itemVariants}>
            <div className="text-white font-bold text-xl flex items-center mb-4">
              <ChevronUp className="w-5 h-5 mr-1 text-[#50C878]" />
              <span>Strata Noble</span>
            </div>
            <p className="text-sm opacity-75 mb-4">
              Elevating under-served entrepreneurs through data-driven strategy and hands-on
              consulting.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <FooterColumn title="Services" links={footerLinks.services} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Company" links={footerLinks.company} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mt-8 text-sm opacity-75 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="mb-4 md:mb-0">© Strata Noble Consulting 2025. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>
      </Container>

      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          buttonVariants({ size: 'icon' }),
          'fixed bottom-8 right-8 bg-[#50C878] hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
};
