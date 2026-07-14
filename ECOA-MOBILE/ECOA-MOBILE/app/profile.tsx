import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Motion } from '@legendapp/motion';
import {
  Settings, Shield, Award,
  ChevronRight, LogOut, Star, Edit3, Zap
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Components
import { ProfileFrame } from '@/components/profile/profile-frame';
import { CustomizationModal } from '@/components/profile/customization-modal';

// Gluestack Components
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';

import { useTheme } from '@/context/ThemeContext';
import {
  getDefaultTitle,
  getLevelProgress,
  getPassProgress,
  getUnlockedCustomizations,
} from '@/utils/gamification';

type CustomizationItem = {
  id: string;
  name: string;
  type: 'title' | 'frame';
  value: string;
};

const getLocalProfileKey = (userId: string) => `profile-draft-${userId}`;
const getCustomizationKey = (userId: string) => `profile-customization-${userId}`;
const getPendingCustomizationKey = (userId: string) => `profile-customization-pending-${userId}`;
const normalizeStoredUser = (userData: any) => ({
  ...userData,
  id: userData?.userId || userData?.id || userData?._id,
});

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unlockedItems, setUnlockedItems] = useState<CustomizationItem[]>([]);
  const [user, setUser] = useState({
    id: '',
    name: '...',
    level: 1,
    xp: 0,
    title: '...',
    frame: '',
    photoUrl: '',
  });

  const resolveUserId = async (userData: any) => {
    if (!userData?.id) return null;

    try {
      await api.get(`/users/profile/${userData.id}`);
      return userData.id;
    } catch (error: any) {
      if (error?.response?.status !== 404 || !userData.email) {
        throw error;
      }
    }

    const resolveResponse = await api.get('/users/resolve-by-email', {
      params: { email: userData.email },
    });
    const matchedUser = resolveResponse.data;

    if (!matchedUser?.id) return null;

    const staleDraft = await AsyncStorage.getItem(getLocalProfileKey(userData.id));
    if (staleDraft) {
      await AsyncStorage.setItem(getLocalProfileKey(matchedUser.id), staleDraft);
    }

    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        ...userData,
        id: matchedUser.id,
      })
    );
    return matchedUser.id;
  };

  const syncPendingCustomization = async (userId: string) => {
    const pendingRaw = await AsyncStorage.getItem(getPendingCustomizationKey(userId));
    if (!pendingRaw) return;

    const pending = JSON.parse(pendingRaw);
    await api.patch(`/users/profile/${userId}`, pending);
    await AsyncStorage.removeItem(getPendingCustomizationKey(userId));
  };

  const fetchProfile = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        router.replace('/auth/login');
        return;
      }
      const userData = normalizeStoredUser(JSON.parse(storedUser));
      const resolvedUserId = await resolveUserId(userData);
      if (!resolvedUserId) {
        router.replace('/auth/login');
        return;
      }

      try {
        await syncPendingCustomization(resolvedUserId);
      } catch (error) {
        console.warn('Customização pendente ainda não sincronizada:', error);
      }

      const response = await api.get(`/users/profile/${resolvedUserId}`);
      const data = response.data;
      const localProfileRaw = await AsyncStorage.getItem(getLocalProfileKey(resolvedUserId));
      const localProfile = localProfileRaw ? JSON.parse(localProfileRaw) : {};
      const profileData = {
        ...data,
        ...localProfile,
        id: resolvedUserId,
        address: {
          ...(data.address ?? {}),
          ...(localProfile.address ?? {}),
        },
        phones: localProfile.phones ?? data.phones,
      };
      const localCustomizationRaw = await AsyncStorage.getItem(getCustomizationKey(profileData.id));
      const localCustomization = localCustomizationRaw ? JSON.parse(localCustomizationRaw) : {};
      const xp = profileData.xp || profileData.points || 0;
      const profileWithCustomization = {
        ...profileData,
        activeTitle: localCustomization.activeTitle || profileData.activeTitle,
        avatarFrame: localCustomization.avatarFrame || profileData.avatarFrame,
      };
      const levelProgress = getLevelProgress(xp);
      const unlocked = getUnlockedCustomizations(profileWithCustomization);

      setUser({
        id: profileData.id,
        name: profileData.realName || profileData.name || 'Usuário ECOA',
        level: levelProgress.level,
        xp,
        title: getDefaultTitle(profileWithCustomization),
        frame: profileWithCustomization.avatarFrame || '',
        photoUrl: profileData.localAvatarUrl || profileData.avatarUrl || profileData.profilePhoto || '',
      });
      setUnlockedItems(unlocked);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleSelectCustomization = async (item: CustomizationItem) => {
    if (item.type === 'title') setUser(prev => ({ ...prev, title: item.value }));
    if (item.type === 'frame') setUser(prev => ({ ...prev, frame: item.value }));
    setModalVisible(false);

    try {
      await AsyncStorage.mergeItem(
        getCustomizationKey(user.id),
        JSON.stringify({
          ...(item.type === 'title' && { activeTitle: item.value }),
          ...(item.type === 'frame' && { avatarFrame: item.value }),
        })
      );

      await api.patch(`/users/profile/${user.id}`, {
        ...(item.type === 'title' && { activeTitle: item.value }),
        ...(item.type === 'frame' && { avatarFrame: item.value }),
      });
      await AsyncStorage.removeItem(getPendingCustomizationKey(user.id));
    } catch (error) {
      await AsyncStorage.mergeItem(
        getPendingCustomizationKey(user.id),
        JSON.stringify({
          ...(item.type === 'title' && { activeTitle: item.value }),
          ...(item.type === 'frame' && { avatarFrame: item.value }),
        })
      );
      Alert.alert('Salvo neste aparelho', 'A personalizacao foi aplicada localmente, mas nao foi sincronizada com o servidor.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/auth/login');
  };

  const levelProgress = getLevelProgress(user.xp);
  const passProgress = getPassProgress(user.xp);



  if (loading) {
    return (
      <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'} items-center justify-center`}>
        <ActivityIndicator color="#00FF9C" size="large" />
      </Box>
    );
  }

  return (
    <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor="#00FF9C" />}
      >
        <VStack className="items-center pt-16 px-6 mb-10">
          <Box className="relative">
            <ProfileFrame photoUrl={user.photoUrl || undefined} frameUrl={user.frame} size={140} />
            <TouchableOpacity
              style={{ position: 'absolute', bottom: 5, right: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: '#00FF9C', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: isDark ? '#0A0A0A' : '#F8F9FA' }}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Edit3 size={16} color="#000" />
            </TouchableOpacity>
          </Box>

          <Motion.View initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignItems: 'center', marginTop: 20 }}>
            <Heading className={`${isDark ? 'text-white' : 'text-black'} text-2xl font-bold text-center`}>{user.name}</Heading>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <HStack className="items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl mt-2">
                <Star size={12} color="#00FF9C" fill="#00FF9C" />
                <Text className="text-[#00FF9C] text-xs font-bold tracking-wider">{user.title}</Text>
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/edit-profile')}
              className="mt-4 bg-[#00FF9C]/10 border border-[#00FF9C]/30 px-6 py-2.5 rounded-full"
            >
              <HStack className="items-center gap-2">
                <Edit3 size={14} color="#00FF9C" />
                <Text className="text-[#00FF9C] text-xs font-black uppercase tracking-widest">Editar Perfil</Text>
              </HStack>
            </TouchableOpacity>
          </Motion.View>

          <Box className={`w-full mt-8 ${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE] shadow-sm'} p-5 rounded-[24px] border`}>
            <HStack className="justify-between mb-3">
              <Text className={`${isDark ? 'text-white' : 'text-black'} font-bold text-base`}>{t('level')} {user.level}</Text>
              <Text className={`${isDark ? 'text-[#666]' : 'text-[#888]'} text-sm`}>{user.xp} {t('xp_total')}</Text>
            </HStack>
            <Progress value={levelProgress.percent} className={`${isDark ? 'bg-[#222]' : 'bg-[#EEE]'} h-2`}>
              <ProgressFilledTrack className="bg-[#00FF9C]" />
            </Progress>
            <HStack className="justify-between mt-3">
              <Text className={`${isDark ? 'text-[#666]' : 'text-[#888]'} text-xs font-semibold`}>
                {levelProgress.remainingXp} XP para o nivel {levelProgress.level + 1}
              </Text>
              <Text className="text-[#00FF9C] text-xs font-black">
                {levelProgress.percent}%
              </Text>
            </HStack>
          </Box>

          <Box className={`w-full mt-4 ${isDark ? 'bg-[#101010] border-[#222]' : 'bg-white border-[#EEE] shadow-sm'} p-5 rounded-[24px] border`}>
            <HStack className="justify-between items-center">
              <VStack className="flex-1 pr-4">
                <Text className="text-[#00FF9C] text-[10px] font-black uppercase tracking-widest">Passe ECOA</Text>
                <Text className={`${isDark ? 'text-white' : 'text-black'} font-bold mt-1`}>
                  Nivel {passProgress.currentPassLevel} da temporada
                </Text>
                <Text className={`${isDark ? 'text-[#777]' : 'text-[#777]'} text-xs mt-1`}>
                  {passProgress.nextReward
                    ? `${passProgress.nextReward.xpRequired - user.xp} XP para ${passProgress.nextReward.free.label}`
                    : 'Todas as recompensas liberadas'}
                </Text>
              </VStack>
              <Box className="w-14 h-14 rounded-2xl bg-amber-400/10 items-center justify-center">
                <Zap size={24} color="#FFD700" />
              </Box>
            </HStack>
            <Progress value={passProgress.passPercent} className={`${isDark ? 'bg-[#222]' : 'bg-[#EEE]'} h-2 mt-4`}>
              <ProgressFilledTrack className="bg-[#FFD700]" />
            </Progress>
          </Box>
        </VStack>

        <VStack className="px-6 gap-4">
          <Text className={`${isDark ? 'text-[#666]' : 'text-[#999]'} text-xs font-bold uppercase tracking-widest ml-1 mb-2`}>{t('account_rewards')}</Text>
          {[
            { icon: Zap, label: t('reward_pass'), route: '/reward-pass', color: '#FFD700' },
            { icon: Award, label: t('my_achievements'), route: '/achievements', color: '#00FF9C' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
            >
              <Box className={`flex-row items-center ${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE] shadow-sm'} p-4 rounded-[20px] border`}>
                <Box className="w-11 h-11 rounded-xl bg-emerald-500/5 items-center justify-center mr-4">
                  <item.icon size={22} color={item.color} />
                </Box>
                <Text className={`flex-1 ${isDark ? 'text-[#DDD]' : 'text-[#333]'} text-lg font-semibold`}>{item.label}</Text>
                <ChevronRight size={20} color="#333" />
              </Box>
            </TouchableOpacity>
          ))}

          <Text className={`${isDark ? 'text-[#666]' : 'text-[#999]'} text-xs font-bold uppercase tracking-widest ml-1 mt-6 mb-2`}>{t('settings')}</Text>
          {[
            { icon: Shield, label: t('security_privacy'), route: '/security', color: '#00FF9C' },
            { icon: Settings, label: t('settings'), route: '/settings', color: '#00FF9C' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
            >
              <Box className={`flex-row items-center ${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE] shadow-sm'} p-4 rounded-[20px] border`}>
                <Box className="w-11 h-11 rounded-xl bg-emerald-500/5 items-center justify-center mr-4">
                  <item.icon size={22} color={item.color} />
                </Box>
                <Text className={`flex-1 ${isDark ? 'text-[#DDD]' : 'text-[#333]'} text-lg font-semibold`}>{item.label}</Text>
                <ChevronRight size={20} color="#333" />
              </Box>
            </TouchableOpacity>
          ))}
        </VStack>

        <TouchableOpacity onPress={handleLogout}>
          <HStack className="items-center justify-center gap-2 mt-12 p-5">
            <LogOut size={20} color="#FF4B4B" />
            <Text className="text-[#FF4B4B] text-lg font-bold">{t('logout')}</Text>
          </HStack>
        </TouchableOpacity>

        <CustomizationModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          unlockedItems={unlockedItems}
          activeTitle={user.title}
          activeFrame={user.frame}
          onSelect={handleSelectCustomization}
        />
      </ScrollView>
    </Box>
  );
}
