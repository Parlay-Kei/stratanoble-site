import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { sendValidationEmail } from '@/lib/send-validation-email';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ValidationResult {
  marketSize: string;
  competition: string;
  opportunity: string;
  targetCustomer: string;
  priceRange: string;
  startupCosts: string;
  timeToFirstSale: string;
  viabilityScore: number; // 0-100
  quickWins: string[];
  challenges: string[];
  nextSteps: string[];
}

async function analyzeIdea(idea: string): Promise<ValidationResult> {
  const prompt = `You are a business consultant analyzing a new business idea. Provide a realistic, data-driven assessment.

Business Idea: "${idea}"

Analyze this idea and respond with a JSON object (no markdown formatting) containing:
{
  "marketSize": "Brief description of market size (e.g., '$2.3B pet treat industry')",
  "competition": "Level of competition and key competitors (e.g., 'Moderate - 847 Etsy sellers, 12 major brands')",
  "opportunity": "Key opportunity or gap (e.g., 'Premium organic segment growing 23%/year')",
  "targetCustomer": "Ideal customer profile (e.g., 'Pet owners 25-45, income $75K+')",
  "priceRange": "Recommended pricing (e.g., '$12-18 per unit')",
  "startupCosts": "Estimated initial investment (e.g., '$500-1,500')",
  "timeToFirstSale": "Realistic timeline (e.g., '2-3 weeks')",
  "viabilityScore": 75,
  "quickWins": ["3-5 specific, actionable first steps"],
  "challenges": ["3-5 realistic challenges they'll face"],
  "nextSteps": ["3-5 immediate action items"]
}

Be realistic, encouraging but honest. Focus on actionable insights.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an experienced business consultant who provides realistic, actionable advice to aspiring entrepreneurs. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      marketSize: 'Market analysis in progress',
      competition: 'Competition research pending',
      opportunity: 'Opportunity analysis being generated',
      targetCustomer: 'Customer profiling in progress',
      priceRange: 'Pricing analysis pending',
      startupCosts: '$500-2,000 (estimated)',
      timeToFirstSale: '4-6 weeks (estimated)',
      viabilityScore: 70,
      quickWins: [
        'Research 3-5 competitors in your space',
        'Create a basic business plan outline',
        'Identify your first 10 potential customers',
      ],
      challenges: [
        'Building initial customer base',
        'Standing out from competition',
        'Managing startup costs',
      ],
      nextSteps: [
        'Sign up for a free account to get full analysis',
        'Join our community of builders',
        "Watch our 'Getting Started' video series",
      ],
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = String(body?.idea || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    if (email && !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI validation service not configured' },
        { status: 503 }
      );
    }

    const analysis = await analyzeIdea(idea);

    if (email && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error: dbError } = await supabase.from('leads').insert({
          email,
          idea,
          source: 'homepage_hero',
          metadata: {
            analysis,
            viability_score: analysis.viabilityScore,
          },
          created_at: new Date().toISOString(),
        });

        if (dbError) {
          console.error('Supabase error:', dbError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    if (email && process.env.SENDGRID_API_KEY) {
      try {
        await sendValidationEmail({ email, idea, analysis });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    return NextResponse.json({ success: true, analysis, message: 'Idea validated successfully' });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate idea. Please try again.' },
      { status: 500 }
    );
  }
}