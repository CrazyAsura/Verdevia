import { useState, useEffect, useCallback } from 'react';
import ComplaintService, { Complaint } from '../services/complaint.service';

export function useComplaintDetail(id: string) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ComplaintService.getComplaint(id);
      setComplaint(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching complaint detail:', err);
      setError('Não foi possível carregar os detalhes da queixa.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id, fetchComplaint]);

  return {
    complaint,
    loading,
    error,
    refresh: fetchComplaint
  };
}
