-- Create triggers for SaaS tables

-- Create triggers for updated_at timestamps on SaaS tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at BEFORE UPDATE ON onboarding_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for subscription status changes (for email notifications)
CREATE OR REPLACE FUNCTION notify_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for payment failures or cancellations
  IF NEW.status IN ('past_due', 'canceled', 'unpaid') AND OLD.status != NEW.status THEN
    -- This would typically trigger an email via an external service
    -- For now, we'll just log it
    INSERT INTO email_logs (recipient, subject, template, status, metadata)
    SELECT 
      'client@email.com', -- You'd get this from client data
      'Payment Issue - Action Required',
      'payment_failed',
      'pending',
      jsonb_build_object('subscription_id', NEW.stripe_subscription_id, 'status', NEW.status)
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = NEW.client_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_status_change_trigger
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscription_status_change();