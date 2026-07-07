import { useState, useEffect, useCallback } from 'react';
import { Alert, Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForumService, { ForumPost, ForumComment } from '../services/forum.service';

export function usePostDetail(id: string) {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await ForumService.getPost(id);
      setPost(data);
      setComments(data.comments || []);
      
      // Increment view count only once per user session/device
      const viewKey = `@viewed_post_${id}`;
      const alreadyViewed = await AsyncStorage.getItem(viewKey);
      
      if (!alreadyViewed) {
        ForumService.incrementView(id)
          .then(() => AsyncStorage.setItem(viewKey, 'true'))
          .catch(() => {});
      }
    } catch (error) {
      console.error('Error fetching post detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  const handleLikePost = async () => {
    if (!post) return;
    try {
      const likedKey = `@liked_post_${id}`;
      const alreadyLiked = await AsyncStorage.getItem(likedKey);
      
      if (alreadyLiked) {
        Alert.alert('Informação', 'Você já deu um coração nesta postagem.');
        return;
      }

      await ForumService.likePost(id as string);
      await AsyncStorage.setItem(likedKey, 'true');
      setPost((prev) => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (e) {
      console.error('Error liking post:', e);
    }
  };

  const handleSharePost = async () => {
    if (!post) return;
    try {
      const result = await Share.share({
        message: `Confira esta discussão no VERDEVIA: "${post.content.substring(0, 50)}..."`,
        url: `http://verdevia.app/post/${id}`,
      });

      // On Web, result might be undefined or have different structure
      if (Platform.OS === 'web' || (result && result.action === Share.sharedAction)) {
        const sharedKey = `@shared_post_${id}`;
        const alreadyShared = await AsyncStorage.getItem(sharedKey);
        
        if (!alreadyShared) {
          await ForumService.sharePost(id as string);
          await AsyncStorage.setItem(sharedKey, 'true');
          setPost((prev) => prev ? { ...prev, shares: (prev.shares || 0) + 1 } : null);
        }
      }
    } catch (e) {
      console.error('Error sharing post:', e);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;
    setSending(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : { name: 'Visitante' };
      const userName = user.realName || user.name || 'Usuário VERDEVIA';
      
      const newComment = await ForumService.addComment(id, commentText, userName);
      
      setComments((prev) => [newComment, ...prev]);
      setPost((prev) => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null);
      setCommentText('');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar seu comentário.');
    } finally {
      setSending(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const likedKey = `@liked_comment_${commentId}`;
      const alreadyLiked = await AsyncStorage.getItem(likedKey);

      if (alreadyLiked) return;

      await ForumService.likeComment(commentId);
      await AsyncStorage.setItem(likedKey, 'true');
      setComments((prev) => 
        prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
      );
    } catch (e) {}
  };

  const handleDislikeComment = async (commentId: string) => {
    try {
      await ForumService.dislikeComment(commentId);
      setComments((prev) => 
        prev.map((c) => (c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c))
      );
    } catch (e) {}
  };

  const handleReportComment = (commentId: string) => {
    Alert.alert(
      'Denunciar Comentário',
      'Deseja denunciar este comentário por violar as regras da comunidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Denunciar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ForumService.reportComment(commentId);
              Alert.alert('Sucesso', 'Denúncia enviada para análise.');
            } catch (e) {}
          }
        }
      ]
    );
  };

  return {
    post,
    comments,
    loading,
    commentText,
    setCommentText,
    sending,
    handleLikePost,
    handleSharePost,
    handleAddComment,
    handleLikeComment,
    handleDislikeComment,
    handleReportComment
  };
}
