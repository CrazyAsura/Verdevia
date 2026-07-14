import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'VERDEVIA - Chatbot Inteligente',
  description: 'Assistente virtual inteligente para suporte e triagem ambiental.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} dark`}>
      <body className="font-sans antialiased bg-black text-white select-none">
        {children}
      </body>
    </html>
  );
}
