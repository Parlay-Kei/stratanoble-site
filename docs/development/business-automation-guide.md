# Business Automation Guide - Strata Noble Platform

## 🤖 Overview

The Strata Noble platform includes comprehensive business automation for **contract management**, **lead nurturing**, and **document workflows** using DocuSign, Mailchimp, and AWS S3 integrations.

## 📋 System Components

### **1. NDA Digital Signature Workflow**
- **DocuSign Integration** → Embedded signing experience
- **Document Storage** → AWS S3 secure document management
- **Automated Delivery** → Email both parties when complete
- **Tier Restriction** → Growth/Partner subscribers only

### **2. Lead Nurture Automation**
- **Mailchimp Integration** → Multi-sequence email campaigns
- **Automatic Sync** → All forms sync leads to email lists
- **Segmentation** → Source-based and tier-based sequences
- **Analytics** → Track sync success and engagement

### **3. Document Management System**
- **Secure Storage** → AWS S3 with pre-signed URLs
- **Access Control** → Time-limited download links
- **Version Control** → Separate unsigned/signed document storage
- **Audit Trail** → Complete database logging

## 🔐 NDA Workflow System

### **Architecture Overview**

**Flow**: User Request → DocuSign Envelope → Embedded Signing → S3 Storage → Email Delivery

### **Implementation**

**File**: `src/lib/docusign.ts`
```typescript
class DocuSignService {
  async createNDAEnvelope(
    signerEmail: string,
    signerName: string,
    clientName: string,
    documentBuffer: Buffer,
    callbackUrl: string
  ): Promise<{ envelopeId: string; redirectUrl: string }> {
    
    // Authenticate with DocuSign
    await this.authenticate();
    
    // Create document and signer objects
    const document = {
      documentBase64: documentBuffer.toString('base64'),
      name: `Mutual NDA - ${clientName}`,
      fileExtension: 'pdf',
      documentId: '1'
    };
    
    // Create embedded signing session
    const envelopeResults = await envelopesApi.createEnvelope(
      this.accountId, 
      { envelopeDefinition }
    );
    
    const viewResults = await envelopesApi.createRecipientView(
      this.accountId,
      envelopeId,
      recipientViewRequest
    );
    
    return {
      envelopeId,
      redirectUrl: viewResults.url
    };
  }
}
```

### **Database Integration**

**NDA Model**:
```prisma
model NDA {
  id                  String    @id @default(cuid())
  userId              String
  clientEmail         String
  clientName          String
  projectDescription  String
  envelopeId          String    @unique
  status              String    // 'sent', 'delivered', 'completed'
  documentKey         String?   // S3 key for unsigned document
  signedDocumentKey   String?   // S3 key for signed document
  createdAt          DateTime  @default(now())
  completedAt        DateTime?
  
  user User @relation(fields: [userId], references: [id])
}
```

### **API Endpoints**

**Initiate NDA**: `POST /api/nda/initiate`
```typescript
export async function POST(request: NextRequest) {
  // Validate user has Growth/Partner tier
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tier: true, id: true }
  });

  if (!['growth', 'partner'].includes(user.tier)) {
    return NextResponse.json(
      { error: 'NDA feature requires Growth or Partner tier' },
      { status: 403 }
    );
  }

  // Generate and upload personalized NDA
  const ndaKey = s3Service.generateDocumentKey('nda', clientEmail, 'unsigned');
  await s3Service.uploadDocument(ndaKey, personalizedNDA);

  // Create DocuSign envelope
  const { envelopeId, redirectUrl } = await docuSignService.createNDAEnvelope(
    clientEmail,
    clientName,
    clientName,
    personalizedNDA,
    callbackUrl
  );

  // Store in database
  await prisma.nDA.create({
    data: { userId, clientEmail, clientName, envelopeId, status: 'sent' }
  });

  return NextResponse.json({ redirectUrl, envelopeId });
}
```

**Callback Handler**: `GET/POST /api/nda/callback`
- **Status Updates** → Process DocuSign completion webhooks
- **Document Retrieval** → Download signed documents from DocuSign
- **S3 Upload** → Store completed documents securely
- **Email Notification** → Send completion emails to both parties

## 📧 Lead Nurture System

### **Mailchimp Integration**

**File**: `src/lib/mailchimp.ts`
```typescript
class MailchimpService {
  async triggerWelcomeSequence(
    email: string, 
    firstName: string, 
    leadSource: string
  ): Promise<boolean> {
    
    return await this.addToAudience(
      email,
      firstName,
      null,
      ['welcome-sequence', `source-${leadSource}`],
      {
        LEADSOURCE: leadSource,
        SIGNUPDATE: new Date().toISOString().split('T')[0]
      }
    );
  }

  async triggerPaymentSuccessSequence(
    email: string,
    firstName: string,
    tier: string,
    amount: number
  ): Promise<boolean> {
    
    return await this.addToAudience(
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
  }
}
```

### **Email Sequences**

**1. Welcome Sequence** (Contact Form)
- **Day 0**: Thank you + Company overview
- **Day 2**: Case study spotlight
- **Day 5**: Discovery call invitation

**2. Discovery Sequence** (Discovery Form)
- **Immediate**: Discovery call confirmation
- **Day 1**: Preparation materials
- **Day 7**: Follow-up and next steps

**3. Customer Sequence** (Payment Success)
- **Immediate**: Welcome to tier + Dashboard access
- **Day 1**: Getting started guide
- **Week 1**: Feature spotlight and tips

### **Lead Sync API**

**File**: `src/app/api/leads/sync/route.ts`
```typescript
export async function POST(request: NextRequest) {
  // Verify internal API token
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Route to appropriate sequence
  switch (source) {
    case 'contact_form':
      success = await mailchimpService.triggerWelcomeSequence(email, firstName, 'contact_form');
      break;
    case 'payment':
      success = await mailchimpService.triggerPaymentSuccessSequence(email, firstName, tier, amount);
      break;
    // Additional sequences...
  }

  // Log sync attempt
  await prisma.leadSync.create({
    data: { email, source, success, syncedAt: new Date() }
  });
}
```

### **Form Integration**

**Automatic Lead Sync** in existing forms:
```typescript
// In contact form API route
import { syncContactFormLead } from '@/lib/lead-sync';

// After successful form submission
const nameParts = name.split(' ');
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

syncContactFormLead(email, firstName, lastName, topic).catch(syncError => {
  logger.error('Lead sync failed', { email, error: syncError });
});
```

## 📁 Document Management (AWS S3)

### **S3 Service Implementation**

**File**: `src/lib/s3.ts`
```typescript
class S3Service {
  async uploadDocument(
    key: string,
    buffer: Buffer,
    contentType: string = 'application/pdf'
  ): Promise<string> {
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        uploadedAt: new Date().toISOString(),
        service: 'strata-noble'
      }
    });

    await this.client.send(command);
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  generateDocumentKey(
    type: 'nda' | 'template' | 'signed', 
    clientEmail: string, 
    suffix?: string
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const emailHash = clientEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const suffixPart = suffix ? `_${suffix}` : '';
    
    return `documents/${type}/${timestamp}/${emailHash}${suffixPart}.pdf`;
  }
}
```

### **Security Features**
- **Encryption** → AES256 server-side encryption
- **Access Control** → Pre-signed URLs with expiration
- **Organized Storage** → Date-based folder structure
- **Metadata** → Upload tracking and service identification

## 🌍 Environment Configuration

### **DocuSign Setup**
```bash
DOCUSIGN_INTEGRATION_KEY=your_docusign_integration_key
DOCUSIGN_USER_ID=your_docusign_user_id
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id
DOCUSIGN_PRIVATE_KEY=your_base64_encoded_private_key
DOCUSIGN_ENVIRONMENT=demo # or 'production'
```

**DocuSign Developer Account Setup**:
1. **Create Integration** → Get Integration Key
2. **Generate RSA Key Pair** → For JWT authentication
3. **Configure Redirect URI** → `https://yourdomain.com/api/nda/callback`
4. **Grant Admin Consent** → For impersonation scope

### **AWS S3 Setup**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=yourdomain-documents
```

**S3 Bucket Configuration**:
1. **Create Bucket** → Private bucket with versioning
2. **IAM User** → Programmatic access with S3 permissions
3. **Bucket Policy** → Restrict access to application
4. **CORS Configuration** → Allow application domain

### **Mailchimp Setup**
```bash
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us1 # Based on account location
MAILCHIMP_AUDIENCE_ID=your_mailchimp_audience_id
```

**Mailchimp Configuration**:
1. **Create Audience** → Main lead list
2. **Generate API Key** → For programmatic access
3. **Design Email Templates** → For each sequence
4. **Set Up Automations** → Welcome, Discovery, Customer sequences

### **Internal API Security**
```bash
INTERNAL_API_TOKEN=your_secure_64_character_token
```

## 📊 Monitoring & Analytics

### **Lead Sync Tracking**
```prisma
model LeadSync {
  id          String   @id @default(cuid())
  email       String
  firstName   String?
  source      String   // 'contact_form', 'discovery_form', 'payment'
  success     Boolean  @default(false)
  syncedAt    DateTime @default(now())
}
```

### **NDA Workflow Tracking**
- **Status Updates** → Track envelope progress
- **Completion Times** → Monitor signing duration
- **Success Rates** → Track completion vs. abandonment
- **Document Storage** → Monitor S3 usage and costs

### **Email Campaign Analytics**
- **Delivery Rates** → Mailchimp delivery statistics
- **Open Rates** → Email engagement metrics
- **Click-Through Rates** → CTA performance
- **Conversion Rates** → Lead to customer conversion

## 🧪 Testing Business Automation

### **NDA Workflow Testing**
```bash
# Test NDA initiation (requires Growth/Partner user)
curl -X POST https://yourdomain.com/api/nda/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer session_token" \
  -d '{
    "clientName": "Test Client",
    "clientEmail": "client@example.com",
    "projectDescription": "Test project description"
  }'
```

### **Lead Sync Testing**
```bash
# Test lead sync (internal API)
curl -X POST https://yourdomain.com/api/leads/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${INTERNAL_API_TOKEN}" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "source": "contact_form"
  }'
```

## 🚨 Error Handling & Troubleshooting

### **Common Issues**

1. **DocuSign Authentication Errors**
   - Verify RSA private key is base64 encoded correctly
   - Check Integration Key and User ID
   - Ensure admin consent granted for impersonation

2. **S3 Upload Failures**
   - Verify AWS credentials and permissions
   - Check bucket exists and is accessible
   - Ensure proper IAM policy for S3 operations

3. **Mailchimp Sync Failures**
   - Verify API key and server prefix match account
   - Check audience ID is correct
   - Monitor rate limits (10 requests/second max)

### **Monitoring & Alerts**
- **Failed Sync Logging** → All failed operations logged to database
- **Error Notifications** → Critical failures trigger alerts
- **Performance Monitoring** → Track API response times
- **Cost Monitoring** → Monitor S3 and API usage costs

---

**Business Automation Status**: ✅ **Complete and Production Ready**  
**Next Steps**: Configure third-party API keys and test end-to-end workflows