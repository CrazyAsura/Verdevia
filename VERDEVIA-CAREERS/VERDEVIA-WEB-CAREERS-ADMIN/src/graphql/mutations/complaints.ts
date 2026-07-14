import { gql } from '@apollo/client';
import { COMPLAINT_FRAGMENT } from '../queries/complaints';

export const CREATE_COMPLAINT = gql`
  ${COMPLAINT_FRAGMENT}
  mutation CreateComplaint($input: CreateComplaintInput!) {
    createComplaint(input: $input) {
      ...ComplaintFields
    }
  }
`;

export const UPDATE_COMPLAINT = gql`
  ${COMPLAINT_FRAGMENT}
  mutation UpdateComplaint($id: ID!, $input: UpdateComplaintInput!) {
    updateComplaint(id: $id, input: $input) {
      ...ComplaintFields
    }
  }
`;

export const DELETE_COMPLAINT = gql`
  mutation RemoveComplaint($id: ID!) {
    removeComplaint(id: $id) {
      success
      message
    }
  }
`;
