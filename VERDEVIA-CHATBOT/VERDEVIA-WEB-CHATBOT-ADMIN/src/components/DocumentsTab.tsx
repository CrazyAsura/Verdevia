'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  Lock,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '@/services/api';

type DocumentItem = {
  documentId: string;
  filename: string;
  contentType: string;
  chunks: number;
  deduplicated?: boolean;
  modalities?: string[];
  permission?: 'admin_only' | 'super_admin_only' | 'public';
};

type DocumentsTabProps = {
  token: string;
};

export function DocumentsTab({ token }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ documents: DocumentItem[] }>('/ai/documents');
      setDocuments(response.data.documents || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadSuccess(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await api.post('/ai/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('Documentos enviados e indexados no banco de vetores com sucesso!');
      fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Falha ao fazer upload dos documentos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Tem certeza que deseja remover o documento "${filename}"?`)) return;

    try {
      await api.delete(`/ai/documents/${encodeURIComponent(filename)}`);
      setDocuments((current) => current.filter((doc) => doc.filename !== filename));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Falha ao remover documento.');
    }
  };

  const handleUpdatePermission = async (filename: string, permission: 'admin_only' | 'super_admin_only' | 'public') => {
    try {
      await api.post(`/ai/documents/${encodeURIComponent(filename)}/permission`, {
        permission,
      });
      setDocuments((current) =>
        current.map((doc) => (doc.filename === filename ? { ...doc, permission } : doc))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Falha ao atualizar permissões do documento.');
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Central de Documentos RAG</h2>
          <p className="text-[11px] text-zinc-400">Suba arquivos PDF, DOCX, XLSX ou PBIX para indexar no assistente virtual.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 text-xs text-white placeholder-zinc-500 h-9 rounded-xl pl-9 pr-4 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Atualizar lista"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 gap-6">
        <div className="border border-dashed border-white/10 rounded-2xl bg-zinc-900/10 p-8 text-center flex flex-col items-center justify-center gap-3 shadow-xl backdrop-blur-md relative overflow-hidden">
          <UploadCloud className="h-10 w-10 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white">Importar novos arquivos</h3>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              Selecione arquivos PDF, DOCX, XLSX, TXT, PPTX ou imagens para indexar no repositório de conhecimento.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <button
            disabled={uploading}
            className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {uploading ? 'Indexando arquivos...' : 'Selecionar Arquivos'}
          </button>

          {uploadSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-[11px] font-semibold mt-3 animate-bounce">
              <CheckCircle size={14} />
              {uploadSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      {loading && documents.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-emerald-400 mb-2" size={28} />
          <p className="text-xs text-zinc-500">Lendo catálogo de arquivos...</p>
        </div>
      ) : (
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="pb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Documentos Indexados</h3>
            <p className="text-[10px] text-zinc-500">Lista completa dos arquivos carregados e fragmentados no banco vetorial.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
                  <th className="pb-3 font-semibold">Nome do Arquivo</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold text-right">Blocos</th>
                  <th className="pb-3 font-semibold">Nível de Acesso</th>
                  <th className="pb-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.filename} className="text-zinc-300 hover:text-white transition-colors">
                    <td className="py-3 font-medium text-white flex items-center gap-2 max-w-[250px] truncate" title={doc.filename}>
                      <FileText size={16} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-zinc-500 uppercase">{doc.contentType.split('/')[1] || 'raw'}</td>
                    <td className="py-3 text-right font-mono text-zinc-400">{doc.chunks}</td>
                    <td className="py-3">
                      <select
                        value={doc.permission || 'public'}
                        onChange={(e) => handleUpdatePermission(doc.filename, e.target.value as any)}
                        className="bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 rounded-lg py-1 px-2 outline-none focus:border-emerald-500"
                      >
                        <option value="public">🔓 Livre (Público)</option>
                        <option value="admin_only">🔒 Restrito (Admins)</option>
                        <option value="super_admin_only">🚫 Confidencial (Super Admin)</option>
                      </select>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleDelete(doc.filename)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Excluir arquivo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                      Nenhum documento encontrado correspondente aos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
