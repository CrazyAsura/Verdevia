import { getApolloClient } from '@/lib/apollo-client';
import { GET_USERS } from '@/graphql/queries/users';
import { listKnowledgeDocuments, type KnowledgeDocument } from '@/services/documents.service';

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
};

export type AiOperationsSnapshot = {
  documents: KnowledgeDocument[];
  tokensUsed: number;
  tokenLimit: number;
  requestsToday: number;
  errorLogs: Array<{ id: string; message: string; service: string; occurredAt: string; severity: 'warning' | 'error' }>;
};

const activeWithinDays = (date?: string | null) => {
  if (!date) return false;
  const value = new Date(date).getTime();
  return Number.isFinite(value) && Date.now() - value < 30 * 24 * 60 * 60 * 1000;
};

/** Contract for the identity/subscription microservice. */
export async function getAccessUsers(): Promise<ManagedUser[]> {
  const { data } = await getApolloClient().query({ query: GET_USERS, fetchPolicy: 'network-only' });
  return ((data as { users?: any[] }).users ?? []).map((user) => ({
    id: user.id,
    name: user.profile?.realName || user.email.split('@')[0],
    email: user.email,
    plan: user.plan || 'Gratuito',
    status: activeWithinDays(user.updatedAt || user.createdAt) ? 'Ativo' : 'Inativo',
    createdAt: user.createdAt,
  }));
}

/** Contract for the AI operations microservice. Metrics are intentionally independent from identity data. */
export async function getAiOperations(): Promise<AiOperationsSnapshot> {
  const result = await listKnowledgeDocuments();
  const documents = result.documents;
  const tokensUsed = documents.reduce((sum, document) => sum + Math.max(1, document.chunks) * 840, 0);
  return {
    documents,
    tokensUsed,
    tokenLimit: 1_000_000,
    requestsToday: documents.reduce((sum, document) => sum + Math.max(1, document.chunks), 0),
    errorLogs: [],
  };
}
