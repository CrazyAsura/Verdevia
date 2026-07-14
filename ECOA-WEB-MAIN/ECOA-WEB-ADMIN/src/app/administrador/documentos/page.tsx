'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Database, FileText, Loader2, RefreshCw, UploadCloud } from 'lucide-react';

import DashboardLayout from '@/components/DashboardLayout';
import {
  KnowledgeDocument,
  listKnowledgeDocuments,
  loadSelectedDocumentIds,
  saveSelectedDocumentIds,
  uploadKnowledgeDocuments,
} from '@/services/documents.service';

const ACCEPTED_TYPES = '.pdf,.docx,.xlsx,.xls,.xlsm,.pptx,.csv,.pbit,.pbix,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.md,.markdown,.txt';

export default function KnowledgeLibraryPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listKnowledgeDocuments();
      setDocuments(result.documents);
      setSelectedIds(loadSelectedDocumentIds());
    } catch {
      setError('Não foi possível carregar a biblioteca de conhecimento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listKnowledgeDocuments()
      .then((result) => {
        if (!active) return;
        setDocuments(result.documents);
        setSelectedIds(loadSelectedDocumentIds());
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar a biblioteca de conhecimento.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedCount = useMemo(
    () => documents.filter((document) => selectedIds.includes(document.documentId)).length,
    [documents, selectedIds],
  );

  const toggleDocument = (documentId: string) => {
    setSelectedIds((current) => {
      const next = current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId];
      saveSelectedDocumentIds(next);
      return next;
    });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      const result = await uploadKnowledgeDocuments(files);
      const uploadedIds = result.documents.map((document) => document.documentId);
      const nextSelected = Array.from(new Set([...selectedIds, ...uploadedIds]));
      saveSelectedDocumentIds(nextSelected);
      setSelectedIds(nextSelected);
      await loadDocuments();
    } catch {
      setError('Falha ao enviar ou indexar os arquivos. Verifique o formato e o limite de 25 MB.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Biblioteca de conhecimento" role="admin">
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[#080808]/80 p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Database size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.22em]">RAG multimodal</span>
              </div>
              <h1 className="text-2xl font-black text-white">Conteúdo usado pelo chatbot</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                Envie documentos, planilhas, apresentações, imagens e arquivos Power BI. Marque os arquivos que o chatbot deve priorizar nas respostas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void loadDocuments()} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar
              </button>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-black hover:opacity-90">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {uploading ? 'Indexando...' : 'Enviar arquivos'}
                <input type="file" multiple accept={ACCEPTED_TYPES} disabled={uploading} onChange={handleUpload} className="sr-only" />
              </label>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="rounded-full border border-white/10 px-3 py-1.5">{documents.length} arquivos</span>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary">{selectedCount} ativos no chat</span>
            <span className="rounded-full border border-white/10 px-3 py-1.5">25 MB por arquivo</span>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">{error}</div>}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex min-h-48 items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin" /> Carregando biblioteca</div>
          ) : documents.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500">Nenhum arquivo indexado. Envie o primeiro conteúdo para treinar a base RAG.</div>
          ) : documents.map((document) => {
            const selected = selectedIds.includes(document.documentId);
            return (
              <button key={document.documentId} type="button" onClick={() => toggleDocument(document.documentId)} className={`group rounded-2xl border p-5 text-left transition-all ${selected ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-[#080808]/70 hover:border-white/20'}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-xl bg-white/5 p-3 text-slate-300"><FileText size={20} /></span>
                  <CheckCircle2 size={20} className={selected ? 'text-primary' : 'text-slate-700'} />
                </div>
                <h2 className="mt-4 truncate text-sm font-black text-white" title={document.filename}>{document.filename}</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{document.contentType} · {document.chunks} trechos</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{document.modalities.map((modality) => <span key={modality} className="rounded-md bg-white/5 px-2 py-1 text-[9px] uppercase text-slate-400">{modality}</span>)}</div>
              </button>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}
