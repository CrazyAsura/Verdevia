import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { Motion } from '@legendapp/motion';
import { Award, Lock, CheckCircle2, Crown, ChevronLeft, Zap, Gift, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { REWARD_PASS, getPassProgress, getLevelProgress } from '@/utils/gamification';

export default function RewardPassScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState(REWARD_PASS);
  const [user, setUser] = useState({ level: 1, xp: 0, isPremium: false });

  const fetchData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const userResp = await api.get(`/users/${parsed.id}`);
        setUser(userResp.data);
      }

      try {
        const rewardsResp = await api.get('/users/reward-pass/levels');
        if (Array.isArray(rewardsResp.data) && rewardsResp.data.length > 0) {
          setRewards(
            rewardsResp.data.map((item: any) => ({
              level: item.level,
              xpRequired: item.xpRequired ?? REWARD_PASS[item.level - 1]?.xpRequired ?? 0,
              free: typeof item.free === 'string'
                ? { label: item.free, kind: 'badge', value: item.free }
                : item.free,
              premium: typeof item.premium === 'string'
                ? { label: item.premium, kind: 'badge', value: item.premium }
                : item.premium,
            }))
          );
        }
      } catch {
        setRewards(REWARD_PASS);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar o Passe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePremiumUpgrade = () => {
    Alert.alert(
      "Premium ECOA",
      "O upgrade premium ainda não está disponível neste ambiente. Continue evoluindo no passe para desbloquear recompensas gratuitas."
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00FF9C" />
      </View>
    );
  }

  const xp = user.xp || 0;
  const levelProgress = getLevelProgress(xp);
  const passProgress = getPassProgress(xp);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{t('reward_pass')}</Text>
          <Text style={styles.subtitle}>{t('season1')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!user.isPremium && (
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1542601906-973ad30ed289?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.heroCard}
            imageStyle={{ borderRadius: 30, opacity: 0.6 }}
          >
            <View style={styles.heroOverlay}>
              <Crown color="#FFD700" size={32} fill="#FFD700" />
              <Text style={styles.heroTitle}>{t('upgrade_premium')}</Text>
              <Text style={styles.heroDesc}>{t('upgrade_desc')}</Text>
              <TouchableOpacity style={styles.premiumBtn} onPress={handlePremiumUpgrade}>
                  <Text style={styles.premiumBtnTxt}>{t('be_premium')}</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        )}

        <View style={styles.trackTop}>
          <View>
            <Text style={styles.trackTitle}>{t('pass_progress')}</Text>
            <Text style={styles.trackSubtitle}>{passProgress.claimedCount}/{passProgress.totalCount} recompensas liberadas</Text>
          </View>
          <View style={styles.levelBadgeBox}>
            {user.isPremium && <Crown size={12} color="#FFD700" fill="#FFD700" />}
            <Text style={styles.levelBadge}>{t('level')} {user.level}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Temporada Renascimento</Text>
              <Text style={styles.progressTitle}>{xp.toLocaleString()} XP</Text>
            </View>
            <View style={styles.progressIcon}>
              <Sparkles size={22} color="#000" />
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${passProgress.passPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {passProgress.nextReward
              ? `${passProgress.nextReward.xpRequired - xp} XP para liberar o nivel ${passProgress.nextReward.level}`
              : 'Passe completo. Todas as recompensas foram liberadas.'}
          </Text>
          <Text style={styles.progressText}>
            Proximo nivel de conta: {levelProgress.remainingXp} XP restantes
          </Text>
        </View>

        <View style={styles.levelsList}>
          {rewards.map((item: any, index: number) => {
            const isReached = xp >= (item.xpRequired ?? 0);
            const freeReward = typeof item.free === 'string' ? item.free : item.free?.label;
            const premiumReward = typeof item.premium === 'string' ? item.premium : item.premium?.label;
            return (
              <Motion.View 
                key={item.level} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 100 }}
                style={[styles.levelRow, !isReached && styles.lockedRow]}
              >
                <View style={styles.levelMarker}>
                  <Text style={styles.levelNum}>{item.level}</Text>
                  <View style={[styles.connector, index === rewards.length - 1 && { height: 0 } ]} />
                </View>

                <View style={styles.rewardsBox}>
                  <View style={styles.levelMeta}>
                    <Gift size={14} color={isReached ? '#00FF9C' : '#555'} />
                    <Text style={styles.levelMetaText}>{item.xpRequired?.toLocaleString?.() ?? 0} XP</Text>
                  </View>
                  <View style={styles.rewardCard}>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardLabel}>{t('free')}</Text>
                      <Text style={styles.rewardName}>{freeReward}</Text>
                    </View>
                    {isReached ? <CheckCircle2 color="#00FF9C" size={20} /> : <Lock color="#333" size={18} />}
                  </View>

                  <View style={[styles.rewardCard, styles.premiumCard]}>
                    <View style={styles.rewardInfo}>
                      <View style={styles.premiumRow}>
                        <Crown color="#FFD700" size={10} fill="#FFD700" />
                        <Text style={[styles.rewardLabel, { color: '#FFD700' }]}>{t('premium')}</Text>
                      </View>
                      <Text style={styles.rewardName}>{premiumReward}</Text>
                    </View>
                    {isReached && user.isPremium ? <CheckCircle2 color="#FFD700" size={20} /> : <Lock color="#FFD700" size={18} opacity={0.5} />}
                  </View>
                </View>
              </Motion.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070707' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 15, marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#00FF9C', fontWeight: 'bold' },
  content: { padding: 24, paddingBottom: 100 },
  heroCard: { height: 200, marginBottom: 40, overflow: 'hidden' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 25, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  heroDesc: { color: '#CCC', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  premiumBtn: { backgroundColor: '#FFD700', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  premiumBtnTxt: { color: '#000', fontWeight: 'bold' },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  trackTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  trackSubtitle: { color: '#666', fontSize: 12, marginTop: 4 },
  levelBadgeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  levelBadge: { color: '#00FF9C', fontWeight: 'bold' },
  progressCard: { backgroundColor: '#101010', borderWidth: 1, borderColor: '#222', borderRadius: 24, padding: 20, marginBottom: 32 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#666', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  progressTitle: { color: '#FFF', fontSize: 30, fontWeight: '900', marginTop: 4 },
  progressIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#00FF9C', alignItems: 'center', justifyContent: 'center' },
  progressBar: { height: 8, backgroundColor: '#222', borderRadius: 999, overflow: 'hidden', marginTop: 18, marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#00FF9C' },
  progressText: { color: '#777', fontSize: 12, marginTop: 3, fontWeight: '600' },
  levelsList: { gap: 0 },
  levelRow: { flexDirection: 'row', marginBottom: 35 },
  lockedRow: { opacity: 0.5 },
  levelMarker: { alignItems: 'center', marginRight: 20, width: 40 },
  levelNum: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', color: '#FFF', textAlign: 'center', lineHeight: 40, fontWeight: 'bold', borderWidth: 1, borderColor: '#333' },
  connector: { width: 2, flex: 1, backgroundColor: '#1A1A1A', marginTop: 5 },
  rewardsBox: { flex: 1, gap: 10 },
  levelMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  levelMetaText: { color: '#666', fontSize: 11, fontWeight: '800' },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  premiumCard: { borderColor: 'rgba(255, 215, 0, 0.2)', backgroundColor: 'rgba(255, 215, 0, 0.05)' },
  rewardInfo: { flex: 1 },
  rewardLabel: { fontSize: 10, fontWeight: 'bold', color: '#666', marginBottom: 4 },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rewardName: { color: '#FFF', fontSize: 15, fontWeight: '600' }
});
