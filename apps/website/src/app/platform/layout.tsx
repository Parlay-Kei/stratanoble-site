import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform | Strata Noble',
  description: 'Early access platform for pipeline infrastructure.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
