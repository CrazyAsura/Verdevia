import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Queixas Globais | Antigravity Monitor',
  description: 'Monitoramento de incidentes e queixas em tempo real com transparência e performance de última geração.',
  openGraph: {
    title: 'Queixas Globais | Antigravity',
    description: 'Interface cinematográfica de monitoramento de incidentes.',
    type: 'website',
  },
};

export default function ComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
