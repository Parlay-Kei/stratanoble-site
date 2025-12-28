import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for campaigns (for MVP)
// In production, this would use a database
const campaigns: any[] = [];

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    campaigns,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCampaign = {
      id: `camp_${Date.now()}`,
      name: body.name,
      campaign_type: body.campaign_type || 'internet',
      status: 'draft',
      total_leads: body.leads?.length || 0,
      called: 0,
      qualified: 0,
      leads: body.leads || [],
      calling_hours: body.calling_hours || { start: '09:00', end: '17:00' },
      scheduled_start: body.scheduled_start,
      created_at: new Date().toISOString(),
    };
    
    campaigns.push(newCampaign);
    
    return NextResponse.json({
      success: true,
      campaign: newCampaign,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create campaign',
    }, { status: 500 });
  }
}
