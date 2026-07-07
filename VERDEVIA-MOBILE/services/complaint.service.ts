import api from './api';

export interface Complaint {
  id: string;
  type: string;
  description: string;
  status: string;
  location: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  aiAnalysis?: {
    isFake: boolean;
    confidence: number;
    message: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ComplaintService = {
  getComplaint: async (id: string) => {
    const res = await api.get<Complaint>(`/complaints/${id}`);
    return res.data;
  },

  getComplaints: async (page = 1, limit = 10, search?: string, status?: string) => {
    const res = await api.get<{ items: Complaint[]; total: number }>(`/complaints`, {
      params: { page, limit, search, status },
    });
    return res.data;
  },

  createComplaint: async (data: Partial<Complaint>) => {
    const res = await api.post<Complaint>(`/complaints`, data);
    return res.data;
  },

  updateComplaint: async (id: string, data: Partial<Complaint>) => {
    const res = await api.put<Complaint>(`/complaints/${id}`, data);
    return res.data;
  },

  deleteComplaint: async (id: string) => {
    return api.delete(`/complaints/${id}`);
  },
};

export default ComplaintService;
