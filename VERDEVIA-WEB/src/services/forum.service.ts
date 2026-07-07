import { getApolloClient } from '@/lib/apollo-client';
import { GET_COMMENTS, GET_POST, GET_POSTS } from '@/graphql/queries/forum';
import { DELETE_COMMENT, DELETE_POST } from '@/graphql/mutations/forum';

export interface ForumPost {
  id: string;
  userName: string;
  content: string;
  category: string;
  likes: number;
  dislikes: number;
  views: number;
  commentsCount: number;
  shares: number;
  createdAt: string;
}

export interface ForumComment {
  id: string;
  userName: string;
  content: string;
  likes: number;
  dislikes: number;
  reportCount: number;
  createdAt: string;
}

export interface ForumPostsResponse {
  items: ForumPost[];
  total: number;
  page: number;
  lastPage: number;
}

const ForumService = {
  /**
   * Fetches paginated forum posts.
   * GraphQL: posts(filter)
   */
  getPosts: async (
    page = 1,
    limit = 10,
    search?: string,
    category?: string
  ): Promise<ForumPostsResponse> => {
    const { data } = await getApolloClient().query({
      query: GET_POSTS,
      variables: { filter: { page, limit, search, category } },
      fetchPolicy: 'network-only',
    });
    return {
      ...(data as any).posts,
      items: (((data as any).posts.items ?? []) as any[]).map(normalizePost),
    };
  },

  /**
   * Fetches a single post with its comments.
   * GraphQL: post(id)
   */
  getPost: async (id: string): Promise<ForumPost & { comments: ForumComment[] }> => {
    const { data } = await getApolloClient().query({
      query: GET_POST,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return { ...normalizePost((data as any).post), comments: [] };
  },

  /**
   * Fetches comments for a post.
   * GraphQL: comments(postId)
   */
  getComments: async (postId: string): Promise<ForumComment[]> => {
    const { data } = await getApolloClient().query({
      query: GET_COMMENTS,
      variables: { postId, page: 1, limit: 100 },
      fetchPolicy: 'network-only',
    });
    return (((data as any).comments ?? []) as any[]).map(normalizeComment);
  },

  /**
   * Removes a post (admin).
   * GraphQL: deletePost
   */
  removePost: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await getApolloClient().mutate({
      mutation: DELETE_POST,
      variables: { id },
    });
    return (data as any).deletePost;
  },

  /**
   * Removes a comment (admin moderation).
   * GraphQL: deleteComment
   */
  removeComment: async (commentId: string): Promise<{ success: boolean }> => {
    const { data } = await getApolloClient().mutate({
      mutation: DELETE_COMMENT,
      variables: { commentId },
    });
    return (data as any).deleteComment;
  },
};

function normalizePost(post: any): ForumPost {
  return {
    ...post,
    likes: post.likes ?? post.likesCount ?? 0,
    dislikes: post.dislikes ?? post.dislikesCount ?? 0,
  };
}

function normalizeComment(comment: any): ForumComment {
  return {
    ...comment,
    likes: comment.likes ?? comment.likesCount ?? 0,
    dislikes: comment.dislikes ?? comment.dislikesCount ?? 0,
  };
}

export default ForumService;

