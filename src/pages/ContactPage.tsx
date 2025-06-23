import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Container, AnimatedText, AnimatedSection, Card } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define type for input change event
  type InputChangeEvent = {
    target: {
      name: string;
      value: string;
    };
  };

  // Define type for form submit event
  type FormSubmitEvent = {
    preventDefault: () => void;
  };

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement form submission logic here
    // Form data will be processed here

    setIsSubmitting(false);
    setFormData(initialFormData);
  };

  return (
    <div className="min-h-screen pt-20 bg-background">
      <Container className="py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <AnimatedText
            as="h1"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            Contact Us
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-primary/80 leading-relaxed">
            Get in touch with our team to discuss how we can help transform your business with our
            AI and traditional services.
          </AnimatedText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <AnimatedSection delay={0.2}>
            <Card className="p-6">
              <h2 className="text-2xl font-headings font-semibold text-primary mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-start space-x-4">
                  <EnvelopeIcon className="h-6 w-6 text-accent mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-medium text-primary">Email</h3>
                    <a
                      href="mailto:contact@stratanoble.com"
                      className="text-accent hover:text-accent/80 transition-colors"
                      tabIndex={0}
                      aria-label="Send us an email at contact@stratanoble.com"
                    >
                      contact@stratanoble.com
                    </a>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="flex items-start space-x-4">
                  <PhoneIcon className="h-6 w-6 text-accent mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-medium text-primary">Phone</h3>
                    <a
                      href="tel:+1234567890"
                      className="text-accent hover:text-accent/80 transition-colors"
                      tabIndex={0}
                      aria-label="Call us at +1 (234) 567-890"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="flex items-start space-x-4">
                  <MapPinIcon className="h-6 w-6 text-accent mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-medium text-primary">Location</h3>
                    <p className="text-primary/80">
                      123 Business Avenue
                      <br />
                      Suite 456
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection delay={0.4}>
            <Card className="p-6">
              <h2 className="text-2xl font-headings font-semibold text-primary mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary/80 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      'w-full px-4 py-2 rounded-md border border-primary/10',
                      'bg-background text-primary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                      'transition-colors'
                    )}
                    aria-label="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary/80 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      'w-full px-4 py-2 rounded-md border border-primary/10',
                      'bg-background text-primary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                      'transition-colors'
                    )}
                    aria-label="Your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-primary/80 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={cn(
                      'w-full px-4 py-2 rounded-md border border-primary/10',
                      'bg-background text-primary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                      'transition-colors'
                    )}
                    aria-label="Your phone number (optional)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-primary/80 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={cn(
                      'w-full px-4 py-2 rounded-md border border-primary/10',
                      'bg-background text-primary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                      'transition-colors'
                    )}
                    aria-label="Your message"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full py-3 px-6 rounded-md font-medium',
                    'bg-accent text-white',
                    'hover:bg-accent/90',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors'
                  )}
                  aria-label={isSubmitting ? 'Submitting form...' : 'Submit contact form'}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </Card>
          </AnimatedSection>
        </div>
      </Container>
    </div>
  );
};
