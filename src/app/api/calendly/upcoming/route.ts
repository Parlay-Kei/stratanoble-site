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
  try {
    if (!CALENDLY_TOKEN) {
      // CALENDLY_TOKEN environment variable is required
      return NextResponse.json(
        { error: 'Calendly configuration missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventTypeUrl = searchParams.get('event_type_url') || 'https://calendly.com/stratanoble/side-hustle';
    
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
    const events: CalendlyEvent[] = data.collection || [];

    // Filter events to only include future events and format them
    const upcomingEvents = events
      .filter(event => new Date(event.start_time) > new Date())
      .map(event => ({
        uri: event.uri,
        name: event.name,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        invitees_counter: event.invitees_counter,
        available_spots: event.invitees_counter.limit - event.invitees_counter.active,
      }))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return NextResponse.json({
      success: true,
      events: upcomingEvents,
      total: upcomingEvents.length,
      event_type_slug: eventTypeSlug,
    });

  } catch {
    // Error fetching Calendly events
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
} 