// src/components/LogoutButton.tsx
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/signin'); // or wherever you want
  };

  return (
    <Button onClick={handleLogout} variant="glossy">
      Sign Out
    </Button>
  );
}