import { NextRequest, NextResponse } from 'next/server';

function getEventTypeSlugFromUrl(calendlyUrl: string): string | null {
  try {
    const url = new URL(calendlyUrl);
    const pathParts = url.pathname.split('/');
    const eventTypeIndex = pathParts.findIndex(part => part === 'event_types');
    
    if (eventTypeIndex !== -1 && pathParts[eventTypeIndex + 1]) {
      return pathParts[eventTypeIndex + 1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const calendlyUrl = searchParams.get('url');
    
    if (!calendlyUrl) {
      return NextResponse.json(
        { error: 'Calendly URL is required' },
        { status: 400 }
      );
    }

    const eventTypeSlug = getEventTypeSlugFromUrl(calendlyUrl);
    
    if (!eventTypeSlug) {
      return NextResponse.json(
        { error: 'Invalid Calendly URL format' },
        { status: 400 }
      );
    }

    // TODO: Implement actual Calendly API call to get upcoming events
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      eventTypeSlug,
      upcomingEvents: []
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
} 