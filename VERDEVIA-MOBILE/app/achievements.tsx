import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Award, ChevronLeft, Crown, Flame, ShieldCheck, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { buildAchievements, getLevelProgress } from '@/utils/gamification';

const { width } = Dimensions.get('window');

const iconMap: any = {
  Award,
  Crown,
  Flame,
  ShieldCheck,
  Star,
  Zap,
};

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      const [userResp, achievementsResp] = await Promise.all([
        api.get(`/users/${parsed.id}`),
        api.get(`/users/${parsed.id}/achievements`).catch(() => ({ data: [] })),
      ]);

      const profile = userResp.data;
      const localAchievements = buildAchievements(profile);
      const apiAchievements = Array.isArray(achievementsResp.data) ? achievementsResp.data : [];

      setUser(profile);
      setBadges(
        localAchievements.map((local) => {
          const remote = apiAchievements.find((item: any) => item.id === local.id || item.label === local.label);
          return {
            ...local,
            ...remote,
            unlocked: remote?.unlocked ?? (remote?.lock === false) ?? local.unlocked,
            lock: remote?.lock ?? !local.unlocked,
            progress: remote?.progress ?? local.progress,
            status: remote?.status ?? local.status,
          };
        })
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar conquistas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !user) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00FF9C" />
      </View>
    );
  }

  const xp = user.xp || user.points || 0;
  const levelProgress = getLevelProgress(xp);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#00FF9C" size={30} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('my_achievements') || 'Minhas Conquistas'}</Text>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>{t('level') || 'Nivel'} {levelProgress.level.toString().padStart(2, '0')}</Text>
        <Text style={styles.points}>{xp.toLocaleString()} <Text style={styles.xpText}>XP</Text></Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${levelProgress.percent}%` }]} />
        </View>
        <Text style={styles.progressSub}>
          {levelProgress.remainingXp} XP para o Nivel {levelProgress.level + 1}
        </Text>
      </View>

      <View style={styles.grid}>
        {badges.map((item: any, index: number) => {
          const unlocked = item.unlocked ?? !item.lock;
          const IconComp = iconMap[item.icon] || Award;

          return (
            <View key={item.id ?? index} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
              <View style={[styles.iconCircle, { backgroundColor: unlocked ? 'rgba(0, 255, 156, 0.1)' : '#111' }]}>
                <IconComp size={30} color={unlocked ? '#00FF9C' : '#444'} />
              </View>
              <Text style={[styles.badgeLabel, !unlocked && { color: '#666' }]}>{item.label}</Text>
              <Text style={styles.badgeDesc}>{item.description}</Text>
              <Text style={styles.badgeStatus}>{item.status}</Text>
              {typeof item.progress === 'number' && (
                <View style={styles.badgeProgress}>
                  <View style={[styles.badgeFill, { width: `${Math.min(1, item.progress) * 100}%` }]} />
                </View>
              )}
              <Text style={styles.rewardText}>{item.reward}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 15, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  levelCard: { margin: 24, padding: 30, backgroundColor: '#161616', borderRadius: 30, borderWidth: 1, borderColor: '#222' },
  levelLabel: { color: '#00FF9C', fontWeight: 'bold', fontSize: 13, letterSpacing: 2, marginBottom: 10 },
  points: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  xpText: { fontSize: 16, color: '#666' },
  progressBar: { height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 25, marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00FF9C' },
  progressSub: { color: '#666', fontSize: 12 },
  grid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  badgeCard: { width: (width - 63) / 2, minHeight: 230, backgroundColor: '#161616', padding: 18, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  badgeLocked: { opacity: 0.6 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  badgeLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginBottom: 6 },
  badgeDesc: { color: '#777', fontSize: 11, lineHeight: 15, textAlign: 'center', marginBottom: 8 },
  badgeStatus: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  badgeProgress: { width: '80%', height: 4, backgroundColor: '#222', borderRadius: 2, marginTop: 10 },
  badgeFill: { height: '100%', backgroundColor: '#00FF9C' },
  rewardText: { color: '#00FF9C', fontSize: 10, fontWeight: '900', marginTop: 10, textAlign: 'center' },
});
