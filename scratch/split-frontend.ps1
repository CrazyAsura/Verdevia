# PowerShell script to split VERDEVIA-WEB into MAIN, ADMIN and CHATBOT frontends

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$SRC_WEB = Join-Path $ROOT "VERDEVIA-WEB"

$MAIN_DEST = Join-Path $ROOT "VERDEVIA-WEB-MAIN"
$ADMIN_DEST = Join-Path $ROOT "VERDEVIA-WEB-ADMIN"
$CHATBOT_DEST = Join-Path $ROOT "VERDEVIA-WEB-CHATBOT"

function Ensure-CleanDir($path) {
  if (Test-Path $path) {
    Remove-Item -Path $path -Recurse -Force | Out-Null
  }
  New-Item -ItemType Directory -Path $path -Force | Out-Null
}

Write-Host "Splitting Next.js Web Frontend into 3 modules..." -ForegroundColor Cyan

# ── 1. Create and Copy to WEB-MAIN ────────────────────────────────────────────
Write-Host "Creating VERDEVIA-WEB-MAIN..." -ForegroundColor Yellow
Ensure-CleanDir $MAIN_DEST
Copy-Item -Path "$SRC_WEB/*" -Destination $MAIN_DEST -Recurse -Force

# Delete admin directories in MAIN
$mainApp = Join-Path $MAIN_DEST "src/app"
$adminDirs = @("administrador", "super-administrador", "super-prestadores", "superadmin", "prestadores", "painel")
foreach ($dir in $adminDirs) {
  $target = Join-Path $mainApp $dir
  if (Test-Path $target) {
    Remove-Item -Path $target -Recurse -Force | Out-Null
  }
}

# ── 2. Create and Copy to WEB-ADMIN ───────────────────────────────────────────
Write-Host "Creating VERDEVIA-WEB-ADMIN..." -ForegroundColor Yellow
Ensure-CleanDir $ADMIN_DEST
Copy-Item -Path "$SRC_WEB/*" -Destination $ADMIN_DEST -Recurse -Force

# Delete public directories in ADMIN
$adminApp = Join-Path $ADMIN_DEST "src/app"
$publicDirs = @("autenticacao", "baixar", "download", "planos", "perguntas-frequentes", "privacidade", "privacy", "sobre", "suporte", "support", "servicos", "denuncias")
foreach ($dir in $publicDirs) {
  $target = Join-Path $adminApp $dir
  if (Test-Path $target) {
    Remove-Item -Path $target -Recurse -Force | Out-Null
  }
}

# Replace landing page in ADMIN with a redirect to panel
$adminPage = Join-Path $adminApp "page.tsx"
$adminRedirectContent = @'
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
'@
Set-Content -Path $adminPage -Value $adminRedirectContent -Force


# ── 3. Create and Copy to WEB-CHATBOT ─────────────────────────────────────────
Write-Host "Creating VERDEVIA-WEB-CHATBOT..." -ForegroundColor Yellow
Ensure-CleanDir $CHATBOT_DEST
Copy-Item -Path "$SRC_WEB/*" -Destination $CHATBOT_DEST -Recurse -Force

# Delete everything except layout/globals/icons in CHATBOT
$chatApp = Join-Path $CHATBOT_DEST "src/app"
$allDirs = @("administrador", "super-administrador", "super-prestadores", "superadmin", "prestadores", "painel", "autenticacao", "baixar", "download", "planos", "perguntas-frequentes", "privacidade", "privacy", "sobre", "suporte", "support", "servicos", "denuncias")
foreach ($dir in $allDirs) {
  $target = Join-Path $chatApp $dir
  if (Test-Path $target) {
    Remove-Item -Path $target -Recurse -Force | Out-Null
  }
}

# Replace layout.tsx in CHATBOT to remove headers/footers/chatbot widgets
$chatLayout = Join-Path $chatApp "layout.tsx"
$chatLayoutContent = @'
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
'@
Set-Content -Path $chatLayout -Value $chatLayoutContent -Force

# Create full screen immersive AI chat in page.tsx of CHATBOT
$chatPage = Join-Path $chatApp "page.tsx"
$chatPageContent = @'
'use client';

import React, { FormEvent, useRef, useState, useEffect } from 'react';
import { Bot, Loader2, Send, Sparkles, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { loadSelectedDocumentIds } from '@/services/documents.service';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Olá! Sou o assistente virtual da VERDEVIA. Como posso ajudar você hoje com reciclagem, denúncias ou suporte?',
  },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setInput('');
    setIsSending(true);
    setMessages((current) => [...current, { role: 'user', content: question }]);

    try {
      const response = await api.post<{ answer?: string }>('/ai/chat', {
        message: question,
        context: 'Interface cheia imersiva do chatbot VERDEVIA. Responda detalhadamente e em português do Brasil.',
        history: messages.slice(-10),
        documentIds: loadSelectedDocumentIds(),
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.data.answer || 'Não consegui formular uma resposta adequada. Pode perguntar de outra forma?',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Ocorreu um erro ao comunicar com os servidores de IA. Verifique sua conexão e tente novamente.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 bg-zinc-900/50 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Assistente VERDEVIA</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Online · RAG Triagem IA</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl w-full mx-auto">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400 border border-white/5 shadow-md">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-xl ${
                    isUser
                      ? 'bg-emerald-500 text-black font-semibold rounded-tr-none'
                      : 'bg-zinc-900 text-zinc-100 border border-white/5 rounded-tl-none'
                  }`}
                >
                  {message.content}
                </div>
                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black shadow-md font-bold text-xs">
                    U
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Form */}
      <footer className="border-t border-white/5 bg-zinc-900/20 p-4 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida sobre reciclagem, denúncias..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-black transition-all hover:bg-emerald-400 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:scale-100 cursor-pointer shadow-lg"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </footer>
    </div>
  );
}
'@
Set-Content -Path $chatPage -Value $chatPageContent -Force

Write-Host "Frontend split completed successfully!" -ForegroundColor Green
