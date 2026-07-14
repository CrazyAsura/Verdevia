import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: { default: 'VERDEVIA Careers Admin', template: '%s | VERDEVIA Careers Admin' },
  description: 'Painel interno de recrutamento e seleção da VERDEVIA.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport = { themeColor: '#10b981', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('VERDEVIA_theme');var theme=saved||'light';document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(_){}})();` }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
