import { gql } from '@apollo/client';

// ─── Fragments ────────────────────────────────────────────────────────────────

export const POST_FRAGMENT = gql`
  fragment PostFields on PostType {
    id
    title
    content
    userName
    authorId
    category
    tags
    likesCount
    dislikesCount
    views
    commentsCount
    shares
    isPinned
    imageUrl
    createdAt
    updatedAt
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFields on CommentType {
    id
    postId
    parentId
    content
    userName
    authorId
    likesCount
    dislikesCount
    reportCount
    isDeleted
    createdAt
    updatedAt
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const GET_POSTS = gql`
  ${POST_FRAGMENT}
  query GetPosts($filter: PostsFilterInput) {
    posts(filter: $filter) {
      items {
        ...PostFields
      }
      total
      page
      limit
      hasNextPage
    }
  }
`;

export const GET_POST = gql`
  ${POST_FRAGMENT}
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
    }
  }
`;

export const GET_COMMENTS = gql`
  ${COMMENT_FRAGMENT}
  query GetComments($postId: ID!, $page: Int, $limit: Int) {
    comments(postId: $postId, page: $page, limit: $limit) {
      ...CommentFields
    }
  }
`;

export const GET_REPLIES = gql`
  ${COMMENT_FRAGMENT}
  query GetReplies($parentId: ID!) {
    replies(parentId: $parentId) {
      ...CommentFields
    }
  }
`;

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const ON_POST_ADDED = gql`
  ${POST_FRAGMENT}
  subscription OnPostAdded {
    postAdded {
      ...PostFields
    }
  }
`;

export const ON_COMMENT_ADDED = gql`
  ${COMMENT_FRAGMENT}
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      ...CommentFields
    }
  }
`;
