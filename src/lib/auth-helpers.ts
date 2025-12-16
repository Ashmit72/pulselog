import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';


export async function requireAuth(redirectTo: string = '/signin') {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}