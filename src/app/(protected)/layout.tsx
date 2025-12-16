// app/(protected)/layout.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { LogoutButton } from '@/components/LogoutButton';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(); // ✅ Protects ALL pages in this folder

  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <div className="flex justify-between">
          <p>Welcome, {session.user.name}</p>
          <LogoutButton />
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}