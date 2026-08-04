'use client';

import { useState } from 'react';

const leadChannelOptions = [
  { value: 'text', label: 'Text' },
  { value: 'dm', label: 'DM (Instagram / Facebook / etc.)' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'form', label: 'Website form' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

const trackerOptions = [
  { value: 'none', label: 'None' },
  { value: 'notes', label: 'Notes app' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'crm', label: 'HubSpot or other CRM' },
  { value: 'notion-airtable', label: 'Notion / Airtable' },
  { value: 'mix', label: 'Mix of tools' },
];

const loudestProblemOptions = [
  { value: 'missed-follow-up', label: 'Missed follow-up' },
  { value: 'no-tracker', label: 'No customer tracker' },
  { value: 'crm-mess', label: 'CRM is a mess' },
  { value: 'unclear-workflow', label: 'Unclear workflow' },
  { value: 'automation-fuzzy', label: 'Want automation but process is fuzzy' },
  { value: 'ops-dashboard', label: 'Need a simple ops dashboard' },
  { value: 'not-sure', label: 'Not sure' },
];

const firstResponseOptions = [
  { value: 'me-only', label: 'Me only' },
  { value: 'me-and-team', label: 'Me + team' },
  { value: 'no-owner', label: 'No clear owner' },
];

const openLeadsOptions = [
  { value: '0-5', label: '0-5' },
  { value: '6-20', label: '6-20' },
  { value: '21-plus', label: '21+' },
  { value: 'unknown', label: 'I honestly do not know' },
];

const timelineOptions = [
  { value: 'this-week', label: 'This week' },
  { value: 'next-2-weeks', label: 'Next 2 weeks' },
  { value: 'this-month', label: 'This month' },
  { value: 'exploring', label: 'Just exploring' },
];

const budgetOptions = [
  { value: 'under-250', label: 'Under $250' },
  { value: '250-1500', label: '$250-$1,500' },
  { value: '1500-5000', label: '$1,500-$5,000' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const revenueOptions = [
  { value: 'under-10k', label: 'Under $10k / month' },
  { value: '10k-40k', label: '$10k-$40k / month' },
  { value: '40k-100k', label: '$40k-$100k / month' },
  { value: '100k-plus', label: '$100k+ / month' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

type FormState = {
  name: string;
  businessName: string;
  email: string;
  phoneOrLinkedIn: string;
  whatYouSell: string;
  revenueRange: string;
  leadChannels: string[];
  currentTracker: string;
  loudestProblem: string;
  firstResponseOwner: string;
  openLeadsAware: string;
  winIn30Days: string;
  timeline: string;
  budgetComfort: string;
  notes: string;
};

const emptyForm: FormState = {
  name: '',
  businessName: '',
  email: '',
  phoneOrLinkedIn: '',
  whatYouSell: '',
  revenueRange: '',
  leadChannels: [],
  currentTracker: '',
  loudestProblem: '',
  firstResponseOwner: '',
  openLeadsAware: '',
  winIn30Days: '',
  timeline: '',
  budgetComfort: '',
  notes: '',
};

const fieldClass =
  'w-full px-3 py-2 border border-slate-grey/30 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-forest-green';

export function BusinessSystemsIntakeForm() {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChannelToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      leadChannels: prev.leadChannels.includes(value)
        ? prev.leadChannels.filter((c) => c !== value)
        : [...prev.leadChannels, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    if (formData.leadChannels.length === 0) {
      setStatus('error');
      setErrorMessage('Select at least one lead channel.');
      return;
    }

    try {
      const res = await fetch('/api/intake/business-systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
      setFormData(emptyForm);

      if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
          'event',
          'form_submit_success_business_systems'
        );
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-forest-green/10 border border-forest-green/30 rounded-lg p-6 text-center">
        <div className="text-3xl mb-3 text-forest-green" aria-hidden>
          ✓
        </div>
        <h3 className="text-xl font-semibold text-command-navy mb-2">Thanks. I got your intake.</h3>
        <p className="text-sm text-slate-grey leading-relaxed">
          I will review how work enters and where it stalls, then reply with a recommended starting
          point (Audit, Fix, or Buildout) or a no-fit note. If urgent, reply to the confirmation
          email with ASAP and your loudest problem in one sentence.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="bsi-name" className="block text-sm font-medium mb-1">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="bsi-name"
          type="text"
          required
          maxLength={100}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-business" className="block text-sm font-medium mb-1">
          Business name <span className="text-red-500">*</span>
        </label>
        <input
          id="bsi-business"
          type="text"
          required
          maxLength={200}
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-email" className="block text-sm font-medium mb-1">
          Best email <span className="text-red-500">*</span>
        </label>
        <input
          id="bsi-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-contact" className="block text-sm font-medium mb-1">
          Best phone or LinkedIn URL
        </label>
        <input
          id="bsi-contact"
          type="text"
          maxLength={300}
          value={formData.phoneOrLinkedIn}
          onChange={(e) => setFormData({ ...formData, phoneOrLinkedIn: e.target.value })}
          className={fieldClass}
          placeholder="Optional"
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-sell" className="block text-sm font-medium mb-1">
          What do you sell / deliver? <span className="text-red-500">*</span>
        </label>
        <input
          id="bsi-sell"
          type="text"
          required
          maxLength={300}
          value={formData.whatYouSell}
          onChange={(e) => setFormData({ ...formData, whatYouSell: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-revenue" className="block text-sm font-medium mb-1">
          Rough monthly revenue range
        </label>
        <select
          id="bsi-revenue"
          value={formData.revenueRange}
          onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Optional</option>
          {revenueOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2">
          Where do most new leads arrive? <span className="text-red-500">*</span>
        </legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {leadChannelOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.leadChannels.includes(o.value)}
                onChange={() => handleChannelToggle(o.value)}
                className="w-4 h-4 rounded border-slate-grey/30 text-forest-green focus:ring-forest-green"
                disabled={status === 'loading'}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="bsi-tracker" className="block text-sm font-medium mb-1">
          What is your current tracker (if any)? <span className="text-red-500">*</span>
        </label>
        <select
          id="bsi-tracker"
          required
          value={formData.currentTracker}
          onChange={(e) => setFormData({ ...formData, currentTracker: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {trackerOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-problem" className="block text-sm font-medium mb-1">
          Which problem is loudest right now? <span className="text-red-500">*</span>
        </label>
        <select
          id="bsi-problem"
          required
          value={formData.loudestProblem}
          onChange={(e) => setFormData({ ...formData, loudestProblem: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {loudestProblemOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-owner" className="block text-sm font-medium mb-1">
          Who owns first response today? <span className="text-red-500">*</span>
        </label>
        <select
          id="bsi-owner"
          required
          value={formData.firstResponseOwner}
          onChange={(e) => setFormData({ ...formData, firstResponseOwner: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {firstResponseOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-open" className="block text-sm font-medium mb-1">
          How many open leads/quotes are you aware of right now?{' '}
          <span className="text-red-500">*</span>
        </label>
        <select
          id="bsi-open"
          required
          value={formData.openLeadsAware}
          onChange={(e) => setFormData({ ...formData, openLeadsAware: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {openLeadsOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-win" className="block text-sm font-medium mb-1">
          What does a win look like in 30 days? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bsi-win"
          required
          maxLength={1000}
          rows={3}
          value={formData.winIn30Days}
          onChange={(e) => setFormData({ ...formData, winIn30Days: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="bsi-timeline" className="block text-sm font-medium mb-1">
          Timeline to start <span className="text-red-500">*</span>
        </label>
        <select
          id="bsi-timeline"
          required
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {timelineOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-budget" className="block text-sm font-medium mb-1">
          Budget comfort for a starting engagement
        </label>
        <select
          id="bsi-budget"
          value={formData.budgetComfort}
          onChange={(e) => setFormData({ ...formData, budgetComfort: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        >
          <option value="">Optional</option>
          {budgetOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bsi-notes" className="block text-sm font-medium mb-1">
          Anything else I should know?
        </label>
        <textarea
          id="bsi-notes"
          maxLength={2000}
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={fieldClass}
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {errorMessage || 'Something went wrong. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || formData.leadChannels.length === 0}
        className="w-full bg-forest-green text-white px-6 py-3 rounded-md font-semibold hover:bg-forest-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Business Systems Intake'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        About 4 minutes. No passwords. No tool logins.
      </p>
    </form>
  );
}
