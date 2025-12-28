// Force dynamic rendering for all vault pages to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
