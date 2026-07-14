'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  List,
  Save,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Trash2,
  Power,
  Edit3,
  Calendar,
  ExternalLink,
  History as HistoryIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useComplianceHistory, DocType, DocumentVersion } from '@/hooks/useComplianceHistory';
import { showToast } from '@/lib/toast';

const formatComplianceDate = (dateStr: any) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '---';
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function ComplianceDocsManager() {
  const { 
    history, 
    publishVersion, 
    activateVersion, 
    deleteVersion, 
    getActiveVersion, 
    isLoading 
  } = useComplianceHistory();

  const [activeTab, setActiveTab] = useState<DocType>('terms');
  
  // Editor form inputs
  const [editorVersion, setEditorVersion] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState('');

  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync inputs with the current active version when tab changes or history loads
  useEffect(() => {
    if (!history) return;
    const activeDoc = getActiveVersion(activeTab);
    if (activeDoc) {
      setEditorVersion(activeDoc.version);
      setEditorContent(activeDoc.content);
      setPdfFile(null); // Reset file input
      setPdfName(activeDoc.pdfName);
    } else {
      setEditorVersion('');
      setEditorContent('');
      setPdfFile(null);
      setPdfName('');
    }
    setPdfUploadError(null);
  }, [activeTab, history]);

  if (isLoading || !history) {
    return (
      <DashboardLayout title="Gestão de Documentos Legais LGPD" role="super-admin">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Carregando Histórico...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Editor rich text command simulator
  const handleEditorCommand = (command: string) => {
    showToast(`Comando de formatação [${command}] aplicado ao editor.`, 'info');
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfUploadError(null);
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        setPdfUploadError('Por favor, anexe um arquivo PDF válido.');
        return;
      }
      
      setPdfFile(file);
      setPdfName(file.name);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPdfUploadError(null);

    // Validação obrigatória do PDF
    if (!pdfName) {
      setPdfUploadError('O anexo do documento PDF jurídico assinado é OBRIGATÓRIO para salvar.');
      return;
    }

    if (!editorContent.trim() || editorContent.length < 20) {
      setPdfUploadError('O texto legal da política não pode estar em branco ou ser muito curto.');
      return;
    }

    if (!editorVersion.trim()) {
      setPdfUploadError('O código da versão é obrigatório.');
      return;
    }

    // Check if this version number already exists in history (to prevent duplicates)
    const versionExists = history[activeTab].some(v => v.version === editorVersion);
    if (versionExists) {
      const confirmOverwrite = window.confirm(`A versão v${editorVersion} já existe. Deseja criar uma nova publicação com este número de versão mesmo assim?`);
      if (!confirmOverwrite) return;
    }

    setIsSaving(true);
    
    // Simulate API Network call
    setTimeout(() => {
      publishVersion(activeTab, editorVersion, editorContent, pdfName);
      setIsSaving(false);
      setSaveSuccess(true);
      setPdfFile(null); // clear file input state
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }, 1200);
  };

  // Load an old version's contents into the editor to modify it
  const handleLoadToEditor = (doc: DocumentVersion) => {
    setEditorVersion(doc.version);
    setEditorContent(doc.content);
    setPdfFile(null);
    setPdfName(doc.pdfName);
    setPdfUploadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTypeHistory = history[activeTab] || [];

  return (
    <DashboardLayout title="Gestão de Documentos Legais LGPD" role="super-admin">
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        
        {/* Header explicativo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Políticas &amp; <span className="text-primary text-glow">Termos Jurídicos</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Publique, versione e anexe os documentos contratuais oficiais do ECOA</p>
          </div>
          
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-xs flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-bold">LGPD: Anexo de PDF Assinado Obrigatório</span>
          </div>
        </div>

        {/* Abas das Políticas */}
        <div className="flex gap-4 border-b border-white/5 pb-1">
          {[
            { id: 'terms', title: 'Termos de Uso' },
            { id: 'privacy', title: 'Política de Privacidade' },
            { id: 'cookies', title: 'Política de Cookies' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as DocType);
                setPdfUploadError(null);
              }}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider relative transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.title}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Grid de Edição */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Editor de Texto (Simulador Word) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-white/5 p-6 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest">Editor Rich-Text Jurídico</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-black uppercase">Versão:</span>
                  <input 
                    type="text" 
                    value={editorVersion} 
                    onChange={(e) => setEditorVersion(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg w-20 h-8 text-center text-xs font-bold text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="1.0.6"
                    required
                  />
                </div>
              </div>

              {/* Barra de Ferramentas Estilo Word */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-2 flex flex-wrap gap-1.5 items-center">
                <button type="button" onClick={() => handleEditorCommand('bold')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Negrito"><Bold size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('italic')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Itálico"><Italic size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('underline')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Sublinhado"><Underline size={16} /></button>
                <div className="h-6 w-[1px] bg-white/10 mx-1" />
                <button type="button" onClick={() => handleEditorCommand('heading1')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Título 1"><Heading1 size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('heading2')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Título 2"><Heading2 size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('list')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Lista Marcadores"><List size={16} /></button>
                <div className="h-6 w-[1px] bg-white/10 mx-1" />
                <button type="button" onClick={() => handleEditorCommand('align-left')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Alinhar à Esquerda"><AlignLeft size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('align-center')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Centralizar"><AlignCenter size={16} /></button>
                <button type="button" onClick={() => handleEditorCommand('align-right')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Alinhar à Direita"><AlignRight size={16} /></button>
              </div>

              {/* Área de Digitação */}
              <div className="relative flex-1">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  rows={15}
                  className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 text-sm leading-relaxed text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none font-mono"
                  placeholder="Escreva o corpo do documento legal em HTML..."
                  required
                />
              </div>
            </Card>
          </div>

          {/* Coluna Direita: Anexo de PDF Jurídico e Ações */}
          <div className="space-y-6">
            
            {/* Box Anexo PDF Jurídico */}
            <Card className="glass border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Anexo PDF Jurídico
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
                * Conforme exigido pela ANPD, anexe o parecer ou termo oficial assinado digitalmente em formato PDF.
              </p>

              {/* Drag Zone */}
              <div className="relative border border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white/2">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Upload className="w-8 h-8 text-slate-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-slate-300">Selecione o arquivo jurídico</p>
                    <p className="text-[10px] text-slate-500 mt-1">Apenas formato .pdf permitido</p>
                  </div>
                </div>
              </div>

              {/* Status do Arquivo Anexado */}
              {pdfName && (
                <div className="bg-[#00FF9C]/5 border border-[#00FF9C]/20 p-4 rounded-xl flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{pdfName}</p>
                    <p className="text-[9px] text-[#00FF9C] uppercase font-black tracking-widest mt-0.5">PDF Pronto para Vínculo</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Ações de Salvar */}
            <Card className="glass border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest border-b border-white/5 pb-3">Ações de Publicação</h3>

              {pdfUploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex gap-2 items-start animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{pdfUploadError}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 text-black uppercase font-black tracking-widest text-xs h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-5px_#20c997]"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} /> Publicar Nova Versão
                  </>
                )}
              </Button>

              <div className="text-[10px] text-slate-500 leading-relaxed text-center font-medium">
                Publicar cria uma nova versão na lista abaixo, salvando em localStorage e ativando-a imediatamente como a vigente.
              </div>
            </Card>

            {/* Alerta de Sucesso Animado */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex gap-3 text-primary"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight">Publicado com Sucesso!</h4>
                    <p className="text-[10px] text-slate-400 mt-1">A nova versão do documento de conformidade foi inserida no histórico local.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </form>

        {/* HISTÓRICO DE VERSÕES (NOVO REQUISITO) */}
        <Card className="glass border-white/5 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-primary" /> Histórico de Versões Publicadas
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">
              Todas as versões salvas para o documento selecionado. Ative ou delete conforme a necessidade jurídica.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px] h-10">
                  <th className="pb-3 pr-4">Versão</th>
                  <th className="pb-3 pr-4">Anexo PDF Jurídico</th>
                  <th className="pb-3 pr-4">Data de Publicação</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentTypeHistory.map((version) => (
                  <tr 
                    key={version.id} 
                    className={`border-b border-white/5 h-12 hover:bg-white/2 transition-colors ${
                      version.isActive ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="font-bold text-primary pr-4">v{version.version}</td>
                    <td className="pr-4 max-w-[200px] truncate">
                      <span className="flex items-center gap-1.5 text-slate-300" title={version.pdfName}>
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {version.pdfName}
                      </span>
                    </td>
                    <td className="text-slate-400 pr-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        {formatComplianceDate(version.publishedAt)}
                      </span>
                    </td>
                    <td className="pr-4">
                      {version.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00ff9c] font-black text-[8px] uppercase tracking-wider">
                          Vigente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[8px] uppercase tracking-wider">
                          Arquivado
                        </span>
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleLoadToEditor(version)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                        title="Carregar no Editor"
                      >
                        <Edit3 size={14} />
                      </button>
                      
                      {!version.isActive && (
                        <button
                          type="button"
                          onClick={() => activateVersion(activeTab, version.id)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-500 hover:text-[#00ff9c] transition-all"
                          title="Ativar Versão como Vigente"
                        >
                          <Power size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Tem certeza de que deseja deletar permanentemente a versão v${version.version}?`)) {
                            deleteVersion(activeTab, version.id);
                          }
                        }}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-red-400 transition-all"
                        title="Excluir Versão"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {currentTypeHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      Nenhuma versão registrada para este documento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
