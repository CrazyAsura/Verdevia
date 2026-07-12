import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on UserType {
    id
    email
    role
    createdAt
    updatedAt
  }
`;

export const PROFILE_FRAGMENT = gql`
  fragment ProfileFields on UserProfileType {
    id
    realName
    identity
    gender
    ethnicity
    birthDate
    avatarUrl
    bio
    address {
      zipCode
      street
      city
      state
      district
      country
      number
    }
    phones {
      ddi
      ddd
      number
    }
  }
`;

export const GAMIFICATION_FRAGMENT = gql`
  fragment GamificationFields on UserGamificationType {
    id
    xp
    level
    isPremium
    activeTitle
    avatarFrame
  }
`;

export const ACHIEVEMENT_FRAGMENT = gql`
  fragment AchievementFields on AchievementType {
    id
    name
    icon
    status
    progress
    isLocked
    date
  }
`;

export const GET_USERS = gql`
  ${USER_FRAGMENT}
  ${PROFILE_FRAGMENT}
  query GetUsers {
    users {
      ...UserFields
      profile {
        ...ProfileFields
      }
      plan
      billingCycle
      subscriptionStatus
    }
  }
`;

export const GET_USER = gql`
  ${USER_FRAGMENT}
  ${PROFILE_FRAGMENT}
  ${GAMIFICATION_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
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

export const GET_PROFILE = gql`
  ${PROFILE_FRAGMENT}
  query GetProfile($id: ID!) {
    profile(id: $id) {
      ...ProfileFields
    }
  }
`;

export const GET_ACHIEVEMENTS = gql`
  ${ACHIEVEMENT_FRAGMENT}
  query GetAchievements($userId: ID!) {
    achievements(userId: $userId) {
      ...AchievementFields
    }
  }
`;
