import { Metadata } from 'next';
import CalendlyWidget from "@/components/CalendlyWidget";
import WaitlistFallback from "@/components/WaitlistFallback";

export const metadata: Metadata = {
  title: 'Side Hustle Workshops | Strata Noble',
  openGraph: {
    images: ['/og/workshops.png'], // Assuming /public/og/workshops.png will exist
  },
};

async function getUpcomingEvents() {
  try {
    // Construct the full URL for the API route
    // This is important for server-side components calling internal API routes
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/calendly/upcoming`, {
      cache: 'no-store', // Fetches fresh data on each request
      next: { revalidate: 600 } // Optional: revalidate data every 10 minutes
    });

    if (!res.ok) {
      console.error('Failed to fetch upcoming events:', res.status, await res.text());
      return []; // Return empty array on error to show fallback
    }
    const data = await res.json();
    return data; // This should be an array of events from Calendly
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return []; // Return empty array on error
  }
}

export default async function WorkshopsPage() {
  const events = await getUpcomingEvents();
  // Ensure events is always an array, even if the API returns something else unexpectedly
  const eventsArray = Array.isArray(events) ? events : [];

  return (
    <main className="container mx-auto py-10 min-h-screen">
      {events && events.length > 0 ? (
        <CalendlyWidget url="https://calendly.com/stratanoble/side-hustle" />
      ) : (
        <WaitlistFallback />
      )}
    </main>
  );
}