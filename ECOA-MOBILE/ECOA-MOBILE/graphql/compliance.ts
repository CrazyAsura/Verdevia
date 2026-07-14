import { gql } from '@apollo/client';
import { USER_FRAGMENT, PROFILE_FRAGMENT } from './users';
import { COMPLAINT_FRAGMENT } from './complaints';

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
  query GetUserConsents($userId: ID!) {
    userConsents(userId: $userId) {
      ...ConsentFields
    }
  }
`;

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
