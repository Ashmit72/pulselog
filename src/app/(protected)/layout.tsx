// app/(protected)/layout.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { LogoutButton } from '@/components/LogoutButton';
import Image from 'next/image';

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
          <div className='flex items-center justify-between gap-4' >
             <Image
              src={session.user.image || '/default-pp.png'}
              alt="Profile Picture"
              width={40}
              height={40}
              className="rounded-full"
            />
          <LogoutButton />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}