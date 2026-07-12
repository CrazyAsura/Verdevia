import { gql } from '@apollo/client';
import { CONSENT_FRAGMENT } from '../queries/compliance';
import { USER_FRAGMENT, PROFILE_FRAGMENT } from '../queries/users';
import { COMPLAINT_FRAGMENT } from '../queries/complaints';

export const UPDATE_CONSENTS = gql`
  ${CONSENT_FRAGMENT}
  mutation UpdateUserConsents($userId: ID!, $updates: [ConsentUpdateInput!]!) {
    updateUserConsents(userId: $userId, updates: $updates) {
      ...ConsentFields
    }
  }
`;

export const EXPORT_DATA = gql`
  ${USER_FRAGMENT}
  ${PROFILE_FRAGMENT}
  ${COMPLAINT_FRAGMENT}
  ${CONSENT_FRAGMENT}
  mutation ExportUserData($userId: ID!) {
    exportUserData(userId: $userId) {
      exportedAt
      user {
        ...UserFields
        profile {
          ...ProfileFields
        }
      }
      complaints {
        ...ComplaintFields
      }
      consents {
        ...ConsentFields
      }
    }
  }
`;

export const ANONYMIZE_DATA = gql`
  mutation AnonymizeUserData($userId: ID!) {
    anonymizeUserData(userId: $userId) {
      success
      message
    }
  }
`;
