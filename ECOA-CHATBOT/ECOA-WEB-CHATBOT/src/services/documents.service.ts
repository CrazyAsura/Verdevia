import api from '@/services/api';

export type KnowledgeDocument = {
  documentId: string;
  filename: string;
  contentType: string;
  chunks: number;
  deduplicated: boolean;
  modalities: string[];
};

export type DocumentLibraryResponse = {
  documents: KnowledgeDocument[];
  collection: string;
  persistDir?: string;
};

export const SELECTED_DOCUMENTS_KEY = 'ECOA_rag_document_ids';

export async function listKnowledgeDocuments() {
  const response = await api.get<DocumentLibraryResponse>('/ai/documents');
  return response.data;
}

export async function uploadKnowledgeDocuments(files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  const response = await api.post<DocumentLibraryResponse>('/ai/documents', form, {
    timeout: 180_000,
  });
  return response.data;
}

export function loadSelectedDocumentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(SELECTED_DOCUMENTS_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSelectedDocumentIds(ids: string[]) {
  localStorage.setItem(SELECTED_DOCUMENTS_KEY, JSON.stringify(ids));
}
