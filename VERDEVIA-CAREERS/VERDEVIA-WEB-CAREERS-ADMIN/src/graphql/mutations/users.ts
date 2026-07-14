import { gql } from '@apollo/client';
import { USER_FRAGMENT, PROFILE_FRAGMENT, GAMIFICATION_FRAGMENT } from '../queries/users';

export const REGISTER_USER = gql`
  ${USER_FRAGMENT}
  ${PROFILE_FRAGMENT}
  ${GAMIFICATION_FRAGMENT}
  mutation RegisterUser($input: CreateUserInput!) {
    registerUser(input: $input) {
      ...UserFields
      profile {
        ...ProfileFields
      }
      gamification {
        ...GamificationFields
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        email
        role
        profile {
          realName
        }
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  ${USER_FRAGMENT}
  ${PROFILE_FRAGMENT}
  mutation UpdateUserProfile($id: ID!, $input: UpdateUserInput!) {
    updateUserProfile(id: $id, input: $input) {
      ...UserFields
      profile {
        ...ProfileFields
      }
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_FRAGMENT}
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
`;

export const REMOVE_USER = gql`
  mutation RemoveUser($id: ID!) {
    removeUser(id: $id) {
      success
      message
    }
  }
`;
