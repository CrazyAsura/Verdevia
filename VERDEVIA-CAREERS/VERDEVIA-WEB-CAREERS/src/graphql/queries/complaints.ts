import { gql } from '@apollo/client';
import { USER_FRAGMENT } from './users';

export const COMPLAINT_FRAGMENT = gql`
  fragment ComplaintFields on ComplaintType {
    id
    type
    description
    location
    imageUrl
    status
    privacy
    latitude
    longitude
    ip
    createdAt
    updatedAt
  }
`;

export const GET_COMPLAINTS = gql`
  ${COMPLAINT_FRAGMENT}
  ${USER_FRAGMENT}
  query GetComplaints($filter: ComplaintsFilterInput) {
    complaints(filter: $filter) {
      items {
        ...ComplaintFields
        user {
          ...UserFields
        }
      }
      total
      page
      limit
      lastPage
    }
  }
`;

export const GET_COMPLAINT = gql`
  ${COMPLAINT_FRAGMENT}
  ${USER_FRAGMENT}
  query GetComplaint($id: ID!) {
    complaint(id: $id) {
      ...ComplaintFields
      user {
        ...UserFields
      }
    }
  }
`;
