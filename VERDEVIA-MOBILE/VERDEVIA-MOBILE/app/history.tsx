import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Motion } from '@legendapp/motion';
import { CheckCircle2, Clock, AlertTriangle, Trash2, Edit3 } from 'lucide-react-native';
import api from '../services/api';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

// Gluestack Components
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';

interface Complaint {
  id: string;
  type: string;
  location: string;
  status: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.items || response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      t('confirm_delete'),
      t('delete_desc'),
      [
        { text: t('cancel'), style: "cancel" },
        { 
          text: t('delete'), 
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Tentando excluir queixa:', id);
              const response = await api.delete(`/complaints/${id}`);
              console.log('Resultado da exclusão:', response.data);
              setComplaints(prev => prev.filter(c => c.id !== id));
            } catch (e: any) {
              console.error('Erro ao excluir:', e?.response?.data || e.message);
              Alert.alert("Erro", t('error_delete'));
            }
          }
        }
      ]
    );
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'resolved': return { color: '#00FF9C', label: t('status_resolved'), icon: CheckCircle2 };
      case 'analyzing': return { color: '#FFD700', label: t('status_analyzing'), icon: Clock };
      default: return { color: '#FF4B4B', label: t('status_pending'), icon: AlertTriangle };
    }
  };

  if (loading) {
    return (
      <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'} items-center justify-center`}>
        <ActivityIndicator color="#00FF9C" size="large" />
      </Box>
    );
  }

  return (
    <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 150 }}>
        <Heading className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold mt-10 mb-8`}>{t('my_complaints')}</Heading>
        
        <VStack space="md">
          {complaints.map((item) => {
            const status = getStatusProps(item.status);
            return (
              <Motion.View key={item.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Box className={`${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE]'} rounded-[24px] border overflow-hidden flex-row shadow-sm`}>
                  <Box className="w-1.5" style={{ backgroundColor: status.color }} />
                  
                  <HStack className="flex-1">
                    <TouchableOpacity 
                      className="flex-1 p-5"
                      onPress={() => router.push(`/complaint/${item.id}` as any)}
                    >
                      <VStack space="xs">
                        <Text className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`} numberOfLines={1}>{item.type || 'Sem título'}</Text>
                        <Text className={`${isDark ? 'text-[#666]' : 'text-[#888]'} text-sm`}>{item.location}</Text>
                        
                        <HStack className={`items-center gap-2 mt-3 ${isDark ? 'bg-white/5' : 'bg-black/5'} self-start px-3 py-1 rounded-lg`}>
                          <status.icon size={12} color={status.color} />
                          <Text className="text-xs font-bold" style={{ color: status.color }}>
                            {status.label}
                          </Text>
                        </HStack>
                      </VStack>
                    </TouchableOpacity>

                    <Divider orientation="vertical" className={`${isDark ? 'bg-[#222]' : 'bg-[#EEE]'} my-5`} />

                    <VStack className="w-16 items-center justify-center gap-8">
                      <TouchableOpacity 
                        onPress={() => router.push(`/complaint/edit/${item.id}` as any)}
                        style={{ padding: 10 }}
                      >
                         <Edit3 size={20} color="#00FF9C" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDelete(item.id)}
                        style={{ padding: 10 }}
                      >
                         <Trash2 size={20} color="#FF4B4B" />
                      </TouchableOpacity>
                    </VStack>
                  </HStack>
                </Box>
              </Motion.View>
            );
          })}
        </VStack>
      </ScrollView>
    </Box>
  );
}
