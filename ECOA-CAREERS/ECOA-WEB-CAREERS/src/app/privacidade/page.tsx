'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useComplianceHistory, DocType, DocumentVersion } from '@/hooks/useComplianceHistory';
import { 
  FileText, 
  Download, 
  ChevronLeft,
  FileCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

function PrivacyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { history, getActiveVersion, isLoading } = useComplianceHistory();

  // Tab state
  const tabParam = searchParams.get('tab') as DocType;
  const currentTab: DocType = (tabParam && ['terms', 'privacy', 'cookies'].includes(tabParam)) 
    ? tabParam 
    : 'terms';

  // Selected version state (null means active version)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Reset version selection when switching tabs
  useEffect(() => {
    setSelectedVersionId(null);
  }, [currentTab]);

  if (isLoading || !history) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Carregando Documento...</p>
        </div>
      </div>
    );
  }

  // Get active version for current tab
  const activeVersion = getActiveVersion(currentTab);
  
  // Find current displayed version based on selection
  const displayedDoc: DocumentVersion | null = selectedVersionId 
    ? history[currentTab].find(v => v.id === selectedVersionId) || activeVersion
    : activeVersion;

  const handleTabChange = (tab: DocType) => {
    router.push(`/privacidade?tab=${tab}`);
  };

  const handleDownloadPdf = () => {
    if (!displayedDoc) return;
    
    showToast(`Preparando download do PDF assinado: ${displayedDoc.pdfName}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-slate-100 flex flex-col font-sans">
      
      {/* Word-like Editor Status Bar / Header */}
      <header className="h-16 bg-[#181818] border-b border-white/5 flex items-center justify-between px-4 sm:px-8 z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" /> Voltar
          </Button>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-200 hidden sm:block">
              {currentTab === 'terms' ? 'Termos_Uso.docx' : currentTab === 'privacy' ? 'Politica_Privacidade.docx' : 'Politica_Cookies.docx'}
            </h1>
          </div>
        </div>

        {/* Tab switcher: Word Menu Style */}
        <nav className="flex gap-1 sm:gap-2 bg-black/30 p-1 rounded-xl border border-white/5">
          {[
            { id: 'terms', label: 'Termos de Uso' },
            { id: 'privacy', label: 'Privacidade' },
            { id: 'cookies', label: 'Cookies' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as DocType)}
              className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                currentTab === tab.id 
                  ? 'bg-primary text-black font-black shadow-[0_0_15px_-5px_#20c997]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Action Button */}
        <div>
          {displayedDoc && (
            <Button 
              size="sm" 
              onClick={handleDownloadPdf}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider h-9 px-4 rounded-lg flex items-center gap-2 border border-white/10"
            >
              <Download size={14} /> PDF Assinado
            </Button>
          )}
        </div>
      </header>

      {/* Workspace Area: Gray background where the Word document sheet floats */}
      <div className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 md:px-8 bg-[#141414] custom-scrollbar flex flex-col items-center">
        
        {/* Document Tools Panel (Simulates top page tools) */}
        {displayedDoc && (
          <div className="w-full max-w-4xl bg-[#1c1c1c] border border-white/5 rounded-t-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Histórico de Versões:</span>
              <select
                value={displayedDoc.id}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
              >
                {history[currentTab].map(v => (
                  <option key={v.id} value={v.id} className="bg-[#1c1c1c] text-slate-200">
                    v{v.version} {v.isActive ? '(Vigente)' : '(Arquivada)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Publicado em: {new Date(displayedDoc.publishedAt).toLocaleDateString('pt-BR')}
              </span>
              
              {displayedDoc.isActive ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00ff9c] font-black tracking-widest text-[9px]">
                  Vigente
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black tracking-widest text-[9px]">
                  Arquivado
                </span>
              )}
            </div>
          </div>
        )}

        {/* The Word Page (Paper Sheet) */}
        {displayedDoc ? (
          <div className="w-full max-w-4xl bg-white text-slate-900 border-x border-b border-slate-300 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-h-[1120px] px-8 py-12 sm:px-16 sm:py-20 md:px-24 md:py-28 relative font-serif prose prose-slate">
            
            {/* Page Header Teaser (Simulates Word Page Header) */}
            <div className="absolute top-8 left-8 right-8 border-b border-slate-200 pb-2 flex justify-between text-[9px] uppercase font-sans font-bold tracking-widest text-slate-400 pointer-events-none">
              <span>ECOA - Rede Nacional de Zeladoria</span>
              <span>v{displayedDoc.version}</span>
            </div>

            {/* Document Body */}
            <div className="mt-8 text-sm sm:text-base leading-relaxed text-slate-800 georgia-text">
              <div 
                dangerouslySetInnerHTML={{ __html: displayedDoc.content }}
                className="compliance-word-preview"
              />
            </div>

            {/* Document Footer (Word Page Footer) */}
            <div className="absolute bottom-8 left-8 right-8 border-t border-slate-200 pt-2 flex justify-between text-[9px] uppercase font-sans font-bold tracking-widest text-slate-400 pointer-events-none">
              <span>Parecer Jurídico Oficial</span>
              <span>Anexo Obrigatório: {displayedDoc.pdfName}</span>
            </div>
            
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-[#1c1c1c] border border-white/5 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-bold uppercase tracking-wider">Nenhuma versão cadastrada para este documento.</p>
          </div>
        )}
        
      </div>

      <style jsx global>{`
        .georgia-text {
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .compliance-word-preview h1 {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.2;
          color: #0f172a;
          margin-bottom: 2rem;
          font-family: inherit;
          text-align: center;
        }
        .compliance-word-preview h2 {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.3;
          color: #1e293b;
          margin-top: 2.5rem;
          margin-bottom: 1.2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        .compliance-word-preview p {
          margin-bottom: 1.5rem;
          text-align: justify;
          text-indent: 2rem;
        }
        .compliance-word-preview ul, .compliance-word-preview ol {
          margin-bottom: 1.5rem;
          padding-left: 2.5rem;
        }
        .compliance-word-preview li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Carregando...</p>
        </div>
      </div>
    }>
      <PrivacyContent />
    </Suspense>
  );
}
