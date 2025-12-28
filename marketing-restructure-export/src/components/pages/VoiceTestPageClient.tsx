'use client';

import { useState } from 'react';

export function VoiceTestPageClient() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const makeTestCall = async () => {
    setLoading(true);
    setStatus('Initiating call...');

    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          testName: 'StrataNoble Voice Test',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`✅ Call initiated! SID: ${data.callSid}`);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          StrataNoble Voice AI Test
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+17025551234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={makeTestCall}
            disabled={loading || !phoneNumber}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Calling...' : 'Make Test Call'}
          </button>

          {status && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm">{status}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-600 space-y-2">
          <p className="font-medium">Test Checklist:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter your phone number</li>
            <li>Click "Make Test Call"</li>
            <li>Answer the phone</li>
            <li>Have brief conversation with AI</li>
            <li>Check audio quality</li>
            <li>Verify call logs in console</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
