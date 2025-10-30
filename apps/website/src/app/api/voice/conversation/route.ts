import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  getSystemPrompt, 
  conversationHelpers, 
  extractQualificationData,
  type CampaignType 
} from '@/lib/conversation-config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Store conversation history and metadata (in production, use Redis/database)
const conversations = new Map<string, {
  messages: any[];
  campaignType: CampaignType;
  turnCount: number;
  startTime: Date;
  contactInfo: { phone?: string; email?: string };
}>();

const MAX_TURNS = 12;
const SPEECH_TIMEOUT = 3;
const VOICE = 'Polly.Matthew';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const speechResult = formData.get('SpeechResult') as string || '';
    const confidence = formData.get('Confidence') as string || '0';
    
    // Get campaign type from URL param
    const url = new URL(request.url);
    const campaignType = (url.searchParams.get('campaignType') || 'internet') as CampaignType;

    console.log(`[conversation] Call ${callSid} [${campaignType}]: User said "${speechResult}" (confidence: ${confidence})`);

    // Get or initialize conversation
    if (!conversations.has(callSid)) {
      const systemPrompt = getSystemPrompt(campaignType);
      conversations.set(callSid, {
        messages: [{ role: 'system', content: systemPrompt }],
        campaignType,
        turnCount: 0,
        startTime: new Date(),
        contactInfo: {},
      });
    }

    const conversation = conversations.get(callSid)!;
    conversation.turnCount++;

    // Check if max turns reached
    if (conversation.turnCount > MAX_TURNS) {
      console.log(`[conversation] Max turns reached for call ${callSid}`);
      
      // Extract qualification data
      const qualification = extractQualificationData(conversation.messages);
      console.log(`[conversation] Final qualification:`, qualification);

      const endTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}">Thanks so much for your time. Have a great day!</Say>
  <Hangup/>
</Response>`;

      conversations.delete(callSid);
      return new NextResponse(endTwiml, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Check if prospect wants to end call
    if (speechResult && conversationHelpers.isEndingCall(speechResult)) {
      console.log(`[conversation] Prospect ending call: ${callSid}`);

      const endTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}">No problem at all. You have a great day!</Say>
  <Hangup/>
</Response>`;

      conversations.delete(callSid);
      return new NextResponse(endTwiml, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Extract contact info if provided
    const contactInfo = conversationHelpers.extractContactInfo(speechResult);
    if (contactInfo.phone) conversation.contactInfo.phone = contactInfo.phone;
    if (contactInfo.email) conversation.contactInfo.email = contactInfo.email;

    // Add user message if they said something
    if (speechResult) {
      conversation.messages.push({ role: 'user', content: speechResult });
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversation.messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content || 
      'I apologize, I didn\'t catch that. Could you repeat?';
    
    conversation.messages.push({ role: 'assistant', content: aiResponse });

    console.log(`[conversation] AI response: "${aiResponse}"`);

    // Log token usage
    if (completion.usage) {
      console.log(`[conversation] Tokens: ${completion.usage.total_tokens}`);
    }

    // Generate TwiML with AI response and next gather
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${SPEECH_TIMEOUT}" speechTimeout="auto" action="/api/voice/conversation?campaignType=${campaignType}" method="POST">
    <Say voice="${VOICE}">${escapeXml(aiResponse)}</Say>
  </Gather>
  <Say voice="${VOICE}">Sorry, I didn't hear you. Let me try that again.</Say>
  <Redirect>/api/voice/conversation?campaignType=${campaignType}</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error: any) {
    console.error('[conversation] Error:', error.message);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}">I apologize, I encountered an error. Please try again later. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

// Initial greeting (called from main TwiML)
export async function GET(request: NextRequest) {
  const callSid = request.nextUrl.searchParams.get('CallSid') || 'unknown';
  const campaignType = (request.nextUrl.searchParams.get('campaignType') || 'internet') as CampaignType;

  console.log(`[conversation] Starting ${campaignType} conversation for call ${callSid}`);

  // Jake's natural greeting
  const greeting = "Hi, this is Jake from Data Solutions. How are you doing today?";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${SPEECH_TIMEOUT}" speechTimeout="auto" action="/api/voice/conversation?campaignType=${campaignType}" method="POST">
    <Say voice="${VOICE}">${greeting}</Say>
  </Gather>
  <Say voice="${VOICE}">Sorry, I didn't catch that. Let me try again.</Say>
  <Redirect>/api/voice/conversation?campaignType=${campaignType}</Redirect>
</Response>`;

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
