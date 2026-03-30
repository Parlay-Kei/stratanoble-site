'use client';

import { useState } from 'react';

const monthlyLeadsOptions = [
  { value: '0-10', label: '0-10 leads/month' },
  { value: '10-50', label: '10-50 leads/month' },
  { value: '50-100', label: '50-100 leads/month' },
  { value: '100-500', label: '100-500 leads/month' },
  { value: '500+', label: '500+ leads/month' },
];

const toolStackOptions = [
  { value: 'notion', label: 'Notion' },
  { value: 'airtable', label: 'Airtable' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'zapier', label: 'Zapier/Make' },
  { value: 'mailchimp', label: 'Mailchimp/ConvertKit' },
  { value: 'none', label: 'None - starting fresh' },
  { value: 'other', label: 'Other' },
];

const decisionTimelineOptions = [
  { value: 'ready-now', label: 'Ready Now' },
  { value: '1-2-weeks', label: '1-2 Weeks' },
  { value: '1-month', label: '1 Month' },
  { value: 'exploring', label: 'Just Exploring' },
];

export function PipelineBuildoutApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    monthlyLeadsEstimate: '',
    offerType: '',
    currentCloseProcess: '',
    toolStack: [] as string[],
    decisionTimeline: '',
    whatSuccessLooksLike: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/intake/pipeline-buildout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_success_pipeline_buildout');
      }

      setFormData({
        name: '',
        email: '',
        businessName: '',
        monthlyLeadsEstimate: '',
        offerType: '',
        currentCloseProcess: '',
        toolStack: [],
        decisionTimeline: '',
        whatSuccessLooksLike: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_error_pipeline_buildout');
      }
    }
  };

  const handleToolToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      toolStack: prev.toolStack.includes(value)
        ? prev.toolStack.filter((t) => t !== value)
        : [...prev.toolStack, value],
    }));
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">Application Received!</h3>
        <p className="text-green-700">
          We'll review your application and schedule a strategy call within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label htmlFor="monthlyLeadsEstimate" className="block text-sm font-medium mb-1">
          How many leads do you get per month? <span className="text-red-500">*</span>
        </label>
        <select
          id="monthlyLeadsEstimate"
          required
          value={formData.monthlyLeadsEstimate}
          onChange={(e) => setFormData({ ...formData, monthlyLeadsEstimate: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        >
          <option value="">Select range...</option>
          {monthlyLeadsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="offerType" className="block text-sm font-medium mb-1">
          What's your main offer/service? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="offerType"
          required
          value={formData.offerType}
          onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Wedding photography, HVAC repairs, Coaching packages"
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="currentCloseProcess" className="block text-sm font-medium mb-1">
          Describe your current process from lead to customer{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="currentCloseProcess"
          required
          value={formData.currentCloseProcess}
          onChange={(e) => setFormData({ ...formData, currentCloseProcess: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Walk us through what happens after someone shows interest..."
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          What tools are you currently using? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {toolStackOptions.map((tool) => (
            <label key={tool.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.toolStack.includes(tool.value)}
                onChange={() => handleToolToggle(tool.value)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={status === 'loading'}
              />
              <span className="text-sm">{tool.label}</span>
            </label>
          ))}
        </div>
        {formData.toolStack.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Please select at least one option</p>
        )}
      </div>

      <div>
        <label htmlFor="decisionTimeline" className="block text-sm font-medium mb-1">
          When are you looking to get started? <span className="text-red-500">*</span>
        </label>
        <select
          id="decisionTimeline"
          required
          value={formData.decisionTimeline}
          onChange={(e) => setFormData({ ...formData, decisionTimeline: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={status === 'loading'}
        >
          <option value="">Select timeline...</option>
          {decisionTimelineOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="whatSuccessLooksLike" className="block text-sm font-medium mb-1">
          What does success look like for you? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="whatSuccessLooksLike"
          required
          value={formData.whatSuccessLooksLike}
          onChange={(e) => setFormData({ ...formData, whatSuccessLooksLike: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Never lose a lead, close 30% more deals, spend less time on admin..."
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
        disabled={status === 'loading' || formData.toolStack.length === 0}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Application'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We'll review your application and schedule a strategy call within 48 hours.
      </p>
    </form>
  );
}
