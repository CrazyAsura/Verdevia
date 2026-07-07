'use client';

import { useQuery, useMutation, useSubscription, OnDataOptions } from '@apollo/client/react';
import {
  GET_POSTS,
  GET_POST,
  GET_COMMENTS,
  ON_COMMENT_ADDED,
} from '@/graphql/queries/forum';
import {
  CREATE_POST,
  UPDATE_POST,
  DELETE_POST,
  LIKE_POST,
  DISLIKE_POST,
  SHARE_POST,
  ADD_COMMENT,
  LIKE_COMMENT,
  REPORT_COMMENT,
  DELETE_COMMENT,
} from '@/graphql/mutations/forum';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostsFilter {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreatePostInput {
  title: string;
  content: string;
  userName: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
}

interface CreateCommentInput {
  postId: string;
  parentId?: string;
  content: string;
  userName: string;
  authorId?: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * useForumPosts — Fetches paginated forum posts with optional filters.
 */
export function useForumPosts(filter?: PostsFilter) {
  const { data, loading, error, fetchMore } = useQuery<{
    posts: { items: any[]; total: number; page: number; hasNextPage: boolean };
  }>(GET_POSTS, {
    variables: { filter },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    const currentPage = data?.posts?.page ?? 1;
    fetchMore({
      variables: { filter: { ...filter, page: currentPage + 1 } },
    });
  };

  return {
    posts: (data?.posts?.items ?? []) as any[],
    total: data?.posts?.total ?? 0,
    hasNextPage: data?.posts?.hasNextPage ?? false,
    loading,
    error,
    loadMore,
  };
}

/**
 * useForumPost — Fetches a single post.
 */
export function useForumPost(id: string) {
  const { data, loading, error } = useQuery<{ post: any }>(GET_POST, {
    variables: { id },
    skip: !id,
  });

  return {
    post: data?.post ?? null,
    loading,
    error,
  };
}

/**
 * useForumComments — Fetches comments for a post with real-time subscription.
 */
export function useForumComments(postId: string) {
  const { data, loading, error } = useQuery<{ comments: any[] }>(GET_COMMENTS, {
    variables: { postId },
    skip: !postId,
  });

  // Real-time subscription: append new comments as they arrive
  useSubscription(ON_COMMENT_ADDED, {
    variables: { postId },
    skip: !postId,
    onData: (opts: OnDataOptions) => {
      const client = opts.client;
      const subData = opts.data as { data?: { commentAdded?: any } };
      if (!subData.data?.commentAdded) return;
      const newComment = subData.data.commentAdded;
      const existing = client.readQuery<{ comments: any[] }>({ query: GET_COMMENTS, variables: { postId } });
      if (existing) {
        client.writeQuery({
          query: GET_COMMENTS,
          variables: { postId },
          data: { comments: [newComment, ...existing.comments] },
        });
      }
    },
  });

  return {
    comments: (data?.comments ?? []) as any[],
    loading,
    error,
  };
}

/**
 * useForumMutations — All post and comment mutation hooks.
 */
export function useForumMutations() {
  const [createPostMutation, { loading: creatingPost }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [updatePostMutation] = useMutation(UPDATE_POST);
  const [deletePostMutation] = useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [likePostMutation] = useMutation(LIKE_POST);
  const [dislikePostMutation] = useMutation(DISLIKE_POST);
  const [sharePostMutation] = useMutation(SHARE_POST);
  const [addCommentMutation, { loading: addingComment }] = useMutation(ADD_COMMENT);
  const [likeCommentMutation] = useMutation(LIKE_COMMENT);
  const [reportCommentMutation] = useMutation(REPORT_COMMENT);
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);

  return {
    createPost: (input: CreatePostInput) =>
      createPostMutation({ variables: { input } }),
    updatePost: (id: string, input: Partial<CreatePostInput>) =>
      updatePostMutation({ variables: { id, input } }),
    deletePost: (id: string) =>
      deletePostMutation({ variables: { id } }),
    likePost: (postId: string, userId: string) =>
      likePostMutation({ variables: { postId, userId } }),
    dislikePost: (postId: string, userId: string) =>
      dislikePostMutation({ variables: { postId, userId } }),
    sharePost: (postId: string) =>
      sharePostMutation({ variables: { postId } }),
    addComment: (input: CreateCommentInput) =>
      addCommentMutation({ variables: { input } }),
    likeComment: (commentId: string, userId: string) =>
      likeCommentMutation({ variables: { commentId, userId } }),
    reportComment: (commentId: string, userId: string) =>
      reportCommentMutation({ variables: { commentId, userId } }),
    deleteComment: (commentId: string) =>
      deleteCommentMutation({ variables: { commentId } }),
    creatingPost,
    addingComment,
  };
}
