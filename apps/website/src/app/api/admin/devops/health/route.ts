import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  uptime: number;
}

interface EnvironmentVar {
  name: string;
  configured: boolean;
  category: string;
}

interface AgentMetrics {
  autonomyLevel: number;
  tasksCompleted: number;
  tasksAutoResolved: number;
  averageResolutionTime: number;
}

export async function GET() {
  try {
    // Service health checks
    const services = await Promise.all([
      checkSupabase(),
      checkStripe(),
      checkOpenAI(),
      checkTwilio(),
      checkNetlify(),
      checkAWS()
    ]);

    // Environment variables check
    const environment = checkEnvironment();

    // Agent metrics (would come from database in production)
    const agent: AgentMetrics = {
      autonomyLevel: 75,
      tasksCompleted: 142,
      tasksAutoResolved: 107,
      averageResolutionTime: 1.8
    };

    return NextResponse.json({
      services,
      environment,
      agent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

async function checkSupabase(): Promise<ServiceHealth> {
  const start = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  try {
    if (!url) throw new Error('Missing URL');

    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      }
    });

    return {
      name: 'Supabase',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 99.9
    };
  } catch (error) {
    return {
      name: 'Supabase',
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 0
    };
  }
}

async function checkStripe(): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing key');

    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    });

    return {
      name: 'Stripe',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 99.95
    };
  } catch (error) {
    return {
      name: 'Stripe',
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 0
    };
  }
}

async function checkOpenAI(): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error('Missing key');

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return {
      name: 'OpenAI',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 99.8
    };
  } catch (error) {
    return {
      name: 'OpenAI',
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 0
    };
  }
}

async function checkTwilio(): Promise<ServiceHealth> {
  const start = Date.now();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  try {
    if (!accountSid || !authToken) throw new Error('Missing credentials');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        }
      }
    );

    return {
      name: 'Twilio',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 99.95
    };
  } catch (error) {
    return {
      name: 'Twilio',
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      uptime: 0
    };
  }
}

async function checkNetlify(): Promise<ServiceHealth> {
  const start = Date.now();

  // Netlify check is lightweight - just confirm credentials exist
  return {
    name: 'Netlify',
    status: process.env.NETLIFY_AUTH_TOKEN ? 'healthy' : 'degraded',
    responseTime: Date.now() - start,
    lastCheck: new Date().toISOString(),
    uptime: 99.99
  };
}

async function checkAWS(): Promise<ServiceHealth> {
  const start = Date.now();

  // AWS SES check - confirm credentials exist
  return {
    name: 'AWS SES',
    status: process.env.AWS_ACCESS_KEY_ID ? 'healthy' : 'degraded',
    responseTime: Date.now() - start,
    lastCheck: new Date().toISOString(),
    uptime: 99.9
  };
}

function checkEnvironment(): EnvironmentVar[] {
  const requiredVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', category: 'Database' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', category: 'Database' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', category: 'Database' },
    { name: 'STRIPE_SECRET_KEY', category: 'Payments' },
    { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', category: 'Payments' },
    { name: 'STRIPE_WEBHOOK_SECRET', category: 'Payments' },
    { name: 'OPENAI_API_KEY', category: 'AI' },
    { name: 'ELEVENLABS_API_KEY', category: 'AI' },
    { name: 'DEEPGRAM_API_KEY', category: 'AI' },
    { name: 'TWILIO_ACCOUNT_SID', category: 'Voice' },
    { name: 'TWILIO_AUTH_TOKEN', category: 'Voice' },
    { name: 'TWILIO_PHONE_NUMBER', category: 'Voice' },
    { name: 'NEXTAUTH_SECRET', category: 'Auth' },
    { name: 'NEXTAUTH_URL', category: 'Auth' },
    { name: 'GOOGLE_CLIENT_ID', category: 'Auth' }
  ];

  return requiredVars.map(v => ({
    name: v.name,
    configured: !!process.env[v.name],
    category: v.category
  }));
}
