import { requireAuth } from '@/lib/auth-helpers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return children;
}
