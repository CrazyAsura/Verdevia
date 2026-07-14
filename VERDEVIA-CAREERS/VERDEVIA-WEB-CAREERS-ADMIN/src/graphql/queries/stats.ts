import { gql } from '@apollo/client';

export const GET_STATS_SUMMARY = gql`
  query GetStatsSummary {
    statsSummary {
      totalUsers
      totalComplaints
      recentComplaints {
        id
        type
        description
        status
        location
        createdAt
      }
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($page: Int, $limit: Int, $type: String) {
    auditLogs(page: $page, limit: $limit, type: $type) {
      logs {
        id
        action
        route
        ip
        userAgent
        userId
        userName
        createdAt
      }
      total
      page
      lastPage
    }
  }
`;

export const GET_MAP_DATA = gql`
  query GetMapData {
    mapData {
      id
      latitude
      longitude
      type
      status
      description
      createdAt
    }
  }
`;

export const GET_SPARK_PREDICTIONS = gql`
  query GetSparkPredictions {
    sparkPredictions {
      latitude
      longitude
      intensity
    }
  }
`;

export const GET_EXPORT_FILE = gql`
  query GetExportFile($filename: String!) {
    exportFile(filename: $filename) {
      filename
      mimeType
      base64
    }
  }
`;
