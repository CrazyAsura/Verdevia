'use client';

import React, { FormEvent, useRef, useState, useEffect } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
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
