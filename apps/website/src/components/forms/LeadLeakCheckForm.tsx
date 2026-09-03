'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  whatsBreaking: string;
}

const BUSINESS_TYPE_OPTIONS = [
  { value: 'bookkeeping', label: 'Bookkeeping firm' },
  { value: 'property-management', label: 'Property management' },
  { value: 'marketing-agency', label: 'Marketing or creative agency' },
  { value: 'insurance-agency', label: 'Insurance agency' },
  { value: 'real-estate-ops', label: 'Real estate operations team' },
  { value: 'b2b-services', label: 'Specialty B2B services' },
  { value: 'other', label: 'Other' },
];

export function LeadLeakCheckForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    businessName: '',
    businessType: '',
    whatsBreaking: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/intake/lead-leak-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          leadSource: formData.businessType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-semibold text-green-800 mb-2">We got it!</h3>
        <p className="text-green-700">Check your email for next steps.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-3 border border-slate-grey/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-void/40 disabled:cursor-not-allowed"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-3 border border-slate-grey/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-void/40 disabled:cursor-not-allowed"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
          className="w-full px-4 py-3 border border-slate-grey/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-void/40 disabled:cursor-not-allowed"
          placeholder="Your Business LLC"
        />
      </div>

      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
          What kind of business is this? <span className="text-red-500">*</span>
        </label>
        <select
          id="businessType"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
          className="w-full px-4 py-3 border border-slate-grey/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-void/40 disabled:cursor-not-allowed"
        >
          <option value="">Select a business type...</option>
          {BUSINESS_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="whatsBreaking" className="block text-sm font-medium text-gray-700 mb-2">
          What repeated office task keeps piling up? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="whatsBreaking"
          name="whatsBreaking"
          value={formData.whatsBreaking}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
          rows={4}
          className="w-full px-4 py-3 border border-slate-grey/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-void/40 disabled:cursor-not-allowed resize-none"
          placeholder="Examples: meeting notes become loose tasks, proposals take too long, client follow-up is inconsistent, SOPs live in someone's head."
        />
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Request an AI Fit Call'}
      </button>

      <p className="text-sm text-slate-grey text-center">
        Free fit check. We are looking for one task that is frequent, reviewable, and safe to improve.
      </p>
    </form>
  );
}
