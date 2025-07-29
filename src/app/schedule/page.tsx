'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock available time slots - in a real app, this would come from a calendar API
  const availableSlots = [
    { id: '1', date: 'Monday, Jan 6', time: '10:00 AM - 11:00 AM EST', value: '2025-01-06-10:00' },
    { id: '2', date: 'Monday, Jan 6', time: '2:00 PM - 3:00 PM EST', value: '2025-01-06-14:00' },
    { id: '3', date: 'Tuesday, Jan 7', time: '9:00 AM - 10:00 AM EST', value: '2025-01-07-09:00' },
    { id: '4', date: 'Tuesday, Jan 7', time: '11:00 AM - 12:00 PM EST', value: '2025-01-07-11:00' },
    { id: '5', date: 'Wednesday, Jan 8', time: '1:00 PM - 2:00 PM EST', value: '2025-01-08-13:00' },
    { id: '6', date: 'Wednesday, Jan 8', time: '3:00 PM - 4:00 PM EST', value: '2025-01-08-15:00' },
    { id: '7', date: 'Thursday, Jan 9', time: '10:00 AM - 11:00 AM EST', value: '2025-01-09-10:00' },
    { id: '8', date: 'Friday, Jan 10', time: '2:00 PM - 3:00 PM EST', value: '2025-01-10-14:00' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) return;

    setIsSubmitting(true);

    try {
      // TODO: Send scheduling request to API
      // console.log('Discovery session scheduled for:', selectedTime);
      
      // Show success message and redirect
      alert('Perfect! Your discovery session has been scheduled. You&#39;ll receive a calendar invite shortly.');
      router.push('/');
    } catch {
      // console.error('Error scheduling session:', _error);
      alert('There was an error scheduling your session. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Schedule Your Free Discovery Session</h1>
          <p className="mb-6 text-gray-600">
            Choose a time that works best for you. We&#39;ll send you a calendar invite with all the details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Available Time Slots *
              </label>
              <div className="space-y-3">
                {availableSlots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTime === slot.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot.value}
                      checked={selectedTime === slot.value}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{slot.date}</div>
                      <div className="text-sm text-gray-600">{slot.time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What to Expect:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 60-minute strategic consultation</li>
                <li>• Analysis of your current business challenges</li>
                <li>• Actionable recommendations you can implement immediately</li>
                <li>• Discussion of how we might work together (no pressure)</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!selectedTime || isSubmitting}
              className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </span>
              ) : (
                'Schedule My Discovery Session'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🗓️ You&#39;ll receive a calendar invite with Zoom details</p>
            <p className="mt-1">Need to reschedule? Just reply to the calendar invite.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
