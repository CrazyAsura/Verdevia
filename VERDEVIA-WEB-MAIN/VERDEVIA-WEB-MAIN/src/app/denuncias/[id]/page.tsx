'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ComplaintsService from '@/services/complaints.service';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  
  const { data: item, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => ComplaintsService.getComplaint(String(id)),
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center uppercase font-black animate-pulse">Carregando Detalhes...</div>;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-32 px-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 break-words">{item?.type}</h1>
        <p className="text-xl text-muted-foreground italic mb-8 break-words">{item?.description}</p>
        <div className="glass p-8 border-white/5">
            <p className="uppercase text-xs font-bold text-primary mb-2">Metadata</p>
            <pre className="text-[10px] opacity-50 whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
