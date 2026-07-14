import api from './api';

export interface PlatformStats {
  totalUsers: number;
  totalComplaints: number;
  recentComplaints: any[];
}

export interface MapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
}

const StatsService = {
  /**
   * Fetches aggregated platform statistics.
   * Endpoint: GET /stats
   */
  getStats: async (): Promise<PlatformStats> => {
    const res = await api.get<PlatformStats>('/stats');
    return res.data;
  },

  /**
   * Fetches complaint geolocations for the global complaints map.
   * Endpoint: GET /stats/map
   */
  getMapData: async (): Promise<MapDataPoint[]> => {
    const res = await api.get<MapDataPoint[]>('/stats/map');
    return res.data;
  },
};

export default StatsService;
