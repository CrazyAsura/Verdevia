import { gql } from '@apollo/client';
import { COMPLIANCE_VERSION_FRAGMENT } from '../queries/compliance';

export const PUBLISH_COMPLIANCE_VERSION = gql`
  ${COMPLIANCE_VERSION_FRAGMENT}
  mutation PublishComplianceVersion($input: PublishComplianceVersionInput!) {
    publishComplianceVersion(input: $input) {
      ...ComplianceVersionFields
    }
  }
`;

export const ACTIVATE_COMPLIANCE_VERSION = gql`
  ${COMPLIANCE_VERSION_FRAGMENT}
  mutation ActivateComplianceVersion($id: ID!) {
    activateComplianceVersion(id: $id) {
      ...ComplianceVersionFields
    }
  }
`;

export const DELETE_COMPLIANCE_VERSION = gql`
  mutation DeleteComplianceVersion($id: ID!) {
    deleteComplianceVersion(id: $id) {
      success
      message
    }
  }
`;
