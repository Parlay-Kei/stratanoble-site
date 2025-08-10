// DocuSign imports temporarily disabled for build
// import { ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Tabs, Recipients } from 'docusign-esign';
import { logger } from './logger';

class DocuSignService {
  private apiClient: any; // ApiClient;
  private basePath: string;
  private accountId: string;

  constructor() {
    // Temporarily disabled for build
    // this.apiClient = new ApiClient();
    this.basePath = process.env.DOCUSIGN_ENVIRONMENT === 'production' 
      ? 'https://na1.docusign.net/restapi' 
      : 'https://demo.docusign.net/restapi';
    // this.apiClient.setBasePath(this.basePath);
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
  }

  private async authenticate() {
    logger.warn('DocuSign authentication disabled for build');
    throw new Error('DocuSign service not available');
  }

  async createNDAEnvelope(
    signerEmail: string,
    signerName: string,
    clientName: string,
    documentBuffer: Buffer,
    callbackUrl: string
  ): Promise<{ envelopeId: string; redirectUrl: string }> {
    logger.warn('DocuSign envelope creation disabled for build');
    throw new Error('DocuSign service not available');
  }

  async getEnvelopeStatus(envelopeId: string): Promise<'sent' | 'delivered' | 'completed' | 'declined' | 'voided'> {
    logger.warn('DocuSign status check disabled for build');
    throw new Error('DocuSign service not available');
  }

  async getCompletedDocument(envelopeId: string): Promise<Buffer> {
    logger.warn('DocuSign document retrieval disabled for build');
    throw new Error('DocuSign service not available');
  }
}

export const docuSignService = new DocuSignService();