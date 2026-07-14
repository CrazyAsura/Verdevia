import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Motion } from '@legendapp/motion';
import { PlayCircle, Clock, BookOpen, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useCourses } from '../hooks/useCourses';

export default function CoursesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  
  const { courses, loading, refreshing, onRefresh } = useCourses();

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}>
      <ActivityIndicator color="#00FF9C" size="large" />
    </View>
  );

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFF',
    border: isDark ? '#222' : '#EEE',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#888' : '#666'
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#00FF9C" 
        />
      }
    >
      <Text style={[styles.title, { color: theme.text }]}>Cursos</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>
        Aprenda sobre sustentabilidade e impacto ambiental.
      </Text>

      <View style={styles.grid}>
        {courses.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum curso disponível no momento.</Text>
        ) : (
          courses.map((course, index) => (
            <Motion.View 
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/course/${course.id}` as any)}
              >
                <View style={styles.cardVisual}>
                   <PlayCircle size={40} color="#00FF9C" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardLevel}>{course.level}</Text>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{course.title}</Text>
                  <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                      <BookOpen size={14} color="#666" />
                      <Text style={styles.statText}>{course.modulesCount} módulos</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.statText}>{course.duration}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight color="#333" size={24} style={styles.chevron} />
              </TouchableOpacity>
            </Motion.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 150 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, paddingTop: 40 },
  subtitle: { fontSize: 16, marginBottom: 40 },
  grid: { gap: 20 },
  card: { borderRadius: 24, padding: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardVisual: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(0, 255, 156, 0.08)', justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, paddingLeft: 20 },
  cardLevel: { color: '#00FF9C', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  cardStats: { flexDirection: 'row', gap: 15 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: '#666', fontSize: 12 },
  chevron: { marginRight: 10 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 }
});
