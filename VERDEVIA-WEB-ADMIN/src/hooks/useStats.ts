import { useQuery } from '@tanstack/react-query';
import StatsService from '@/services/stats.service';

export function useStats() {
  return useQuery({
    queryKey: ['stats-summary'],
    queryFn: async () => {
      const data = await StatsService.getStats();
      
      return {
        totalUsers: data.totalUsers || 0,
        totalComplaints: data.totalComplaints || 0,
        recentComplaints: (data.recentComplaints || []).map((complaint) => ({
          ...complaint,
          title: complaint.type || 'Denúncia ambiental',
        })),
        userGrowth: '+12%',
        complaintTrend: 'high',
      };
    },
  });
}
