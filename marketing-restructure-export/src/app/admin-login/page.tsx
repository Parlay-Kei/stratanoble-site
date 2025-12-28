import { redirect } from 'next/navigation'

// Force dynamic rendering since we use redirect
export const dynamic = 'force-dynamic';

// Route shim to ensure admin users land on the standard sign-in
// experience with a callback to the vault dashboard on success.
export default async function AdminLoginRedirect() {
  redirect('/auth/signin?callbackUrl=%2Fadmin%2Fvault')
}










