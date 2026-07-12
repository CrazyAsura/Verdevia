import { gql } from '@apollo/client';

export const CONSENT_FRAGMENT = gql`
  fragment ConsentFields on ConsentType {
    id
    purpose
    status
    version
    updatedAt
  }
`;

export const GET_CONSENTS = gql`
  ${CONSENT_FRAGMENT}
  query GetConsents($userId: ID!) {
    userConsents(userId: $userId) {
      ...ConsentFields
    }
  }
`;

export const COMPLIANCE_VERSION_FRAGMENT = gql`
  fragment ComplianceVersionFields on ComplianceVersionType {
    id
    type
    version
    content
    pdfName
    isActive
    publishedAt
  }
`;

export const GET_COMPLIANCE_VERSIONS = gql`
  ${COMPLIANCE_VERSION_FRAGMENT}
  query GetComplianceVersions($type: String!) {
    complianceVersions(type: $type) {
      ...ComplianceVersionFields
    }
  }
`;
