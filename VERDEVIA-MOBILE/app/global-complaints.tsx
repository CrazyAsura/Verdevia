import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Motion } from '@legendapp/motion';
import { Globe, MapPin, ChevronLeft, Calendar, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function GlobalComplaintsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/complaints')
      .then(res => {
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        setComplaints(items);
      })
      .catch(err => {
        console.error('Erro ao buscar queixas globais:', err);
        setComplaints([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFF',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#666' : '#888',
    border: isDark ? '#222' : '#EEE',
    accent: '#00FF9C',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
          >
            <ChevronLeft color={theme.accent} size={28} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>{t('global_complaints')}</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Explore incidentes ao redor do mundo</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={theme.accent} size="large" />
          </View>
        ) : (
          <View style={styles.list}>
            {complaints.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Globe size={48} color={theme.border} />
                <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhuma queixa pública encontrada.</Text>
              </View>
            ) : (
              complaints.map((item, index) => (
                <Motion.View 
                  key={item.id} 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, delay: index * 100 }}
                >
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => router.push(`/complaint/${item.id}` as any)}
                  >
                    <View style={styles.cardAccent} />
                    
                    <View style={styles.cardContent}>
                      <View style={styles.cardTop}>
                        <View style={[styles.tag, { backgroundColor: 'rgba(0, 255, 156, 0.1)' }]}>
                          <Globe size={12} color={theme.accent} />
                          <Text style={[styles.tagText, { color: theme.accent }]}>{t('public').toUpperCase()}</Text>
                        </View>
                        <View style={styles.dateRow}>
                          <Calendar size={12} color={theme.subtext} />
                          <Text style={[styles.dateText, { color: theme.subtext }]}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title || item.type || 'Sem título'}
                      </Text>

                      <View style={styles.cardFooter}>
                        <View style={styles.locationContainer}>
                          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9F9F9' }]}>
                            <MapPin size={14} color={theme.accent} />
                          </View>
                          <Text style={[styles.locationText, { color: theme.subtext }]} numberOfLines={1}>
                            {item.location}
                          </Text>
                        </View>
                        
                        <View style={styles.verifiedBadge}>
                          <ShieldCheck size={14} color={theme.accent} />
                          <Text style={[styles.verifiedText, { color: theme.accent }]}>IA Verificada</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Motion.View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    gap: 20, 
    marginBottom: 40 
  },
  backBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  loaderContainer: { marginTop: 100, alignItems: 'center' },
  list: { paddingHorizontal: 24, gap: 20 },
  card: { 
    borderRadius: 28, 
    borderWidth: 1, 
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
  },
  cardAccent: {
    width: 6,
    backgroundColor: '#00FF9C',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
