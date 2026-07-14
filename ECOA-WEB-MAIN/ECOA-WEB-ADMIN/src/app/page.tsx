'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/painel');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-xl font-bold">Redirecionando para o Painel Administrativo...</h1>
        <p className="mt-2 text-sm text-zinc-500">Por favor, aguarde.</p>
      </div>
    </div>
  );
}
