import { logger } from './logger';
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

interface LeadSyncData {
  email: string;
  firstName?: string;
  lastName?: string;
  source: 'contact_form' | 'discovery_form' | 'payment' | 'newsletter';
  serviceType?: string;
  tier?: string;
  amount?: number;
}

export async function syncLead(data: LeadSyncData): Promise<boolean> {
  try {
    const response = await fetch('/api/leads/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTERNAL_API_TOKEN || ''}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logger.info('Lead sync initiated successfully', { email: data.email, source: data.source });
      return true;
    } else {
      logger.warn('Lead sync failed', { 
        email: data.email, 
        source: data.source,
        error: result.message 
      });
      return false;
    }
  } catch (error) {
    logger.error('Lead sync request failed', error instanceof Error ? error : new Error(String(error)), { 
      email: data.email, 
      source: data.source 
    });
    return false;
  }
}

export async function syncContactFormLead(
  email: string, 
  firstName?: string, 
  lastName?: string,
  serviceType?: string
): Promise<boolean> {
  return syncLead({
    email,
    firstName,
    lastName,
    source: 'contact_form',
    serviceType,
  });
}

export async function syncDiscoveryLead(
  email: string,
  firstName?: string,
  serviceType?: string
): Promise<boolean> {
  return syncLead({
    email,
    firstName,
    source: 'discovery_form',
    serviceType,
  });
}

export async function syncPaymentLead(
  email: string,
  tier: string,
  amount: number,
  firstName?: string
): Promise<boolean> {
  return syncLead({
    email,
    firstName,
    source: 'payment',
    tier,
    amount,
  });
}

export async function syncNewsletterLead(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<boolean> {
  return syncLead({
    email,
    firstName,
    lastName,
    source: 'newsletter',
  });
}