'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useToast } from '@/components/ui/toast';

/**
 * Strata Noble – Contact Page
 *
 * Enhanced mobile-first swipe carousel with haptic feedback animations and
 * improved form validation for dark mode compatibility.
 */

const CONTACT_METHODS = [
  {
    label: 'Call Us',
    value: '702‑707‑3168',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M2.01 3.874a3 3 0 0 1 3.07-.72l3.09 1.03a3 3 0 0 1 1.98 2.55l.18 1.62a3 3 0 0 1-.83 2.46l-1.26 1.32a14 14 0 0 0 5.9 5.9l1.32-1.26a3 3 0 0 1 2.46-.83l1.62.18a3 3 0 0 1 2.55 1.98l1.03 3.09a3 3 0 0 1-.72 3.07l-.98.98a3 3 0 0 1-2.93.77c-4.57-1.33-8.28-3.87-11.1-6.69-2.83-2.82-5.36-6.53-6.7-11.1a3 3 0 0 1 .77-2.93l.98-.98Z" />
      </svg>
    ),
  },
  {
    label: 'Email Us',
    value: 'contact@stratanoble.com',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z" />
      </svg>
    ),
  },
  {
    label: 'Location',
    value: 'Las Vegas, NV',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
    ),
  },
];

function InfoCard({
  label,
  value,
  icon,
  index,
}: (typeof CONTACT_METHODS)[number] & { index: number }) {
  const shouldReduce = useReducedMotion();

  // Accessibility: determine if this card is a link
  let href: string | undefined = undefined;
  let ariaLabel = label;
  if (label === 'Call Us') {
    href = `tel:${value.replace(/[^\d+]/g, '')}`;
    ariaLabel = `Call us at ${value}`;
  } else if (label === 'Email Us') {
    href = `mailto:${value}`;
    ariaLabel = `Email us at ${value}`;
  }

  const cardContent = (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 20 }}
      animate={shouldReduce ? false : { opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      tabIndex={0}
      role={href ? 'link' : undefined}
      className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 flex flex-col items-center justify-center text-center px-6 py-8 gap-2 min-w-[85vw] max-w-xs md:min-w-0 md:w-full snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (href && (e.key === 'Enter' || e.key === ' ')) {
          window.open(href, '_self');
        }
      }}
    >
      <motion.div
        className="text-emerald-600 dark:text-emerald-400"
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-semibold text-lg text-[#003366] dark:text-slate-100">{label}</h3>
      <p className="text-sm text-slate-700 dark:text-slate-300 select-all break-words">{value}</p>
    </motion.div>
  );

  return href ? (
    <a href={href} aria-label={ariaLabel} tabIndex={-1} className="focus:outline-none">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
}

const CALENDLY_ENABLED = true;

const initialForm = {
  name: '',
  email: '',
  phone: '',
  topic: 'General Inquiry',
  message: '',
};

const initialErrors = {
  name: '',
  email: '',
  message: '',
};

type FormType = typeof initialForm;
type TouchedType = {
  name?: boolean;
  email?: boolean;
  message?: boolean;
};

function validate(form: FormType) {
  const errors = { ...initialErrors };
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email.';
  if (!form.message.trim()) errors.message = 'Message is required.';
  return errors;
}

export default function ContactPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const shouldReduce = useReducedMotion();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState<TouchedType>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  // Auto-populate form based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const service = urlParams.get('service');

    if (type === 'workshop') {
      setForm((prev) => ({ ...prev, topic: 'Workshop' }));
    } else if (type === 'consult') {
      setForm((prev) => ({ ...prev, topic: 'Consulting' }));
    }

    if (service) {
      setForm((prev) => ({
        ...prev,
        message: `I'm interested in learning more about ${service}. Please provide additional information.`,
      }));
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setActiveIdx(idx);
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name as keyof TouchedType]) {
      setErrors((errs) => ({ ...errs, ...validate({ ...form, [name]: value }) }));
    }
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((errs) => ({ ...errs, ...validate(form) }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    const validation = validate(form);
    setErrors(validation);

    if (Object.values(validation).some(Boolean)) {
      showToast({
        type: 'error',
        title: 'Form Validation Error',
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'contact',
          ...form,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setSuccess(true);
      setForm(initialForm);
      setTouched({});

      showToast({
        type: 'success',
        title: 'Message Sent Successfully!',
        message: "We'll get back to you within one business day.",
      });
    } catch (error) {
      // console.error('Form submission error:', error);

      showToast({
        type: 'error',
        title: 'Submission Failed',
        message:
          'There was a problem sending your message. Please try again or contact us directly.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Contact | Strata Noble</title>
      </Head>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#003366] to-[#50C878]/60 text-white py-16 text-center">
        <Container>
          <motion.h1
            initial={shouldReduce ? false : { opacity: 0, y: 20 }}
            animate={shouldReduce ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold leading-tight"
          >
            Let&apos;s Start Building Your Prosperity
          </motion.h1>
          <motion.p
            initial={shouldReduce ? false : { opacity: 0, y: 20 }}
            animate={shouldReduce ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-slate-200"
          >
            Questions, partnership ideas, or just curious? We&apos;re here to help you turn vision
            into viable strategy.
          </motion.p>
        </Container>
      </section>

      {/* Contact Methods */}
      <Container className="-mt-14 md:-mt-24">
        {/* desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {CONTACT_METHODS.map((m, index) => (
            <InfoCard key={m.label} {...m} index={index} />
          ))}
        </div>

        {/* mobile carousel with enhanced haptic feedback */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden scroll-smooth scroll-pl-6 scroll-pr-6"
            style={{ scrollPaddingLeft: '1.5rem', scrollPaddingRight: '1.5rem' }}
          >
            {CONTACT_METHODS.map((m, index) => (
              <InfoCard key={m.label} {...m} index={index} />
            ))}
          </div>
          {/* Edge gradient cues */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/90 dark:from-slate-900/90 to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/90 dark:from-slate-900/90 to-transparent md:hidden" />
        </div>
        {/* Enhanced dot indicators with animation */}
        <div className="flex justify-center mt-4 md:hidden">
          {CONTACT_METHODS.map((_, i) => (
            <motion.span
              key={i}
              className={clsx(
                'mx-1 h-2 w-2 rounded-full transition-all cursor-pointer',
                i === activeIdx ? 'bg-emerald-500' : 'bg-slate-500/40'
              )}
              animate={i === activeIdx ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: i * scrollRef.current.clientWidth,
                    behavior: 'smooth',
                  });
                }
              }}
            />
          ))}
        </div>
      </Container>

      {/* Contact Form */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <Container className="max-w-3xl">
          <motion.h2
            initial={shouldReduce ? false : { opacity: 0, y: 20 }}
            animate={shouldReduce ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold text-center text-[#003366] dark:text-white"
          >
            Send Us a Message
          </motion.h2>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-6 text-center text-emerald-700 dark:text-emerald-300 shadow"
              >
                ✅ Thank you! We&apos;ll get back to you within one business day.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={shouldReduce ? false : { opacity: 0, y: 20 }}
                animate={shouldReduce ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 grid grid-cols-1 gap-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name *"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                    />
                    {touched.name && errors.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="name-error"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {errors.name}
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                    />
                    {touched.email && errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="email-error"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {errors.email}
                      </motion.div>
                    )}
                  </div>
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
                />
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
                >
                  <option>General Inquiry</option>
                  <option>Consulting</option>
                  <option>Workshop</option>
                  <option>Partnership</option>
                  <option>Something Else</option>
                </select>
                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message *"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm resize-none transition-colors"
                    aria-invalid={!!errors.message}
                    aria-describedby="message-error"
                  />
                  {touched.message && errors.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      id="message-error"
                      className="mt-1 text-xs text-red-600 dark:text-red-400"
                    >
                      {errors.message}
                    </motion.div>
                  )}
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full md:w-fit mx-auto"
                    disabled={submitting || Object.values(errors).some(Boolean)}
                  >
                    {submitting ? 'Sending…' : "Let's Connect"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* Calendly Embed */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800">
        <Container className="max-w-4xl text-center">
          <h3 className="text-xl md:text-2xl font-medium text-[#003366] dark:text-white mb-8">
            Prefer to talk? Schedule a Call
          </h3>
          {CALENDLY_ENABLED ? (
            <iframe
              src="https://calendly.com/stratanoble/intro-call?hide_event_type_details=1&hide_gdpr_banner=1"
              className="w-full h-[600px] rounded-xl shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="py-12 text-lg text-slate-600 dark:text-slate-300">
              Online scheduling is coming soon. Please use the form or contact us directly.
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </>
  );
}
