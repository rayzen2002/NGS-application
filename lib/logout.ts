'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include',
  });

    toast("Logout realizado com sucesso")
    router.push('/');
  };

  return logout;
}
