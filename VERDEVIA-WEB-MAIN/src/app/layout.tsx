import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import { ActivityTracker } from "@/components/ActivityTracker";

export const metadata: Metadata = {
  title: {
    default: "Verdevia - Inteligência urbana comunitária",
    template: "%s | Verdevia"
  },
  description: "Plataforma de zeladoria inteligente para registrar evidências, priorizar incidentes urbanos e aproximar comunidades, operadores e gestão pública.",
  keywords: ["verdevia", "zeladoria", "inteligência urbana", "reclamação urbana", "cidadania", "segurança", "brasil"],
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://verdevia.org.br",
    siteName: "Verdevia",
    title: "Verdevia - Inteligência urbana comunitária",
    description: "Registre evidências, acompanhe ocorrências locais e transforme relatos comunitários em decisões operacionais.",
    images: [
      {
        url: "https://verdevia.org.br/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Verdevia Plataforma Comunitária",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdevia - Inteligência urbana comunitária",
    description: "Plataforma de zeladoria, evidências e coordenação comunitária no Brasil.",
    images: ["https://verdevia.org.br/assets/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verdevia",
  },
};

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Dock } from "@/components/navigation/Dock";
import { CookieConsentWidget } from "@/components/navigation/CookieConsentWidget";
import { ChatbotWidget } from "@/components/navigation/ChatbotWidget";
import { PerformanceDetector } from "@/components/PerformanceDetector";

const schemaData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Verdevia",
  "url": "https://verdevia.org.br",
  "description": "Plataforma de zeladoria, evidências e coordenação comunitária no Brasil.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://verdevia.org.br/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('verdevia_theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (_) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.dataset.theme = 'dark';
                  document.documentElement.style.colorScheme = 'dark';
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        <PerformanceDetector />
        
        {/* Cinematic Background Layer */}
        <div className="fixed inset-0 -z-50 mesh-gradient grain pointer-events-none" />

        <Providers>
          <SmoothScroll>
            <ActivityTracker />
            <PageTransition>
              {children}
            </PageTransition>
          </SmoothScroll>
          <Dock />
          <ChatbotWidget />
          <CookieConsentWidget />
        </Providers>
      </body>
    </html>
  );
}



