import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Motion } from '@legendapp/motion';
import { Shield, ShieldCheck, BarChart3, Target } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const hasConsent = await AsyncStorage.getItem('@verdevia_cookie_consent');
    if (!hasConsent) {
      setVisible(true);
    }
  };

  const handleSave = async () => {
    await AsyncStorage.setItem('@verdevia_cookie_consent', JSON.stringify(preferences));
    
    // Tenta sincronizar com o backend se o usuário já estiver autenticado
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        await api.post(`/compliance/users/${user.id}/consents`, {
          updates: [
            { purpose: 'ESSENTIAL_TERMS', status: true, version: '1.0.0' },
            { purpose: 'PRIVACY_POLICY', status: true, version: '1.0.0' },
            { purpose: 'ANALYTICS', status: preferences.analytics, version: '1.0.0' },
            { purpose: 'MARKETING_NOTIFICATIONS', status: preferences.marketing, version: '1.0.0' }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar consentimentos iniciais:', error);
    }
    
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Motion.View initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.container}>
          <View style={styles.header}>
            <Shield color="#00FF9C" size={32} />
            <Text style={styles.title}>Privacidade & Consentimento</Text>
          </View>
          
          <Text style={styles.description}>
            De acordo com a LGPD e regulamentos de proteção de dados, precisamos do seu consentimento para gerenciar como processamos suas preferências no aplicativo.
          </Text>

          <ScrollView style={styles.scroll}>
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <ShieldCheck size={20} color="#00FF9C" />
                <View>
                  <Text style={styles.itemTitle}>Essenciais (Termos & Política)</Text>
                  <Text style={styles.itemSub}>Segurança e Autenticação do Usuário</Text>
                </View>
              </View>
              <Switch value={true} disabled trackColor={{ false: '#333', true: 'rgba(0, 255, 156, 0.3)' }} thumbColor="#00FF9C" />
            </View>

            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <BarChart3 size={20} color="#666" />
                <View>
                  <Text style={styles.itemTitle}>Métricas e Telemetria</Text>
                  <Text style={styles.itemSub}>Melhoria de desempenho e logs de erro</Text>
                </View>
              </View>
              <Switch 
                value={preferences.analytics} 
                onValueChange={(v) => setPreferences({...preferences, analytics: v})}
                trackColor={{ false: '#333', true: 'rgba(0, 255, 156, 0.3)' }}
                thumbColor={preferences.analytics ? '#00FF9C' : '#666'}
              />
            </View>

            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Target size={20} color="#666" />
                <View>
                  <Text style={styles.itemTitle}>Notificações de Alerta</Text>
                  <Text style={styles.itemSub}>Informações personalizadas e novidades</Text>
                </View>
              </View>
              <Switch 
                value={preferences.marketing} 
                onValueChange={(v) => setPreferences({...preferences, marketing: v})}
                trackColor={{ false: '#333', true: 'rgba(0, 255, 156, 0.3)' }}
                thumbColor={preferences.marketing ? '#00FF9C' : '#666'}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Confirmar Minhas Escolhas</Text>
          </TouchableOpacity>
        </Motion.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#161616', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50, borderWidth: 1, borderColor: '#333' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  description: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 25 },
  scroll: { maxHeight: 300, marginBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0D0D0D', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  itemTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  itemSub: { color: '#666', fontSize: 11, marginTop: 2 },
  saveBtn: { backgroundColor: '#00FF9C', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  saveText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});

