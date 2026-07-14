import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Motion } from '@legendapp/motion';
import { MessageSquare, Heart, Share2, Eye, Search } from 'lucide-react-native';
import ForumService from '../services/forum.service';

interface Post {
  id: string;
  userName: string;
  content: string;
  likes: number;
  views: number;
  commentsCount: number;
  shares: number;
  category: string;
  createdAt: string;
}

import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

const CATEGORIES = ['Tudo', 'Informativo', 'Sugestão', 'Dúvida', 'Elogio'];

export default function ForumScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const data = await ForumService.getPosts(
        currentPage,
        5,
        search || undefined,
        selectedCategory
      );

      const newItems = data.items ?? [];
      const lastPage = data.lastPage ?? 1;

      if (reset) {
        setPosts(newItems);
      } else {
        setPosts((prev) => [...(prev ?? []), ...newItems]);
      }

      setHasMore(currentPage < lastPage);
      if (!reset) setPage(currentPage + 1);
      else setPage(2);
    } catch (e) {
      console.error('Erro ao buscar posts:', e);
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchPosts(true);
  }, [selectedCategory, search]);

  const handleLike = async (id: string) => {
    try {
      await ForumService.likePost(id);
      setPosts((prev) => (prev ?? []).map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    } catch (e) {}
  };

  const handleShare = async (id: string) => {
    try {
      await ForumService.sharePost(id);
      setPosts((prev) => (prev ?? []).map((p) => p.id === id ? { ...p, shares: (p.shares ?? 0) + 1 } : p));
    } catch (e) {}
  };

  if (loading && page === 1) return <View style={[styles.centered, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}><ActivityIndicator color="#00FF9C" size="large" /></View>;

  const dynamicStyles = {
    container: { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' },
    title: { color: isDark ? '#FFF' : '#000' },
    searchContainer: { 
      backgroundColor: isDark ? '#161616' : '#FFF', 
      borderColor: isDark ? '#222' : '#EEE' 
    },
    searchInput: { color: isDark ? '#FFF' : '#000' },
    filterChip: { 
      backgroundColor: isDark ? '#161616' : '#FFF', 
      borderColor: isDark ? '#222' : '#EEE' 
    },
    postCard: { 
      backgroundColor: isDark ? '#161616' : '#FFF', 
      borderColor: isDark ? '#222' : '#EEE' 
    },
    userName: { color: isDark ? '#FFF' : '#000' },
    postContent: { color: isDark ? '#DDD' : '#444' },
    loadMore: { backgroundColor: isDark ? '#222' : '#FFF', borderColor: isDark ? '#222' : '#EEE', borderWidth: isDark ? 0 : 1 },
    footer: { borderTopColor: isDark ? '#222' : '#EEE' }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} tintColor="#00FF9C" />}
      >
        <Text style={[styles.title, dynamicStyles.title]}>Comunidade</Text>
        
        <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Pesquisar posts..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
           {CATEGORIES.map(cat => (
             <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, dynamicStyles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat)}
             >
                <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        <View style={styles.feed}>
          {(posts || []).length === 0 && !loading ? (
             <Text style={styles.emptyText}>Nenhum post encontrado nesta categoria.</Text>
          ) : (
            (posts || []).map((post) => (
              <Motion.View key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <TouchableOpacity 
                   style={[styles.postCard, dynamicStyles.postCard]}
                   onPress={() => router.push(`/post/${post.id}` as any)}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.avatar}><Text style={styles.avatarTxt}>{post.userName ? post.userName[0] : 'U'}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userName, dynamicStyles.userName]}>{post.userName || 'Membro VERDEVIA'}</Text>
                      <Text style={styles.postDate}>{post.category || 'Geral'} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '--/--/----'}</Text>
                    </View>
                    <View style={styles.viewCount}>
                      <Eye size={14} color="#666" />
                      <Text style={styles.viewTxt}>{post.views || 0}</Text>
                    </View>
                  </View>

                  <Text style={[styles.postContent, dynamicStyles.postContent]}>{post.content}</Text>

                  <View style={[styles.footer, dynamicStyles.footer]}>
                    <View style={styles.actionsBox}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                        <Heart size={18} color="#666" />
                        <Text style={styles.actionTxt}>{post.likes || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/post/${post.id}` as any)}>
                        <MessageSquare size={18} color="#666" />
                        <Text style={styles.actionTxt}>{post.commentsCount || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post.id)}>
                        <Share2 size={18} color="#666" />
                        <Text style={styles.actionTxt}>{post.shares || 0}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Motion.View>
            ))
          )}
        </View>

        {hasMore && !loading && (
          <TouchableOpacity style={[styles.loadMore, dynamicStyles.loadMore]} onPress={() => fetchPosts()}>
             <Text style={styles.loadMoreText}>Ver mais posts</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 150 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, paddingTop: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  filtersScroll: { marginBottom: 25 },
  filtersContent: { gap: 10 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  filterChipActive: { backgroundColor: '#00FF9C', borderColor: '#00FF9C' },
  filterText: { color: '#888', fontWeight: '600' },
  filterTextActive: { color: '#000' },
  feed: { gap: 16 },
  postCard: { borderRadius: 24, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(0, 255, 156, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00FF9C' },
  avatarTxt: { color: '#00FF9C', fontWeight: 'bold', fontSize: 18 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  postDate: { color: '#666', fontSize: 12 },
  viewCount: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewTxt: { color: '#666', fontSize: 12 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  footer: { borderTopWidth: 1, paddingTop: 15 },
  actionsBox: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionTxt: { color: '#666', fontSize: 14 },
  loadMore: { marginTop: 30, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  loadMoreText: { color: '#00FF9C', fontWeight: 'bold' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
  fab: { position: 'absolute', bottom: 110, right: 24, width: 65, height: 65, borderRadius: 20, backgroundColor: '#00FF9C', justifyContent: 'center', alignItems: 'center', shadowColor: '#00FF9C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }
});
