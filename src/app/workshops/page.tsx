import { Metadata } from 'next';
import CalendlyWidget from '@/components/CalendlyWidget';
import WaitlistFallback from '@/components/WaitlistFallback';

export const metadata: Metadata = {
  title: 'Side Hustle Workshops | Strata Noble',
  description: 'Join our live workshops to turn your passion into a profitable side hustle. Learn proven strategies from experts.',
  openGraph: {
    title: 'Side Hustle Workshops | Strata Noble',
    description: 'Join our live workshops to turn your passion into a profitable side hustle.',
    images: ['/og/workshops.png'],
  },
};

async function getUpcomingEvents() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/api/calendly/upcoming`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Failed to fetch upcoming events: response.status
      return [];
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    // Error fetching upcoming events: error
    return [];
  }
}

export default async function WorkshopsPage() {
  const events = await getUpcomingEvents();
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Side Hustle Workshops
          </h1>
          <p className="text-xl text-navy-600 max-w-3xl mx-auto">
            Join our live workshops and learn proven strategies to turn your passion into a profitable side hustle.
          </p>
        </div>
        
        {events.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <CalendlyWidget url="https://calendly.com/stratanoble/side-hustle" />
          </div>
        ) : (
          <WaitlistFallback />
        )}
      </div>
    </main>
  );
} 