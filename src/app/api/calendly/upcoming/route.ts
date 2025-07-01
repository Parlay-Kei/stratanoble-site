import { NextResponse } from 'next/server';

const CALENDLY_API_BASE = 'https://api.calendly.com';

// This function extracts the event type slug from the Calendly URL
// e.g., https://calendly.com/stratanoble/side-hustle -> side-hustle
functiongetEventTypeSlugFromUrl(calendlyUrl: string): string | null {
  try {
    const path = new URL(calendlyUrl).pathname;
    // Path is like /org-slug/event-slug or /user-slug/event-slug
    // Or if it's a single-user account, it might be /event-slug if custom links are not used by org.
    // Assuming the last part of the path is the event slug.
    const parts = path.split('/').filter(part => part.length > 0);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
    return null;
  } catch (error) {
    console.error('Invalid Calendly URL:', error);
    return null;
  }
}

export async function GET() {
  const calendlyToken = process.env.CALENDLY_TOKEN;
  const orgUri = process.env.NEXT_PUBLIC_CALENDLY_ORG; // e.g., https://api.calendly.com/organizations/ORGANIZATION_UUID

  // The specific Calendly link for the workshop, defined in the spec and passed to CalendlyWidget
  // We need to get the slug from this URL to find the correct event type.
  const workshopCalendlyUrl = "https://calendly.com/stratanoble/side-hustle";
  const eventTypeSlug =getEventTypeSlugFromUrl(workshopCalendlyUrl);

  if (!calendlyToken) {
    console.error('Calendly token is not configured.');
    return NextResponse.json({ message: 'Configuration error: Calendly token missing.' }, { status: 500 });
  }
  if (!orgUri) {
    console.error('Calendly organization URI is not configured.');
    return NextResponse.json({ message: 'Configuration error: Calendly organization URI missing.' }, { status: 500 });
  }
  if (!eventTypeSlug) {
    console.error('Could not determine event type slug from workshop URL.');
    return NextResponse.json({ message: 'Configuration error: Could not determine event type slug.' }, { status: 500 });
  }

  try {
    // 1. Fetch all active event types for the organization
    const eventTypesUrl = `${CALENDLY_API_BASE}/event_types?organization=${orgUri}&active=true&count=100`; // Assuming max 100 event types
    const eventTypesResponse = await fetch(eventTypesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${calendlyToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!eventTypesResponse.ok) {
      const errorBody = await eventTypesResponse.text();
      console.error(`Failed to fetch event types: ${eventTypesResponse.status}`, errorBody);
      return NextResponse.json({ message: 'Failed to fetch event types from Calendly.', details: errorBody }, { status: eventTypesResponse.status });
    }

    const eventTypesData = await eventTypesResponse.json();
    const eventTypes = eventTypesData.collection;

    // 2. Find the specific event type by its slug
    const targetEventType = eventTypes.find((et: any) => et.slug === eventTypeSlug && et.kind === 'group');

    if (!targetEventType) {
      console.warn(`No active group event type found with slug '${eventTypeSlug}' for organization ${orgUri}.`);
      return NextResponse.json([], { status: 200 }); // No specific event type found, so no events
    }

    const targetEventTypeUri = targetEventType.uri;

    // 3. Fetch scheduled events for this specific event type
    // We also need to ensure these are for the correct organization, though event_type specific URI should handle this.
    // Adding organization param for robustness.
    const scheduledEventsUrl = `${CALENDLY_API_BASE}/scheduled_events?organization=${orgUri}&event_type=${targetEventTypeUri}&status=active&sort=start_time:asc&count=10`;

    const scheduledEventsResponse = await fetch(scheduledEventsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${calendlyToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!scheduledEventsResponse.ok) {
      const errorBody = await scheduledEventsResponse.text();
      console.error(`Failed to fetch scheduled events for ${targetEventTypeUri}: ${scheduledEventsResponse.status}`, errorBody);
      return NextResponse.json({ message: `Failed to fetch scheduled events from Calendly for ${eventTypeSlug}.`, details: errorBody }, { status: scheduledEventsResponse.status });
    }

    const scheduledEventsData = await scheduledEventsResponse.json();

    // The response contains a 'collection' of events
    return NextResponse.json(scheduledEventsData.collection || [], { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/calendly/upcoming:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error.message }, { status: 500 });
  }
}
