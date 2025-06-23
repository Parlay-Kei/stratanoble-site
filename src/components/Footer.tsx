import { Twitter, Linkedin, Instagram, ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/lib/ui';

const footerLinks = {
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Resources', href: '#resources' },
    { label: 'Contact', href: '#contact' },
  ],
  services: [
    { label: 'Strategy Consulting', href: '#services' },
    { label: 'Data Analytics', href: '#services' },
    { label: 'Growth Planning', href: '#services' },
    { label: 'Performance Optimization', href: '#services' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/company/strata-noble', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/stratanoble', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/stratanoble', label: 'Instagram' },
];

const contactInfo = [
  { icon: Mail, label: 'contact@stratanoble.com', href: 'mailto:contact@stratanoble.com' },
  { icon: Phone, label: '702-707-3168', href: 'tel:7027073168' },
  { icon: MapPin, label: 'Las Vegas', href: undefined },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-background/10">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <motion.a
              href="/"
              className="inline-block text-2xl font-headings font-bold text-background"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Strata Noble
            </motion.a>
            <p className="text-background/80 leading-relaxed">
              Empowering businesses with data-driven strategies for sustainable growth and success.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-accent transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-headings text-lg font-semibold text-background mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map(({ label, href }) => (
                <li key={label}>
                  <motion.a
                    href={href}
                    className="text-background/80 hover:text-accent transition-colors inline-flex items-center group"
                    whileHover={{ x: 4 }}
                  >
                    {label}
                    <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-headings text-lg font-semibold text-background mb-6">Services</h3>
            <ul className="space-y-4">
              {footerLinks.services.map(({ label, href }) => (
                <li key={label}>
                  <motion.a
                    href={href}
                    className="text-background/80 hover:text-accent transition-colors inline-flex items-center group"
                    whileHover={{ x: 4 }}
                  >
                    {label}
                    <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-headings text-lg font-semibold text-background mb-6">Contact Us</h3>
            <ul className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <motion.a
                    href={href}
                    className="text-background/80 hover:text-accent transition-colors inline-flex items-center group"
                    whileHover={{ x: 4 }}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} Strata Noble Consulting. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  className="text-background/60 hover:text-accent text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
