'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ServicesDiagnosticForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          topic: 'diagnostic',
          source: 'services-page',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Submission failed');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-forest-green/30 bg-forest-green/5 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-forest-green">Received</p>
        <p className="mt-2 text-base text-slate-700">
          We will review your note and follow up within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="diag-name" className="block text-sm font-medium text-slate-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="diag-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === 'loading'}
          className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-forest-green focus:outline-none focus:ring-1 focus:ring-forest-green disabled:opacity-50"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="diag-email" className="block text-sm font-medium text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="diag-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-forest-green focus:outline-none focus:ring-1 focus:ring-forest-green disabled:opacity-50"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="diag-message" className="block text-sm font-medium text-slate-700">
          What are you trying to fix? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="diag-message"
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === 'loading'}
          rows={4}
          className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-forest-green focus:outline-none focus:ring-1 focus:ring-forest-green disabled:opacity-50"
          placeholder="Describe the problem or bottleneck you are dealing with."
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-sm bg-forest-green px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Request a Diagnostic'}
      </button>

      <p className="text-center text-xs text-slate-500">
        No obligation. We respond within one business day.
      </p>
    </form>
  );
}
