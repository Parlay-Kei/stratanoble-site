import mailchimp from '@mailchimp/mailchimp_marketing';
import { logger } from './logger';
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY!;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX!;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID!;

class MailchimpService {
  constructor() {
    mailchimp.setConfig({
      apiKey: MAILCHIMP_API_KEY,
      server: MAILCHIMP_SERVER_PREFIX, // e.g., 'us1', 'us2', etc.
    });
  }

  async addToAudience(
    email: string,
    firstName: string | null = null,
    lastName: string | null = null,
    tags: string[] = [],
    mergeFields: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const listId = MAILCHIMP_AUDIENCE_ID;
      
      const memberData = {
        email_address: email,
        status: 'subscribed' as const,
        merge_fields: {
          FNAME: firstName || '',
          LNAME: lastName || '',
          ...mergeFields,
        },
        tags: tags,
      };

      const response = await mailchimp.lists.addListMember(listId, memberData);
      
      // Check if response is successful and has the expected properties
      if ('id' in response && 'status' in response) {
        logger.info('Contact added to Mailchimp', {
          email,
          memberId: response.id,
          status: response.status
        });
      } else {
        logger.info('Contact added to Mailchimp', { email });
      }

      return true;
    } catch (error: any) {
      // Handle case where member already exists
      if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
        logger.info('Contact already exists in Mailchimp, updating', { email });
        return await this.updateContact(email, firstName, lastName, tags, mergeFields);
      }

      logger.error('Failed to add contact to Mailchimp', error instanceof Error ? error : new Error(String(error)), {
        email
      });
      return false;
    }
  }

  async updateContact(
    email: string,
    firstName: string | null = null,
    lastName: string | null = null,
    tags: string[] = [],
    mergeFields: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const listId = MAILCHIMP_AUDIENCE_ID;
      const subscriberHash = this.getSubscriberHash(email);

      const updateData = {
        merge_fields: {
          FNAME: firstName || '',
          LNAME: lastName || '',
          ...mergeFields,
        },
      };

      await mailchimp.lists.updateListMember(listId, subscriberHash, updateData);

      // Add tags if provided
      if (tags.length > 0) {
        await this.addTags(email, tags);
      }

      logger.info('Contact updated in Mailchimp', { email });
      return true;
    } catch (error: any) {
      logger.error('Failed to update contact in Mailchimp', error instanceof Error ? error : new Error(String(error)), {
        email
      });
      return false;
    }
  }

  async addTags(email: string, tags: string[]): Promise<boolean> {
    try {
      const listId = MAILCHIMP_AUDIENCE_ID;
      
      await mailchimp.lists.updateListMemberTags(listId, this.getSubscriberHash(email), {
        tags: tags.map(tag => ({ name: tag, status: 'active' as const }))
      });

      logger.info('Tags added to contact', { email, tags });
      return true;
    } catch (error: any) {
      logger.error('Failed to add tags to contact', error instanceof Error ? error : new Error(String(error)), {
        email,
        tags
      });
      return false;
    }
  }

  async createAutomationJourney(
    journeyName: string,
    fromName: string,
    replyTo: string,
    subject: string,
    content: string
  ): Promise<string | null> {
    try {
      // Note: Mailchimp API doesn't support creating automations programmatically
      // This would typically be set up manually in Mailchimp or via advanced API calls
      // For now, we'll trigger specific campaigns
      
      logger.info('Automation journey request logged', { journeyName });
      return 'manual_setup_required';
    } catch (error: any) {
      logger.error('Failed to create automation journey', error instanceof Error ? error : new Error(String(error)), {
        journeyName
      });
      return null;
    }
  }

  async triggerWelcomeSequence(email: string, firstName: string, leadSource: string): Promise<boolean> {
    try {
      // Add to main list with welcome sequence tag
      const success = await this.addToAudience(
        email,
        firstName,
        null,
        ['welcome-sequence', `source-${leadSource}`],
        {
          LEADSOURCE: leadSource,
          SIGNUPDATE: new Date().toISOString().split('T')[0]
        }
      );

      if (success) {
        logger.info('Welcome sequence triggered', { email, leadSource });
      }

      return success;
    } catch (error: any) {
      logger.error('Failed to trigger welcome sequence', error instanceof Error ? error : new Error(String(error)), {
        email,
        leadSource
      });
      return false;
    }
  }

  async triggerDiscoverySequence(email: string, firstName: string, serviceType: string): Promise<boolean> {
    try {
      const success = await this.addToAudience(
        email,
        firstName,
        null,
        ['discovery-booked', `service-${serviceType}`],
        {
          SERVICE_TYPE: serviceType,
          DISCOVERY_DATE: new Date().toISOString().split('T')[0]
        }
      );

      if (success) {
        logger.info('Discovery sequence triggered', { email, serviceType });
      }

      return success;
    } catch (error: any) {
      logger.error('Failed to trigger discovery sequence', error instanceof Error ? error : new Error(String(error)), {
        email,
        serviceType
      });
      return false;
    }
  }

  async triggerPaymentSuccessSequence(
    email: string,
    firstName: string,
    tier: string,
    amount: number
  ): Promise<boolean> {
    try {
      const success = await this.addToAudience(
        email,
        firstName,
        null,
        ['customer', `tier-${tier}`, 'payment-success'],
        {
          TIER: tier,
          PURCHASE_AMOUNT: amount,
          CUSTOMER_DATE: new Date().toISOString().split('T')[0]
        }
      );

      if (success) {
        logger.info('Payment success sequence triggered', { email, tier, amount });
      }

      return success;
    } catch (error: any) {
      logger.error('Failed to trigger payment success sequence', error instanceof Error ? error : new Error(String(error)), {
        email,
        tier,
        amount
      });
      return false;
    }
  }

  private getSubscriberHash(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  async getAudienceInfo(): Promise<any> {
    try {
      const listId = MAILCHIMP_AUDIENCE_ID;
      
      // For now, return basic info since getList might not be available
      return {
        id: listId,
        name: 'StrataNoble Audience',
        memberCount: 0, // Would need to be fetched separately
        subscribeUrlShort: `https://mailchimp.com/audience/${listId}`,
      };
    } catch (error: any) {
      logger.error('Failed to get audience info', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async removeFromAudience(email: string): Promise<boolean> {
    try {
      const listId = process.env.MAILCHIMP_AUDIENCE_ID!;
      const subscriberHash = this.getSubscriberHash(email);

      await mailchimp.lists.updateListMember(listId, subscriberHash, {
        status: 'unsubscribed'
      });

      logger.info('Contact unsubscribed from Mailchimp', { email });
      return true;
    } catch (error: any) {
      logger.error('Failed to unsubscribe contact', error instanceof Error ? error : new Error(String(error)), {
        email
      });
      return false;
    }
  }
}

export const mailchimpService = new MailchimpService();