import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('Processing provision request for event:', event.type)

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object
      const customerId = subscription.customer
      const subscriptionId = subscription.id

      // Get customer details from Stripe event
      const customerEmail = subscription.metadata?.email || event.data.object.customer_email
      const customerName = subscription.metadata?.name || 'Unknown'
      
      // Determine tier based on price
      const priceId = subscription.items.data[0]?.price?.id
      let tier = 'lite' // default
      
      if (priceId === 'price_live_456') tier = 'growth'
      else if (priceId === 'price_live_789') tier = 'partner'

      // Create client record
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          stripe_customer_id: customerId,
          tier: tier,
          status: 'active'
        })
        .select()
        .single()

      if (clientError) {
        console.error('Error creating client:', clientError)
        throw clientError
      }

      // Create subscription record
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          client_id: client.id,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        throw subscriptionError
      }

      // Initialize onboarding status
      const { error: onboardingError } = await supabaseAdmin
        .from('onboarding_status')
        .insert({
          client_id: client.id,
          has_airtable: false,
          has_geniuslink: false,
          welcome_email_sent: false,
        })

      if (onboardingError) {
        console.error('Error creating onboarding status:', onboardingError)
        throw onboardingError
      }

      // Perform onboarding tasks
      const onboardingResults = await performOnboarding(client.id, customerEmail, customerName, tier)

      // Update onboarding status
      const { error: updateError } = await supabaseAdmin
        .from('onboarding_status')
        .update({
          has_airtable: onboardingResults.airtableSuccess,
          has_geniuslink: onboardingResults.geniuslinkSuccess,
          welcome_email_sent: onboardingResults.emailSuccess,
        })
        .eq('client_id', client.id)

      if (updateError) {
        console.error('Error updating onboarding status:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          message: 'Client provisioned successfully',
          client_id: client.id,
          tier: tier,
          onboarding: onboardingResults,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Event type not handled', event_type: event.type }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in provision function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function performOnboarding(clientId: string, email: string, name: string, tier: string) {
  const results = {
    airtableSuccess: false,
    geniuslinkSuccess: false,
    emailSuccess: false,
  }

  // Clone Airtable base (mock implementation)
  try {
    console.log(`Cloning Airtable base for client ${clientId}`)
    // TODO: Implement actual Airtable API call to clone base
    results.airtableSuccess = true
  } catch (error) {
    console.error('Error cloning Airtable base:', error)
  }

  // Create Geniuslink group (mock implementation)
  try {
    console.log(`Creating Geniuslink group for client ${clientId}`)
    // TODO: Implement actual Geniuslink API call to create group
    results.geniuslinkSuccess = true
  } catch (error) {
    console.error('Error creating Geniuslink group:', error)
  }

  // Send welcome email via Postmark
  try {
    const postmarkToken = Deno.env.get('POSTMARK_API_TOKEN')
    if (postmarkToken) {
      const emailResponse = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': postmarkToken,
        },
        body: JSON.stringify({
          From: 'noreply@stratanable.com',
          To: email,
          Subject: `Welcome to Strata Noble - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
          HtmlBody: generateWelcomeEmail(name, tier),
          MessageStream: 'outbound',
        }),
      })

      if (emailResponse.ok) {
        results.emailSuccess = true
        console.log(`Welcome email sent to ${email}`)
      } else {
        console.error('Error sending welcome email:', await emailResponse.text())
      }
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }

  return results
}

function generateWelcomeEmail(name: string, tier: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Strata Noble!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for subscribing to our <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</strong>.</p>
        <p>We're setting up your account and you'll receive additional emails with:</p>
        <ul>
          <li>Access to your personalized dashboard</li>
          <li>Your Airtable base with tracking templates</li>
          <li>Geniuslink affiliate management setup</li>
          <li>Next steps to maximize your revenue</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Strata Noble Team</p>
      </body>
    </html>
  `
}