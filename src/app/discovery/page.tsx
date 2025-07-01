'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DiscoveryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessStage: '',
    mainChallenge: '',
    interestedTier: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send email to user and alert admin
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    // Redirect to scheduling or checkout based on tier
    if (formData.interestedTier === 'none') {
      router.push('/schedule'); // calendar page for free discovery
    } else {
      router.push(`/checkout?tier=${formData.interestedTier}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Free Discovery Session</h1>
          <p className="mb-6 text-gray-600">
            Tell us a bit about yourself so we can tailor your session to your specific needs and goals.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="businessStage" className="block text-sm font-medium text-gray-700 mb-2">
                Stage of Business *
              </label>
              <select
                id="businessStage"
                name="businessStage"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.businessStage}
                onChange={handleChange}
              >
                <option value="">Select your business stage</option>
                <option value="idea">Just an idea</option>
                <option value="early">Early-stage startup</option>
                <option value="established">Established business</option>
              </select>
            </div>

            <div>
              <label htmlFor="mainChallenge" className="block text-sm font-medium text-gray-700 mb-2">
                Main Challenge *
              </label>
              <textarea
                id="mainChallenge"
                name="mainChallenge"
                placeholder="What's your biggest challenge right now? The more specific, the better we can help."
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.mainChallenge}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="interestedTier" className="block text-sm font-medium text-gray-700 mb-2">
                Interest Level *
              </label>
              <select
                id="interestedTier"
                name="interestedTier"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.interestedTier}
                onChange={handleChange}
              >
                <option value="">Select your interest level</option>
                <option value="none">Just want the discovery session (free)</option>
                <option value="lite">Interested in Lite Package ($1,200)</option>
                <option value="core">Interested in Core Package ($2,500)</option>
                <option value="premium">Interested in Premium Package ($5,000)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Submit & Continue
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Your information is secure and will never be shared.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
