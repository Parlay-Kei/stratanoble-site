import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;

interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: {
    type: string;
    location: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
}

function getEventTypeSlugFromUrl(calendlyUrl: string): string | null {
  try {
    const url = new URL(calendlyUrl);
    const pathParts = url.pathname.split('/');
    const eventTypeIndex = pathParts.findIndex(part => part === 'event_types');
    
    if (eventTypeIndex !== -1 && pathParts[eventTypeIndex + 1]) {
      return pathParts[eventTypeIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventTypeUrl = searchParams.get('event_type_url') || 'https://calendly.com/stratanoble/side-hustle';
  
  try {
    if (!CALENDLY_TOKEN) {
      // CALENDLY_TOKEN environment variable is required
      return NextResponse.json(
        { error: 'Calendly configuration missing' },
        { status: 500 }
      );
    }
    
    // Get event type slug from URL
    const eventTypeSlug = getEventTypeSlugFromUrl(eventTypeUrl);
    
    if (!eventTypeSlug) {
      return NextResponse.json(
        { error: 'Invalid Calendly event type URL' },
        { status: 400 }
      );
    }

    // Fetch upcoming scheduled events for this event type
    const response = await fetch(
      `https://api.calendly.com/scheduled_events?event_type=${eventTypeUrl}&status=active&min_start_time=${new Date().toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${CALENDLY_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Calendly API error: response.status, response.statusText
      return NextResponse.json(
        { error: 'Failed to fetch events from Calendly' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid Calendly API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from Calendly API' },
        { status: 500 }
      );
    }
    
    const events: CalendlyEvent[] = Array.isArray(data.collection) ? data.collection : [];

    // Filter events to only include future events and format them
    const upcomingEvents = events
      .filter(event => {
        try {
          return event && event.start_time && new Date(event.start_time) > new Date();
        } catch {
          return false; // Skip invalid events
        }
      })
      .map(event => ({
        uri: event.uri || '',
        name: event.name || 'Unnamed Event',
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || { type: 'unknown', location: '' },
        invitees_counter: event.invitees_counter || { total: 0, active: 0, limit: 1 },
        available_spots: (event.invitees_counter?.limit || 1) - (event.invitees_counter?.active || 0),
      }))
      .sort((a, b) => {
        try {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        } catch {
          return 0; // Keep original order if dates are invalid
        }
      });

    return NextResponse.json({
      success: true,
      events: upcomingEvents,
      total: upcomingEvents.length,
      event_type_slug: eventTypeSlug,
    });

  } catch (error) {
    // Log the actual error for debugging
    console.error('Calendly API error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      eventTypeUrl,
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
} 