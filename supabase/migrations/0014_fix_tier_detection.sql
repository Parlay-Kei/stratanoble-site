-- Update handle_stripe_event function to use actual Stripe price IDs for tier detection

CREATE OR REPLACE FUNCTION handle_stripe_event(event_data JSONB)
RETURNS JSONB AS $$
DECLARE
  event_type TEXT;
  event_id TEXT;
  subscription_data JSONB;
  customer_id TEXT;
  client_record RECORD;
  result JSONB;
BEGIN
  event_type := event_data->>'type';
  event_id := event_data->>'id';
  
  -- Log the event
  INSERT INTO stripe_event_log (event_id, type, handled)
  VALUES (event_id, event_type, FALSE)
  ON CONFLICT (event_id) DO NOTHING;
  
  -- Handle different event types
  CASE event_type
    WHEN 'customer.subscription.created' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Create or get client
      INSERT INTO clients (stripe_customer_id, tier, status)
      VALUES (customer_id, 'lite', 'active')
      ON CONFLICT (stripe_customer_id) 
      DO UPDATE SET status = 'active'
      RETURNING * INTO client_record;
      
      -- Create subscription record
      INSERT INTO subscriptions (
        client_id, 
        stripe_subscription_id, 
        status,
        current_period_start,
        current_period_end
      )
      VALUES (
        client_record.id,
        subscription_data->>'id',
        subscription_data->>'status',
        to_timestamp((subscription_data->>'current_period_start')::bigint),
        to_timestamp((subscription_data->>'current_period_end')::bigint)
      )
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end;
      
      result := jsonb_build_object('action', 'subscription_created', 'client_id', client_record.id);
      
    WHEN 'customer.subscription.updated' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Update subscription
      UPDATE subscriptions SET
        status = subscription_data->>'status',
        current_period_start = to_timestamp((subscription_data->>'current_period_start')::bigint),
        current_period_end = to_timestamp((subscription_data->>'current_period_end')::bigint)
      WHERE stripe_subscription_id = subscription_data->>'id';
      
      -- Update client tier if subscription is active and price changed
      IF subscription_data->>'status' = 'active' THEN
        SELECT c.* INTO client_record
        FROM clients c
        WHERE c.stripe_customer_id = customer_id;
        
        -- Determine tier based on actual Stripe price IDs
        IF client_record.id IS NOT NULL THEN
          UPDATE clients SET 
            tier = CASE 
              WHEN subscription_data->'items'->'data'->0->'price'->>'id' = 'price_1RsFQhGEwjQWkTx0mcFlA0Bv' THEN 'lite'
              WHEN subscription_data->'items'->'data'->0->'price'->>'id' = 'price_1RsFSGGEwjQWkTx0THs4KEKn' THEN 'growth'
              WHEN subscription_data->'items'->'data'->0->'price'->>'id' = 'price_1RsFWjGEwjQWkTx0FvgCrXva' THEN 'partner'
              ELSE 'lite'
            END
          WHERE id = client_record.id;
        END IF;
      END IF;
      
      result := jsonb_build_object('action', 'subscription_updated', 'customer_id', customer_id);
      
    WHEN 'customer.subscription.deleted' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Update client status to cancelled
      UPDATE clients SET status = 'cancelled'
      WHERE stripe_customer_id = customer_id;
      
      -- Update subscription status
      UPDATE subscriptions SET status = 'canceled'
      WHERE stripe_subscription_id = subscription_data->>'id';
      
      result := jsonb_build_object('action', 'subscription_cancelled', 'customer_id', customer_id);
      
    ELSE
      result := jsonb_build_object('action', 'unhandled', 'event_type', event_type);
  END CASE;
  
  -- Mark event as handled
  UPDATE stripe_event_log SET handled = TRUE WHERE event_id = event_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;