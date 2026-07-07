import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageSquare, Heart, Send, Share2, ShieldAlert, HeartOff } from 'lucide-react-native';
import { Share } from 'react-native';
import { Motion } from '@legendapp/motion';
import { useTheme } from '@/context/ThemeContext';
import { usePostDetail } from '../../hooks/usePostDetail';

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  
  const {
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
  } = usePostDetail(id as string);

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}>
       <ActivityIndicator color="#00FF9C" />
    </View>
  );

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#111' : '#FFF',
    border: isDark ? '#222' : '#EEE',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#AAA' : '#666',
    inputBg: isDark ? '#161616' : '#FFF',
    inputBorder: isDark ? '#333' : '#EEE'
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <ChevronLeft color="#00FF9C" size={30} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Discussão</Text>
          </View>

          <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.postBody}>
            <View style={styles.userRow}>
                <View style={styles.avatar}><Text style={styles.avatarTxt}>{post?.userName?.[0]}</Text></View>
                <View>
                  <Text style={[styles.userName, { color: theme.text }]}>{post?.userName || 'Membro VERDEVIA'}</Text>
                  <Text style={styles.userSub}>{post?.category || 'Comunidade'}</Text>
                </View>
            </View>

            <Text style={[styles.mainText, { color: isDark ? '#DDD' : '#444' }]}>{post?.content}</Text>
            
            <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={styles.stat} onPress={handleLikePost}>
                <Heart 
                  size={18} 
                  color={post?.likes && post.likes > 0 ? "#FF4B4B" : "#666"} 
                  fill={post?.likes && post.likes > 0 ? "#FF4B4B" : "transparent"} 
                />
                <Text style={[styles.statTxt, post?.likes && post.likes > 0 && { color: "#FF4B4B", fontWeight: 'bold' }]}>
                  {post?.likes || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stat} onPress={handleSharePost}>
                <Share2 size={18} color="#00FF9C" />
                <Text style={[styles.statTxt, { color: "#00FF9C", fontWeight: 'bold' }]}>{post?.shares || 0}</Text>
              </TouchableOpacity>
              <View style={styles.stat}>
                <MessageSquare size={16} color="#666" />
                <Text style={styles.statTxt}>{comments.length}</Text>
              </View>
            </View>
          </Motion.View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: theme.text }]}>Comentários ({comments.length})</Text>
            
            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                  <MessageSquare size={40} color={isDark ? "#222" : "#DDD"} />
                  <Text style={styles.emptyText}>Ainda não há comentários. Seja o primeiro a responder!</Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={[styles.commentItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.commentHeader}>
                        <Text style={[styles.commentAuthor, { color: theme.text }]}>{comment.userName}</Text>
                        <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.commentText, { color: isDark ? '#BBB' : '#444' }]}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.cAction} onPress={() => handleLikeComment(comment.id)}>
                            <Heart size={14} color="#666" />
                            <Text style={styles.cActionTxt}>{comment.likes || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.cAction} 
                          onPress={() => Share.share({ message: comment.content })}
                        >
                            <Share2 size={14} color="#00FF9C" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cAction} onPress={() => handleReportComment(comment.id)}>
                            <ShieldAlert size={14} color="#FF4B4B" />
                        </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.inputArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <TextInput 
            placeholder="Escreva sua resposta..." 
            placeholderTextColor="#666" 
            style={[styles.textInput, { color: theme.text }]}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, sending && { opacity: 0.5 }]} 
            onPress={handleAddComment}
            disabled={sending}
          >
            {sending ? <ActivityIndicator size="small" color="#000" /> : <Send color="#000" size={20} />}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 150 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 15, marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  postBody: { paddingHorizontal: 24, marginBottom: 40 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: 'rgba(0, 255, 156, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00FF9C' },
  avatarTxt: { color: '#00FF9C', fontWeight: 'bold', fontSize: 20 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userSub: { color: '#666', fontSize: 12 },
  mainText: { fontSize: 17, lineHeight: 28, marginBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 20, borderTopWidth: 1, paddingTop: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statTxt: { color: '#666', fontSize: 14 },
  commentsSection: { paddingHorizontal: 24 },
  commentsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  emptyComments: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 15, fontSize: 14, paddingHorizontal: 40 },
  commentsList: { gap: 15 },
  commentItem: { padding: 18, borderRadius: 20, borderWidth: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  commentAuthor: { fontWeight: 'bold', fontSize: 14, flex: 1 },
  commentDate: { color: '#666', fontSize: 10 },
  commentText: { fontSize: 14, lineHeight: 22, marginBottom: 15 },
  commentActions: { flexDirection: 'row', gap: 15, borderTopWidth: 0.5, borderTopColor: 'rgba(100,100,100,0.1)', paddingTop: 12 } as any,
  cAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cActionTxt: { color: '#666', fontSize: 12 },
  inputArea: { position: 'absolute', bottom: 30, left: 24, right: 24, minHeight: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, paddingVertical: 10 },
  textInput: { flex: 1, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#00FF9C', justifyContent: 'center', alignItems: 'center' }
});
