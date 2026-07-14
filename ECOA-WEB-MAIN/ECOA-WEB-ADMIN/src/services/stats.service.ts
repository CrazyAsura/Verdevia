import { getApolloClient } from '@/lib/apollo-client';
import {
  GET_AUDIT_LOGS,
  GET_EXPORT_FILE,
  GET_MAP_DATA,
  GET_SPARK_PREDICTIONS,
  GET_STATS_SUMMARY,
} from '@/graphql/queries/stats';
import { LOG_VISIT, REQUEST_EXCEL_EXPORT } from '@/graphql/mutations/stats';

export interface DashboardStats {
  totalUsers: number;
  totalComplaints: number;
  recentComplaints: RecentComplaint[];
}

export interface RecentComplaint {
  id: string;
  type: string;
  description: string;
  status: string;
  location: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  route: string;
  ip: string;
  userAgent: string;
  userId?: string;
  userName?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  lastPage: number;
}

export interface MapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
}

export interface SparkPrediction {
  id?: number;
  latitude: number;
  longitude: number;
  clusterId?: number;
  predictionLabel?: string;
  intensity?: number;
}

export interface ExportFile {
  filename: string;
  mimeType: string;
  base64: string;
}

const StatsService = {
  /**
   * Fetches aggregated platform statistics.
   * GraphQL: statsSummary
   */
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await getApolloClient().query({
      query: GET_STATS_SUMMARY,
      fetchPolicy: 'network-only',
    });
    return (data as any).statsSummary;
  },

  /**
   * Fetches paginated audit logs for the super-admin panel.
   * GraphQL: auditLogs(page, limit, type)
   */
  getAuditLogs: async (
    page = 1,
    limit = 50,
    type?: string,
  ): Promise<AuditLogsResponse> => {
    const { data } = await getApolloClient().query({
      query: GET_AUDIT_LOGS,
      variables: { page, limit, type },
      fetchPolicy: 'network-only',
    });
    return (data as any).auditLogs;
  },

  /**
   * Fetches complaint geolocations for map rendering.
   * GraphQL: mapData
   */
  getMapData: async (): Promise<MapDataPoint[]> => {
    const { data } = await getApolloClient().query({
      query: GET_MAP_DATA,
      fetchPolicy: 'network-only',
    });
    return (data as any).mapData;
  },

  getSparkPredictions: async (): Promise<SparkPrediction[]> => {
    const { data } = await getApolloClient().query({
      query: GET_SPARK_PREDICTIONS,
      fetchPolicy: 'network-only',
    });
    return (((data as any).sparkPredictions ?? []) as SparkPrediction[]).map((item: SparkPrediction, index: number) => ({
      id: index,
      clusterId: index,
      predictionLabel: 'Hotspot',
      ...item,
    }));
  },

  logVisit: async (input: {
    path: string;
    userAgent?: string;
    userId?: string;
    userName?: string;
    action?: string;
  }): Promise<boolean> => {
    const { data } = await getApolloClient().mutate({
      mutation: LOG_VISIT,
      variables: { input },
    });
    return (data as any).logVisit;
  },

  requestExcelExport: async (): Promise<{ queued: boolean; message: string }> => {
    const { data } = await getApolloClient().mutate({
      mutation: REQUEST_EXCEL_EXPORT,
    });
    return (data as any).requestExcelExport;
  },

  getExportFile: async (filename: string): Promise<ExportFile> => {
    const { data } = await getApolloClient().query({
      query: GET_EXPORT_FILE,
      variables: { filename },
      fetchPolicy: 'network-only',
    });
    return (data as any).exportFile;
  },
};

export default StatsService;
