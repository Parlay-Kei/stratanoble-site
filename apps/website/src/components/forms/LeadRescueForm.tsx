'use client';

import { useState } from 'react';

const leadChannelOptions = [
  { value: 'social', label: 'Social Media' },
  { value: 'referrals', label: 'Referrals' },
  { value: 'ads', label: 'Paid Ads' },
  { value: 'seo', label: 'SEO/Organic' },
  { value: 'events', label: 'Events/Networking' },
  { value: 'cold-outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' },
];

const toolOptions = [
  { value: 'notion', label: 'Notion' },
  { value: 'airtable', label: 'Airtable' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'google-forms', label: 'Google Forms' },
  { value: 'other', label: 'Other' },
];

const urgencyOptions = [
  { value: 'asap', label: "ASAP - I'm losing leads now" },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'exploring', label: 'Just Exploring' },
];

export function LeadRescueForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    websiteOrIG: '',
    currentLeadChannel: '',
    currentTools: [] as string[],
    urgency: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/intake/lead-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');

      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_success_lead_rescue');
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        businessName: '',
        websiteOrIG: '',
        currentLeadChannel: '',
        currentTools: [],
        urgency: '',
        notes: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_error_lead_rescue');
      }
    }
  };

  const handleToolToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currentTools: prev.currentTools.includes(value)
        ? prev.currentTools.filter((t) => t !== value)
        : [...prev.currentTools, value],
    }));
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">Request Received!</h3>
        <p className="text-green-700">
          We'll review your submission and get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        />
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-1">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          required
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        />
      </div>

      {/* Website or IG */}
      <div>
        <label htmlFor="websiteOrIG" className="block text-sm font-medium mb-1">
          Website or Instagram
        </label>
        <input
          type="text"
          id="websiteOrIG"
          value={formData.websiteOrIG}
          onChange={(e) => setFormData({ ...formData, websiteOrIG: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://... or @handle"
          disabled={status === 'loading'}
        />
      </div>

      {/* Current Lead Channel */}
      <div>
        <label htmlFor="currentLeadChannel" className="block text-sm font-medium mb-1">
          Where do your leads come from? <span className="text-red-500">*</span>
        </label>
        <select
          id="currentLeadChannel"
          required
          value={formData.currentLeadChannel}
          onChange={(e) => setFormData({ ...formData, currentLeadChannel: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        >
          <option value="">Select one...</option>
          {leadChannelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Current Tools */}
      <div>
        <label className="block text-sm font-medium mb-2">
          What tools are you currently using? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {toolOptions.map((tool) => (
            <label key={tool.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.currentTools.includes(tool.value)}
                onChange={() => handleToolToggle(tool.value)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={status === 'loading'}
              />
              <span className="text-sm">{tool.label}</span>
            </label>
          ))}
        </div>
        {formData.currentTools.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Please select at least one tool</p>
        )}
      </div>

      {/* Urgency */}
      <div>
        <label htmlFor="urgency" className="block text-sm font-medium mb-1">
          Timeline <span className="text-red-500">*</span>
        </label>
        <select
          id="urgency"
          required
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        >
          <option value="">Select urgency...</option>
          {urgencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Anything else we should know?
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tell us about your current challenges..."
          disabled={status === 'loading'}
        />
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {errorMessage || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'loading' || formData.currentTools.length === 0}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Request Lead Rescue'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We'll respond within 24 hours to discuss next steps.
      </p>
    </form>
  );
}
