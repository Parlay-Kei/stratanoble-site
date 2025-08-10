import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { docuSignService } from '@/lib/docusign';
import { s3Service } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const initiateNDASchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Valid email is required'),
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = initiateNDASchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { clientName, clientEmail, projectDescription } = validation.data;

    // Check if user has permission to create NDAs
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tier: true, id: true }
    });

    if (!user || !['growth', 'partner'].includes(user.tier || '')) {
      return NextResponse.json(
        { error: 'NDA feature requires Growth or Partner tier subscription' },
        { status: 403 }
      );
    }

    // Generate NDA document from template
    const ndaTemplate = await s3Service.getDocument('templates/mutual_nda_template.pdf');
    
    // Create personalized NDA (in a real implementation, you'd use a PDF library to fill in fields)
    const personalizedNDA = ndaTemplate; // Placeholder - would need PDF manipulation

    // Upload personalized NDA to S3
    const ndaKey = s3Service.generateDocumentKey('nda', clientEmail, 'unsigned');
    await s3Service.uploadDocument(ndaKey, personalizedNDA);

    // Create DocuSign envelope
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/nda/callback`;
    const { envelopeId, redirectUrl } = await docuSignService.createNDAEnvelope(
      clientEmail,
      clientName,
      clientName,
      personalizedNDA,
      callbackUrl
    );

    // Store NDA record in database
    const ndaRecord = await prisma.nDA.create({
      data: {
        userId: user.id,
        clientEmail,
        clientName,
        projectDescription,
        envelopeId,
        status: 'sent',
        documentKey: ndaKey,
        createdAt: new Date(),
      }
    });

    logger.info('NDA initiation successful', {
      userId: user.id,
      clientEmail,
      envelopeId,
      ndaId: ndaRecord.id
    });

    return NextResponse.json({
      success: true,
      envelopeId,
      redirectUrl,
      ndaId: ndaRecord.id,
      message: 'NDA sent successfully'
    });

  } catch (error) {
    logger.error('NDA initiation failed', { error });
    
    if (error instanceof Error) {
      if (error.message.includes('DocuSign')) {
        return NextResponse.json(
          { error: 'Failed to create signing session' },
          { status: 502 }
        );
      }
      if (error.message.includes('S3') || error.message.includes('upload')) {
        return NextResponse.json(
          { error: 'Failed to process document' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}