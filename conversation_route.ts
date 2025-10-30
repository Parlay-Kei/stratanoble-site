import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  getConversationConfig,
  analyzeConversation,
  conversationHelpers,
  type QualificationScore,
} from '@/lib/conversation-config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Store conversation history and metadata (in production, use Redis/database)
const conversations = new Map<string, {
  messages: any[];
  campaignType: string;
  turnCount: number;
  startTime: Date;
  contactInfo: {
    name?: string;
    phone?: string;
    email?: string;
  };
}>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const speechResult = formData.get('SpeechResult') as string || '';
    const confidence = formData.get('Confidence') as string || '0';
    const campaignType = formData.get('campaignType') as string || 'internet';

    console.log(`[conversation] Call ${callSid}: User said "${speechResult}" (confidence: ${confidence})`);

    // Get or initialize conversation
    if (!conversations.has(callSid)) {
      const config = getConversationConfig(campaignType as any);
      conversations.set(callSid, {
        messages: [{
          role: 'system',
          content: config.systemPrompt,
        }],
        campaignType,
        turnCount: 0,
        startTime: new Date(),
        contactInfo: {},
      });
    }

    const conversation = conversations.get(callSid)!;
    const config = getConversationConfig(campaignType as any);
    conversation.turnCount++;

    // Check if conversation should end
    if (conversation.turnCount > config.maxTurns) {
      console.log(`[conversation] Max turns reached for call ${callSid}`);
      
      // Analyze conversation for qualification
      const qualification = analyzeConversation(conversation.messages);
      console.log(`[conversation] Qualification: ${JSON.stringify(qualification)}`);

      const endTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${config.voice}">Thanks so much for your time. Have a great day!</Say>
  <Hangup/>
</Response>`;

      conversations.delete(callSid);
      return new NextResponse(endTwiml, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Check if prospect wants to end call early
    if (speechResult && conversationHelpers.isEndingCall(speechResult)) {
      console.log(`[conversation] Prospect ending call early: ${callSid}`);

      const endTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${config.voice}">No problem at all. You have a great day!</Say>
  <Hangup/>
</Response>`;

      conversations.delete(callSid);
      return new NextResponse(endTwiml, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Extract contact info if provided
    const phone = conversationHelpers.extractPhone(speechResult);
    const email = conversationHelpers.extractEmail(speechResult);
    if (phone) conversation.contactInfo.phone = phone;
    if (email) conversation.contactInfo.email = email;

    // Add user message if they said something
    if (speechResult) {
      conversation.messages.push({ role: 'user', content: speechResult });
    }

    // Get AI response with enhanced config
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversation.messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    const aiResponse = completion.choices[0].message.content || 
      'I apologize, I didn\'t catch that. Could you repeat?';
    
    conversation.messages.push({ role: 'assistant', content: aiResponse });

    console.log(`[conversation] AI response: "${aiResponse}"`);

    // Log token usage
    if (completion.usage) {
      console.log(`[conversation] Tokens: ${completion.usage.total_tokens} (prompt: ${completion.usage.prompt_tokens}, completion: ${completion.usage.completion_tokens})`);
    }

    // Generate TwiML with AI response and next gather
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${config.speechTimeout}" speechTimeout="auto" action="/api/voice/conversation?campaignType=${campaignType}" method="POST">
    <Say voice="${config.voice}">${escapeXml(aiResponse)}</Say>
  </Gather>
  <Say voice="${config.voice}">Sorry, I didn't hear you. Let me try that again.</Say>
  <Redirect>/api/voice/conversation?campaignType=${campaignType}</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error: any) {
    console.error('[conversation] Error:', error.message);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">I apologize, I encountered an error. Please try again later. Goodbye.</Say>
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
  const campaignType = request.nextUrl.searchParams.get('campaignType') || 'internet';

  console.log(`[conversation] Starting ${campaignType} conversation for call ${callSid}`);

  const config = getConversationConfig(campaignType as any);

  // Extract first greeting from system prompt (or use default)
  const greeting = "Hi, this is Jake from Data Solutions. How are you doing today?";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${config.speechTimeout}" speechTimeout="auto" action="/api/voice/conversation?campaignType=${campaignType}" method="POST">
    <Say voice="${config.voice}">${greeting}</Say>
  </Gather>
  <Say voice="${config.voice}">Sorry, I didn't catch that. Let me try again.</Say>
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
