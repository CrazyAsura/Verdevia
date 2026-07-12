import { gql } from '@apollo/client';

export const LOG_VISIT = gql`
  mutation LogVisit($input: LogVisitInput!) {
    logVisit(input: $input)
  }
`;

export const REQUEST_EXCEL_EXPORT = gql`
  mutation RequestExcelExport {
    requestExcelExport {
      queued
      message
    }
  }
`;
