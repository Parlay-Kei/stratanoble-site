import { NextRequest, NextResponse } from 'next/server';
import { docuSignService } from '@/lib/docusign';
import { s3Service } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const event = url.searchParams.get('event');
  const envelopeId = url.searchParams.get('envelopeId');

  if (!envelopeId) {
    return NextResponse.redirect('/dashboard?nda_error=missing_envelope');
  }

  try {
    // Get envelope status from DocuSign
    const status = await docuSignService.getEnvelopeStatus(envelopeId);

    // Update database record
    await prisma.nDA.update({
      where: { envelopeId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      }
    });

    if (status === 'completed') {
      // Download the completed document
      const signedDocument = await docuSignService.getCompletedDocument(envelopeId);
      
      // Upload signed document to S3
      const ndaRecord = await prisma.nDA.findUnique({
        where: { envelopeId },
        select: { clientEmail: true, clientName: true, user: { select: { email: true } } }
      });

      if (ndaRecord) {
        const signedKey = s3Service.generateDocumentKey('signed', ndaRecord.clientEmail, 'completed');
        const signedUrl = await s3Service.uploadDocument(signedKey, signedDocument);

        // Update database with signed document location
        await prisma.nDA.update({
          where: { envelopeId },
          data: { signedDocumentKey: signedKey }
        });

        // Send completion emails to both parties
        await sendCompletionEmails(
          ndaRecord.user.email,
          ndaRecord.clientEmail,
          ndaRecord.clientName,
          signedUrl
        );

        logger.info('NDA completion processed successfully', {
          envelopeId,
          clientEmail: ndaRecord.clientEmail
        });
      }

      return NextResponse.redirect('/dashboard?nda_success=completed');
    }

    if (status === 'declined') {
      return NextResponse.redirect('/dashboard?nda_error=declined');
    }

    return NextResponse.redirect('/dashboard?nda_status=' + status);

  } catch (error) {
    logger.error(
      'NDA callback processing failed',
      error instanceof Error ? error : new Error(String(error)),
      { envelopeId }
    );
    return NextResponse.redirect('/dashboard?nda_error=processing_failed');
  }
}

// Also handle POST requests for webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envelopeId, status } = body;

    if (!envelopeId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update database record
    await prisma.nDA.update({
      where: { envelopeId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      }
    });

    if (status === 'completed') {
      // Process completion similar to GET handler
      const signedDocument = await docuSignService.getCompletedDocument(envelopeId);
      
      const ndaRecord = await prisma.nDA.findUnique({
        where: { envelopeId },
        select: { clientEmail: true, clientName: true, user: { select: { email: true } } }
      });

      if (ndaRecord) {
        const signedKey = s3Service.generateDocumentKey('signed', ndaRecord.clientEmail, 'completed');
        await s3Service.uploadDocument(signedKey, signedDocument);

        await prisma.nDA.update({
          where: { envelopeId },
          data: { signedDocumentKey: signedKey }
        });

        await sendCompletionEmails(
          ndaRecord.user.email,
          ndaRecord.clientEmail,
          ndaRecord.clientName,
          s3Service.generateDocumentKey('signed', ndaRecord.clientEmail, 'completed')
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('NDA webhook processing failed', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function sendCompletionEmails(
  userEmail: string,
  clientEmail: string,
  clientName: string,
  documentUrl: string
) {
  try {
    const downloadUrl = await s3Service.getSignedDownloadUrl(documentUrl, 86400); // 24 hours

    // Email to the user (service provider)
    const userSubject = `NDA Completed - ${clientName}`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">NDA Completed</h1>
        </div>
        
        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Great news! The mutual NDA with <strong>${clientName}</strong> has been completed and signed by both parties.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" 
               style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Download Signed NDA
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            This download link will expire in 24 hours. You can also access the document from your dashboard.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2025 Strata Noble. All rights reserved.</p>
        </div>
      </div>
    `;

    // Email to the client
    const clientSubject = `NDA Completed - Strata Noble`;
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">NDA Completed</h1>
        </div>
        
        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${clientName},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for completing the mutual non-disclosure agreement with Strata Noble. Both parties have now signed the document.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" 
               style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Download Signed NDA
            </a>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We're excited to move forward with our potential collaboration under the protection of this agreement.
          </p>

          <p style="color: #666; font-size: 14px;">
            This download link will expire in 24 hours. Please save a copy for your records.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2025 Strata Noble. All rights reserved.</p>
        </div>
      </div>
    `;

    await Promise.all([
      sendEmail(userEmail, userSubject, userHtml),
      sendEmail(clientEmail, clientSubject, clientHtml)
    ]);

    logger.info('NDA completion emails sent', { userEmail, clientEmail });
  } catch (error) {
    logger.error('Failed to send NDA completion emails', error instanceof Error ? error : new Error(String(error)), { userEmail, clientEmail });
  }
}