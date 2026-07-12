import { getApolloClient } from '@/lib/apollo-client';
import { GET_COMPLAINT, GET_COMPLAINTS } from '@/graphql/queries/complaints';
import {
  CREATE_COMPLAINT,
  DELETE_COMPLAINT,
  UPDATE_COMPLAINT,
} from '@/graphql/mutations/complaints';

export interface Complaint {
  id: string;
  type: string;
  description: string;
  status: string;
  location: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  userId?: string;
  privacy: string;
  aiAnalysis?: {
    isFake: boolean;
    confidence: number;
    message: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintsResponse {
  items: Complaint[];
  total: number;
  page: number;
  lastPage: number;
}

const ComplaintsService = {
  /**
   * Fetches paginated complaints list.
   * GraphQL: complaints(filter)
   */
  getComplaints: async (
    page = 1,
    limit = 10,
    search?: string,
    status?: string
  ): Promise<ComplaintsResponse> => {
    const { data } = await getApolloClient().query({
      query: GET_COMPLAINTS,
      variables: { filter: { page, limit, search, status } },
      fetchPolicy: 'network-only',
    });
    return (data as any).complaints;
  },

  /**
   * Fetches a single complaint by ID.
   * GraphQL: complaint(id)
   */
  getComplaint: async (id: string): Promise<Complaint> => {
    const { data } = await getApolloClient().query({
      query: GET_COMPLAINT,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return (data as any).complaint;
  },

  /**
   * Updates the status of a complaint (admin action).
   * GraphQL: updateComplaint
   */
  updateComplaintStatus: async (
    id: string,
    status: string
  ): Promise<Complaint> => {
    const { data } = await getApolloClient().mutate({
      mutation: UPDATE_COMPLAINT,
      variables: { id, input: { status: normalizeComplaintStatus(status) } },
    });
    return (data as any).updateComplaint;
  },

  /**
   * Creates a new complaint.
   * GraphQL: createComplaint
   */
  createComplaint: async (data: Partial<Complaint>): Promise<Complaint> => {
    const { data: result } = await getApolloClient().mutate({
      mutation: CREATE_COMPLAINT,
      variables: { input: data },
    });
    return (result as any).createComplaint;
  },

  /**
   * Deletes a complaint.
   * GraphQL: removeComplaint
   */
  deleteComplaint: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await getApolloClient().mutate({
      mutation: DELETE_COMPLAINT,
      variables: { id },
    });
    return (data as any).removeComplaint;
  },
};

function normalizeComplaintStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'resolvido') return 'RESOLVIDO';
  if (normalized === 'rejeitado') return 'REJEITADO';
  if (normalized === 'em análise' || normalized === 'em_analise') {
    return 'EM_ANALISE';
  }
  return 'PENDENTE';
}

export default ComplaintsService;

