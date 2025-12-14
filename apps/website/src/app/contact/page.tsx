import { Metadata } from 'next';
import { ContactPageClient } from '@/components/ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact | Strata Noble',
  description: 'Get in touch with Strata Noble. We are here to help you turn vision into viable strategy.',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return <ContactPageClient />;
}
