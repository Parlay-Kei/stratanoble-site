'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'duplicate';

export function AchieveryEarlyAccessEmbed() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goals: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/email/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          // /api/email/early-access accepts an optional `role` field; we don't
          // collect it on this embed (kept short) — `goals` is enough signal.
          goals: formData.goals.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Submission failed');
      }

      // /api/email/early-access returns success with `data.alreadySignedUp = true`
      // when the email is already on the list — surface that distinctly so the
      // user doesn't think they need to retry.
      if (data?.data?.alreadySignedUp) {
        setStatus('duplicate');
      } else {
        setStatus('success');
      }

      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(
          'event',
          'form_submit_success_achievery_early_access',
        );
      }

      setFormData({ name: '', email: '', goals: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');

      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(
          'event',
          'form_submit_error_achievery_early_access',
        );
      }
    }
  };

  return (
    <section
      id="achievery-early-access"
      className="bg-gradient-to-br from-field-sage/10 via-white to-navy-50 px-4 py-16 md:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">
              Early access
            </p>
            <h2 className="mt-3 text-2xl font-bold text-command-navy md:text-3xl">
              Get notified when ACHIEVERY opens up
            </h2>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              Free to join. We&apos;ll email you the moment your account is ready &mdash;
              no marketing drip, no sales calls.
            </p>
          </div>

          {status === 'success' || status === 'duplicate' ? (
            <div
              role="status"
              className="mt-8 rounded-2xl border border-forest-green/30 bg-field-sage/10 p-6 text-center"
            >
              <div className="text-4xl text-forest-green" aria-hidden="true">
                ✓
              </div>
              <h3 className="mt-3 text-xl font-semibold text-command-navy">
                {status === 'duplicate'
                  ? "You're already on the list."
                  : "You're on the list."}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {status === 'duplicate'
                  ? "No problem — we have your email and we'll be in touch when access opens."
                  : "We'll email you the moment access opens. Check your inbox for a confirmation."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div>
                <label
                  htmlFor="ach-name"
                  className="mb-1 block text-sm font-semibold text-command-navy"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="ach-name"
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
                  htmlFor="ach-email"
                  className="mb-1 block text-sm font-semibold text-command-navy"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="ach-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label
                  htmlFor="ach-goals"
                  className="mb-1 block text-sm font-semibold text-command-navy"
                >
                  What do you want ACHIEVERY to help you do?{' '}
                  <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="ach-goals"
                  name="goals"
                  rows={3}
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g. Track daily sales activity, stop losing weeks to vague goals."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-command-navy focus:border-forest-green focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {errorMessage || 'Something went wrong. Please try again.'}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex w-full items-center justify-center rounded-lg bg-forest-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-green/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Join the early access list'}
              </button>

              <p className="text-center text-xs text-slate-500">
                We&apos;ll never share your information. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
