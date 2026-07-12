import { gql } from '@apollo/client';

// ─── Post Mutations ───────────────────────────────────────────────────────────

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      userName
      category
      tags
      likesCount
      commentsCount
      createdAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      content
      category
      tags
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      success
      message
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!, $userId: String!) {
    likePost(postId: $postId, userId: $userId)
  }
`;

export const DISLIKE_POST = gql`
  mutation DislikePost($postId: ID!, $userId: String!) {
    dislikePost(postId: $postId, userId: $userId)
  }
`;

export const SHARE_POST = gql`
  mutation SharePost($postId: ID!) {
    sharePost(postId: $postId) {
      success
    }
  }
`;

// ─── Comment Mutations ────────────────────────────────────────────────────────

export const ADD_COMMENT = gql`
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      id
      postId
      parentId
      content
      userName
      likesCount
      createdAt
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: ID!, $userId: String!) {
    likeComment(commentId: $commentId, userId: $userId)
  }
`;

export const DISLIKE_COMMENT = gql`
  mutation DislikeComment($commentId: ID!, $userId: String!) {
    dislikeComment(commentId: $commentId, userId: $userId)
  }
`;

export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: ID!, $userId: String!) {
    reportComment(commentId: $commentId, userId: $userId)
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      message
    }
  }
`;
