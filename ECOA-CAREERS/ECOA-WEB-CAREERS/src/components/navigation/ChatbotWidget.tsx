'use client';

import React, { FormEvent, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Send, Sparkles, User, X } from 'lucide-react';

import api from '@/services/api';

import { loadSelectedDocumentIds } from '@/services/documents.service';
type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Olá! Sou o assistente ECOA. Posso ajudar com denúncias ambientais, reciclagem, documentos e dúvidas da plataforma.',
  },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsOpen((open) => {
      const next = !open;
      if (!open) {
        window.setTimeout(() => inputRef.current?.focus(), 180);
      }
      return next;
    });
  };

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
        context:
          'Chatbot flutuante do site ECOA. Responda de forma curta, útil e em português do Brasil.',
        history: messages.slice(-6),
        documentIds: loadSelectedDocumentIds(),
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            response.data.answer ||
            'Não consegui montar uma resposta agora. Tente reformular sua pergunta.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'Não consegui falar com a IA neste momento. Verifique sua conexão ou tente novamente em instantes.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 z-[999] pointer-events-none sm:bottom-6 sm:left-6">
      <div className="pointer-events-auto flex justify-start">
        <motion.button
          type="button"
          onClick={handleToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full glass border border-white/10 bg-black/40 flex items-center justify-center text-primary shadow-2xl cursor-pointer"
          aria-label={isOpen ? 'Fechar chatbot' : 'Abrir chatbot'}
          title={isOpen ? 'Fechar chatbot' : 'Abrir chatbot'}
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto absolute bottom-16 left-0 flex max-h-[calc(100vh-9.5rem-env(safe-area-inset-bottom))] w-[calc(100vw-2rem)] max-w-80 flex-col overflow-hidden glass border border-white/10 bg-[#0c0c0cd0] backdrop-blur-2xl rounded-3xl shadow-2xl sm:h-[32rem] sm:max-h-[32rem] sm:w-96 sm:max-w-none"
          >
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">
                    Assistente ECOA
                  </h4>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    RAG Ambiental
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Fechar chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <p
                      className={`max-w-[14rem] rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-xl sm:max-w-[17rem] ${
                        isUser
                          ? 'bg-primary text-black font-bold'
                          : 'border border-white/10 bg-white/5 text-slate-200'
                      }`}
                    >
                      {message.content}
                    </p>
                    {isUser && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300">
                        <User className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
              {isSending && (
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Pensando
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Pergunte algo..."
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-600"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-black transition-opacity hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Enviar mensagem"
                  title="Enviar"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
