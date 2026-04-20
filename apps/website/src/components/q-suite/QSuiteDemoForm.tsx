'use client';

import { useState } from 'react';
import { withCsrfHeaders } from '@/lib/csrf-client';

type Status = 'idle' | 'loading' | 'success' | 'error';

const MIN_MESSAGE_LENGTH = 10;

export function QSuiteDemoForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // /api/contact's ContactFormSchema does not have a businessName field, so
    // fold it into the message body to preserve context for the sales team
    // without requiring a schema migration.
    const composedMessage = formData.businessName
      ? `Business: ${formData.businessName.trim()}\n\n${formData.message.trim()}`
      : formData.message.trim();

    try {
      const init = await withCsrfHeaders({
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          topic: 'qsuite-demo',
          source: 'qsuite-page',
          message: composedMessage,
        }),
      });

      const res = await fetch('/api/contact', init);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || data?.message || 'Submission failed. Please try again.',
        );
      }

      setStatus('success');

      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(
          'event',
          'form_submit_success_qsuite_demo',
        );
      }

      setFormData({ name: '', email: '', businessName: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');

      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(
          'event',
          'form_submit_error_qsuite_demo',
        );
      }
    }
  };

  return (
    <section
      id="qsuite-demo"
      className="border-t border-slate-200 bg-slate-50 px-4 py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-command-navy md:text-3xl">
            Request a Q SUITE walkthrough
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Tell us what your business does and where it leaks. We&apos;ll set up a 30-minute
            walkthrough of the modules that map to your workflow &mdash; no slide decks,
            real screens.
          </p>
        </div>

        {status === 'success' ? (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-forest-green/30 bg-field-sage/10 p-8 text-center"
          >
            <div className="text-4xl text-forest-green" aria-hidden="true">
              ✓
            </div>
            <h3 className="mt-3 text-xl font-semibold text-command-navy">
              Request received.
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;ll reach out within one business day to schedule the walkthrough.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="qs-name"
                  className="mb-1 block text-sm font-semibold text-command-navy"
                >
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  id="qs-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label
                  htmlFor="qs-email"
                  className="mb-1 block text-sm font-semibold text-command-navy"
                >
                  Work email <span className="text-red-500">*</span>
                </label>
                <input
                  id="qs-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="qs-business"
                className="mb-1 block text-sm font-semibold text-command-navy"
              >
                Business name <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="qs-business"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label
                htmlFor="qs-message"
                className="mb-1 block text-sm font-semibold text-command-navy"
              >
                What are you trying to fix? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="qs-message"
                name="message"
                required
                minLength={MIN_MESSAGE_LENGTH}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="e.g. Leads are coming in but follow-up is dropping. We want CRM + booking + SMS to actually talk to each other."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                disabled={status === 'loading'}
              />
              <p className="mt-1 text-xs text-slate-500">
                Two or three sentences is enough. The more concrete, the better the demo.
              </p>
            </div>

            {status === 'error' && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {errorMessage || 'Something went wrong. Please try again.'}
              </div>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                We&apos;ll respond within one business day. No automated drip sequences.
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center rounded-lg bg-command-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-command-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Request walkthrough'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
