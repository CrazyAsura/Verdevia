import { gql } from '@apollo/client';

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

export const GET_POSTS = gql`
  ${POST_FRAGMENT}
  query GetPosts($filter: PostsFilterInput) {
    posts(filter: $filter) {
      items { ...PostFields }
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
    post(id: $id) { ...PostFields }
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

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      userName
      category
      createdAt
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!, $userId: String!) {
    likePost(postId: $postId, userId: $userId)
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      id
      postId
      content
      userName
      likesCount
      createdAt
    }
  }
`;

export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: ID!, $userId: String!) {
    reportComment(commentId: $commentId, userId: $userId)
  }
`;
