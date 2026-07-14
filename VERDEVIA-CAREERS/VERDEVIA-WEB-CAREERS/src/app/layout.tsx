import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: {
    default: "VERDEVIA Careers - Vagas e candidaturas",
    template: "%s | VERDEVIA Careers"
  },
  description: "Portal publico de vagas VERDEVIA para candidatura direta, sem login de candidato e com consentimento LGPD/ANPD.",
  keywords: ["VERDEVIA", "careers", "vagas", "recrutamento", "LGPD", "ANPD", "sustentabilidade"],
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
    url: "https://VERDEVIA.org.br",
    siteName: "VERDEVIA Careers",
    title: "VERDEVIA Careers - Vagas e candidaturas",
    description: "Candidate-se a vagas VERDEVIA sem criar conta, com consentimento LGPD e retencao minima de dados.",
    images: [
      {
        url: "https://VERDEVIA.org.br/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VERDEVIA Careers",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VERDEVIA Careers - Vagas e candidaturas",
    description: "Portal publico de vagas VERDEVIA sem login para candidatos.",
    images: ["https://VERDEVIA.org.br/assets/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VERDEVIA Careers",
  },
};

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CookieConsentWidget } from "@/components/navigation/CookieConsentWidget";
import { PerformanceDetector } from "@/components/PerformanceDetector";

const schemaData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "VERDEVIA Careers",
  "url": "https://VERDEVIA.org.br",
  "description": "Portal publico de vagas VERDEVIA com candidatura direta e consentimento LGPD."
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
                  var saved = localStorage.getItem('VERDEVIA_theme');
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
            <PageTransition>
              {children}
            </PageTransition>
          </SmoothScroll>
          <CookieConsentWidget />
        </Providers>
      </body>
    </html>
  );
}



