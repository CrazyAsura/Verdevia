import React from 'react';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, Bell, Moon, Sun, Languages, Smartphone, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { useTheme } from '@/context/ThemeContext';

const NOTIFICATIONS_KEY = 'user-notifications-enabled';
const LANGUAGE_KEY = 'user-language';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isDark, toggleColorMode } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [savingNotifications, setSavingNotifications] = React.useState(false);

  React.useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (savedPreference !== null) {
          setNotifications(savedPreference === 'true');
        }
      } catch (error) {
        console.warn('Erro ao carregar notificacoes:', error);
      }
    };

    loadNotificationPreference();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    const previousValue = notifications;
    setNotifications(value);
    setSavingNotifications(true);

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
    } catch (error) {
      console.warn('Erro ao salvar notificacoes:', error);
      setNotifications(previousValue);
      Alert.alert('Erro', 'Nao foi possivel salvar a preferencia de notificacoes.');
    } finally {
      setSavingNotifications(false);
    }
  };

  const toggleLanguage = async () => {
    const currentLanguage = i18n.language?.startsWith('pt') ? 'pt' : 'en';
    const nextLang = currentLanguage === 'pt' ? 'en' : 'pt';

    try {
      await i18n.changeLanguage(nextLang);
      await AsyncStorage.setItem(LANGUAGE_KEY, nextLang);
    } catch (error) {
      console.warn('Erro ao alterar idioma:', error);
      Alert.alert('Erro', 'Nao foi possivel alterar o idioma.');
    }
  };

  const handleThemeToggle = () => {
    toggleColorMode();
  };

  const openAppInfo = () => {
    Alert.alert('ECOA', 'Aplicativo ECOA - versao 1.0.5');
  };

  const openVersionInfo = () => {
    Alert.alert('Versao', 'Voce esta usando a versao 1.0.5 do aplicativo ECOA.');
  };

  const currentLangName = i18n.language?.startsWith('pt') ? 'Portugues (BR)' : 'English (US)';
  const cardClass = `${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE]'} p-4 rounded-[20px] border`;
  const textClass = isDark ? 'text-white' : 'text-black';
  const secondaryTextClass = isDark ? 'text-[#666]' : 'text-[#888]';

  return (
    <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HStack className="pt-16 pb-8 px-6 items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
            <Box className={`${isDark ? 'bg-[#161616]' : 'bg-white'} w-11 h-11 rounded-2xl items-center justify-center border ${isDark ? 'border-[#222]' : 'border-[#EEE]'}`}>
              <ChevronLeft color="#00FF9C" size={24} />
            </Box>
          </TouchableOpacity>
          <Heading className={`${textClass} text-2xl font-bold`}>{t('settings')}</Heading>
        </HStack>

        <VStack className="px-6 mb-8 gap-4">
          <Text className={`${isDark ? 'text-[#666]' : 'text-[#999]'} text-xs font-bold uppercase tracking-widest ml-1`}>
            {t('preferences')}
          </Text>

          <Box className={cardClass}>
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-4 flex-1 pr-3">
                <Box className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Bell size={20} color="#00FF9C" />
                </Box>
                <Text className={`${textClass} font-medium text-lg flex-1`}>{t('notifications')}</Text>
              </HStack>
              <Switch
                value={notifications}
                disabled={savingNotifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#333', true: '#00FF9C' }}
                size="sm"
              />
            </HStack>
          </Box>

          <Box className={cardClass}>
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-4 flex-1 pr-3">
                <Box className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                  {isDark ? <Moon size={20} color="#00FF9C" /> : <Sun size={20} color="#00FF9C" />}
                </Box>
                <Text className={`${textClass} font-medium text-lg flex-1`}>{t('dark_mode')}</Text>
              </HStack>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#DDD', true: '#00FF9C' }}
                size="sm"
              />
            </HStack>
          </Box>

          <TouchableOpacity onPress={toggleLanguage} accessibilityRole="button">
            <Box className={cardClass}>
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-4 flex-1 pr-3">
                  <Box className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <Languages size={20} color="#00FF9C" />
                  </Box>
                  <Text className={`${textClass} font-medium text-lg flex-1`}>{t('language')}</Text>
                </HStack>
                <Text className={`${secondaryTextClass} text-sm`}>{currentLangName}</Text>
              </HStack>
            </Box>
          </TouchableOpacity>
        </VStack>

        <VStack className="px-6 mb-8 gap-4">
          <Text className={`${isDark ? 'text-[#666]' : 'text-[#999]'} text-xs font-bold uppercase tracking-widest ml-1`}>
            {t('app')}
          </Text>

          <TouchableOpacity onPress={openAppInfo} accessibilityRole="button">
            <Box className={cardClass}>
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-4 flex-1 pr-3">
                  <Box className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <Smartphone size={20} color="#00FF9C" />
                  </Box>
                  <Text className={`${textClass} font-medium text-lg flex-1`}>{t('app_name')}</Text>
                </HStack>
                <Text className={`${secondaryTextClass} text-sm font-bold uppercase`}>ECOA</Text>
              </HStack>
            </Box>
          </TouchableOpacity>

          <TouchableOpacity onPress={openVersionInfo} accessibilityRole="button">
            <Box className={cardClass}>
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-4 flex-1 pr-3">
                  <Box className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <Info size={20} color="#00FF9C" />
                  </Box>
                  <Text className={`${textClass} font-medium text-lg flex-1`}>{t('version')}</Text>
                </HStack>
                <Text className={`${secondaryTextClass} text-sm`}>1.0.5</Text>
              </HStack>
            </Box>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </Box>
  );
}
