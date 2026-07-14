import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Shield, Download, Trash2, Info, Check } from 'lucide-react-native';
import api from '../services/api';
import { useTheme } from '@/context/ThemeContext';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';

type Consent = {
  purpose: string;
  status: boolean;
};

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = {
    background: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#111111',
    textSecondary: isDark ? '#A1A1AA' : '#666666',
    border: isDark ? '#222222' : '#EEEEEE',
    primary: '#00FF9C',
    success: '#00C853',
  };

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUserAndConsents();
  }, []);

  const loadUserAndConsents = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        Alert.alert('Sessao expirada', 'Entre novamente para acessar suas preferencias.');
        router.replace('/auth/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      const id = parsedUser.id || parsedUser._id;
      setUserId(id);

      const response = await api.get(`/compliance/users/${id}/consents`);
      const consents: Consent[] = response.data?.data || response.data || [];

      const analyticsConsent = consents.find((item) => item.purpose === 'ANALYTICS');
      const marketingConsent = consents.find((item) => item.purpose === 'MARKETING_NOTIFICATIONS');

      setAnalytics(Boolean(analyticsConsent?.status));
      setMarketing(Boolean(marketingConsent?.status));
    } catch (error) {
      console.error('Erro ao carregar privacidade:', error);
      Alert.alert('Erro', 'Nao foi possivel carregar suas preferencias de privacidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (purpose: string, value: boolean) => {
    if (!userId) {
      Alert.alert('Erro', 'Usuario nao identificado.');
      return;
    }

    const previousAnalytics = analytics;
    const previousMarketing = marketing;

    if (purpose === 'ANALYTICS') {
      setAnalytics(value);
    } else {
      setMarketing(value);
    }

    try {
      await api.post(`/compliance/users/${userId}/consents`, {
        updates: [{ purpose, status: value }],
      });
    } catch (error) {
      console.error('Erro ao atualizar consentimento:', error);
      setAnalytics(previousAnalytics);
      setMarketing(previousMarketing);
      Alert.alert('Erro', 'Nao foi possivel atualizar sua preferencia.');
    }
  };

  const handleExportData = async () => {
    if (!userId || exporting) return;

    setExporting(true);
    try {
      const response = await api.get(`/compliance/users/${userId}/export`);
      const payload = response.data?.data || response.data;
      const formatted = JSON.stringify(payload, null, 2);

      await Share.share({
        title: 'Meus Dados VERDEVIA - Portabilidade',
        message: formatted,
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Nao foi possivel exportar seus dados agora.');
    } finally {
      setExporting(false);
    }
  };

  const handleAnonymizeAccount = () => {
    Alert.alert(
      'Anonimizar e excluir conta',
      'Esta acao remove seus dados pessoais da conta e nao pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: executeAnonymize,
        },
      ]
    );
  };

  const executeAnonymize = async () => {
    if (!userId || deleting) return;

    setDeleting(true);
    try {
      await api.post(`/compliance/users/${userId}/anonymize`);
      await AsyncStorage.clear();
      Alert.alert('Conta anonimizada', 'Seus dados pessoais foram removidos.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error) {
      console.error('Erro ao anonimizar conta:', error);
      Alert.alert('Erro', 'Nao foi possivel concluir a solicitacao.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Box className="px-6 pt-14 pb-6">
          <HStack className="items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}
            >
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Heading size="xl" style={{ color: theme.text }}>
              Privacidade de Dados
            </Heading>
          </HStack>

          <VStack space="lg">
            <Box className="p-5 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
              <HStack className="items-start">
                <Box
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <Shield size={24} color={theme.primary} />
                </Box>
                <VStack className="flex-1">
                  <Text className="font-bold text-lg mb-1" style={{ color: theme.text }}>
                    Seus dados, suas escolhas
                  </Text>
                  <Text className="text-sm leading-5" style={{ color: theme.textSecondary }}>
                    Gerencie consentimentos, exporte suas informacoes e solicite a exclusao dos dados pessoais conforme a LGPD.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <VStack space="md">
              <Text className="font-bold text-lg" style={{ color: theme.text }}>
                Consentimentos essenciais
              </Text>

              <Box className="p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
                <HStack className="items-center justify-between">
                  <VStack className="flex-1 pr-3">
                    <Text className="font-semibold" style={{ color: theme.text }}>
                      Termos de uso
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Necessario para uso da plataforma.
                    </Text>
                  </VStack>
                  <Check size={22} color={theme.success} />
                </HStack>
              </Box>

              <Box className="p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
                <HStack className="items-center justify-between">
                  <VStack className="flex-1 pr-3">
                    <Text className="font-semibold" style={{ color: theme.text }}>
                      Politica de privacidade
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Necessaria para tratamento basico dos dados.
                    </Text>
                  </VStack>
                  <Check size={22} color={theme.success} />
                </HStack>
              </Box>
            </VStack>

            <VStack space="md">
              <Text className="font-bold text-lg" style={{ color: theme.text }}>
                Preferencias opcionais
              </Text>

              <Box className="p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
                <HStack className="items-center justify-between">
                  <VStack className="flex-1 pr-4">
                    <Text className="font-semibold" style={{ color: theme.text }}>
                      Analises de uso
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Permite melhorar o aplicativo com metricas agregadas de navegacao.
                    </Text>
                  </VStack>
                  <Switch
                    value={analytics}
                    onValueChange={(value) => handleToggleConsent('ANALYTICS', value)}
                  />
                </HStack>
              </Box>

              <Box className="p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
                <HStack className="items-center justify-between">
                  <VStack className="flex-1 pr-4">
                    <Text className="font-semibold" style={{ color: theme.text }}>
                      Comunicacoes e marketing
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Receba novidades, recompensas, eventos e campanhas ambientais.
                    </Text>
                  </VStack>
                  <Switch
                    value={marketing}
                    onValueChange={(value) => handleToggleConsent('MARKETING_NOTIFICATIONS', value)}
                  />
                </HStack>
              </Box>
            </VStack>

            <VStack space="md">
              <Text className="font-bold text-lg" style={{ color: theme.text }}>
                Direitos do titular de dados
              </Text>

              <TouchableOpacity
                onPress={handleExportData}
                disabled={exporting}
                className="p-4 rounded-2xl"
                style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, opacity: exporting ? 0.7 : 1 }}
              >
                <HStack className="items-center">
                  <Box
                    className="w-11 h-11 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: theme.primary + '20' }}
                  >
                    {exporting ? (
                      <ActivityIndicator color={theme.primary} />
                    ) : (
                      <Download size={22} color={theme.primary} />
                    )}
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-semibold" style={{ color: theme.text }}>
                      Portabilidade dos dados
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Exporte uma copia dos seus dados em formato estruturado.
                    </Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAnonymizeAccount}
                disabled={deleting}
                className="p-4 rounded-2xl"
                style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, opacity: deleting ? 0.7 : 1 }}
              >
                <HStack className="items-center">
                  <Box
                    className="w-11 h-11 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    {deleting ? (
                      <ActivityIndicator color="#DC2626" />
                    ) : (
                      <Trash2 size={22} color="#DC2626" />
                    )}
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-semibold" style={{ color: '#DC2626' }}>
                      Anonimizacao e exclusao
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      Solicite a remocao permanente dos dados pessoais da sua conta.
                    </Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>
            </VStack>

            <Box className="p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
              <HStack className="items-start">
                <Info size={20} color={theme.primary} style={{ marginRight: 12, marginTop: 2 }} />
                <Text className="flex-1 text-sm leading-5" style={{ color: theme.textSecondary }}>
                  Para duvidas sobre o tratamento de dados, entre em contato com o encarregado de protecao de dados da VERDEVIA pelos canais oficiais.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
