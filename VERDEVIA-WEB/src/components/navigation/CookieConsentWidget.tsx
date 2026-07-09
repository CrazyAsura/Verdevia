'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldAlert, X, Shield, Lock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    performance: false,
    analytics: false,
  });

  useEffect(() => {
    // Verificar se já possui consentimento salvo
    const consent = localStorage.getItem('@verdevia_cookie_consent_web');
    if (!consent) {
      setVisible(true); // Exibe o widget na primeira inicialização
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleSave = (newPrefs = preferences) => {
    localStorage.setItem('@verdevia_cookie_consent_web', JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    setIsOpen(false);
    setVisible(true); // Garante que o gatilho flutuante permaneça ativo no canto
  };

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, performance: true, analytics: true };
    handleSave(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = { necessary: true, performance: false, analytics: false };
    handleSave(allRejected);
  };

  return (
    <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-[999] pointer-events-none sm:bottom-6 sm:right-6">
      
      {/* Botão Flutuante Gatilho (Sempre ativo no canto inferior direito para o usuário alterar a qualquer momento) */}
      <div className="pointer-events-auto flex justify-end">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full glass border border-white/10 bg-black/40 flex items-center justify-center text-primary shadow-2xl cursor-pointer"
        >
          <Cookie className="w-6 h-6 animate-pulse" />
        </motion.button>
      </div>

      {/* Modal/Card Configuração lateral inferior direita */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto absolute bottom-16 right-0 max-h-[calc(100vh-9.5rem-env(safe-area-inset-bottom))] w-[calc(100vw-2rem)] max-w-80 overflow-y-auto glass border border-white/10 bg-[#0c0c0cd0] backdrop-blur-2xl rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 sm:max-h-none sm:w-96 sm:max-w-none sm:p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Privacidade &amp; Cookies</h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Gerencie suas preferências de rastreamento. Os cookies essenciais garantem o funcionamento seguro do app.
            </p>

            {/* Links das Políticas */}
            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-tight text-primary">
              <Link href="/privacidade?tab=terms" className="hover:underline flex items-center gap-0.5">
                Termos <ExternalLink className="w-2.5 h-2.5" />
              </Link>
              <span className="text-white/10">•</span>
              <Link href="/privacidade?tab=privacy" className="hover:underline flex items-center gap-0.5">
                Privacidade <ExternalLink className="w-2.5 h-2.5" />
              </Link>
              <span className="text-white/10">•</span>
              <Link href="/privacidade?tab=cookies" className="hover:underline flex items-center gap-0.5">
                Cookies <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>

            {/* Switches de Preferências */}
            <div className="space-y-3 pt-2">
              
              {/* Cookies Obrigatórios */}
              <div className="flex items-center justify-between bg-white/2 border border-white/5 p-3 rounded-xl">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Necessários / Obrigatórios</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Segurança, acesso e autenticação</p>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary/20 cursor-not-allowed">
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-primary translate-x-5" />
                </div>
              </div>

              {/* Cookies de Performance */}
              <div className="flex items-center justify-between bg-white/2 border border-white/5 p-3 rounded-xl">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Cookies de Performance</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Melhoria de interface e transições fluidas</p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, performance: !p.performance }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    preferences.performance ? 'bg-primary' : 'bg-white/10'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    preferences.performance ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Cookies Analíticos */}
              <div className="flex items-center justify-between bg-white/2 border border-white/5 p-3 rounded-xl">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Cookies Analíticos</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Estatísticas anônimas de navegação</p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    preferences.analytics ? 'bg-primary' : 'bg-white/10'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleRejectAll}
                className="h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Recusar Todos
              </button>
              <button
                onClick={handleAcceptAll}
                className="h-9 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:bg-primary/95 transition-all"
              >
                Aceitar Todos
              </button>
            </div>

            <button
              onClick={() => handleSave()}
              className="w-full h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Confirmar Escolhas
            </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta Inicial (Modal tipo banner de entrada, oculto após a primeira gravação) */}
      <AnimatePresence>
        {visible && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="pointer-events-auto absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-80 glass border border-white/10 bg-black/80 backdrop-blur-md rounded-2xl p-4 shadow-xl flex gap-3 items-start"
          >
            <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-200">Preferências de Rastreamento</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Este site respeita a LGPD. Escolha como tratamos seus cookies e dados pessoais.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="text-[9px] font-black uppercase text-primary hover:underline"
                >
                  Personalizar
                </button>
                <span className="text-white/10">•</span>
                <button 
                  onClick={handleAcceptAll} 
                  className="text-[9px] font-black uppercase text-slate-200 hover:underline"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
            <button 
              onClick={() => setVisible(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
