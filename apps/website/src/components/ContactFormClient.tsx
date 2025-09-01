'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

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

export function ContactFormClient() {
  const searchParams = useSearchParams();
  const shouldReduce = useReducedMotion();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState<TouchedType>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  // Auto-populate form based on URL parameters
  useEffect(() => {
    const type = searchParams?.get('type');
    const service = searchParams?.get('service');

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
  }, [searchParams]);

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

      // Redirect to unified thanks page
      window.location.href = '/thanks?src=contact';
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 
          'There was a problem sending your message. Please try again or contact us directly.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
                className="w-full bg-white dark:bg-slate-800 text-brand-dark dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
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
                className="w-full bg-white dark:bg-slate-800 text-brand-dark dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
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
            className="w-full bg-white dark:bg-slate-800 text-brand-dark dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
          />
          <select
            name="topic"
            value={form.topic}
            onChange={handleChange}
            className="w-full bg-white dark:bg-slate-800 text-brand-dark dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm transition-colors"
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
              className="w-full bg-white dark:bg-slate-800 text-brand-dark dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm resize-none transition-colors"
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
  );
}
