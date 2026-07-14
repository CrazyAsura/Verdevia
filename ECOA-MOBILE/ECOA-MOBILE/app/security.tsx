import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Shield, Key, Fingerprint, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function SecurityScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const OPTIONS = [
    {
      icon: Key,
      label: 'Alterar Senha',
      sub: 'Ultima alteracao ha 3 meses',
      onPress: () => router.push('/auth/reset-password' as any),
    },
    {
      icon: Fingerprint,
      label: 'Biometria',
      sub: biometricsEnabled ? 'Ativado para login' : 'Desativado para login',
      onPress: () => {
        setBiometricsEnabled((current) => !current);
        Alert.alert('Biometria', biometricsEnabled ? 'Login por biometria desativado.' : 'Login por biometria ativado.');
      },
    },
    {
      icon: EyeOff,
      label: 'Privacidade de Dados',
      sub: 'Gerenciar o que compartilhamos',
      onPress: () => router.push('/privacy' as any),
    },
    {
      icon: Shield,
      label: 'Verificacao em Duas Etapas',
      sub: twoFactorEnabled ? 'Verificacao ativa' : 'Toque para ativar',
      onPress: () => {
        setTwoFactorEnabled((current) => !current);
        Alert.alert('Verificacao em duas etapas', twoFactorEnabled ? 'Verificacao em duas etapas desativada.' : 'Verificacao em duas etapas ativada.');
      },
    },
  ];

  const dynamicStyles = {
    container: { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' },
    title: { color: isDark ? '#FFF' : '#000' },
    item: { backgroundColor: isDark ? '#161616' : '#FFF', borderColor: isDark ? '#222' : '#EEE' },
    label: { color: isDark ? '#FFF' : '#000' },
    infoBox: { backgroundColor: isDark ? '#0D0D0D' : '#FFF', borderColor: '#00FF9C' },
    infoTitle: { color: isDark ? '#FFF' : '#000' },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#00FF9C" size={30} />
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.title]}>Seguranca & Privacidade</Text>
      </View>

      <View style={styles.menu}>
        {OPTIONS.map((item) => (
          <TouchableOpacity key={item.label} style={[styles.item, dynamicStyles.item]} onPress={item.onPress}>
            <View style={styles.iconBox}><item.icon size={22} color="#00FF9C" /></View>
            <View style={styles.body}>
              <Text style={[styles.label, dynamicStyles.label]}>{item.label}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <ChevronRight color="#333" size={20} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoBox, dynamicStyles.infoBox]}>
        <Shield size={40} color="#00FF9C" style={{ marginBottom: 15 }} />
        <Text style={[styles.infoTitle, dynamicStyles.infoTitle]}>Seus dados estao protegidos</Text>
        <Text style={styles.infoText}>Utilizamos criptografia ponta a ponta (AES-256) em todas as localizacoes e descricoes de queixas enviadas.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 15, marginBottom: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(0, 255, 156, 0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  menu: { paddingHorizontal: 24, gap: 15 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 45, height: 45, borderRadius: 14, backgroundColor: 'rgba(0, 255, 156, 0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  body: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sub: { color: '#666', fontSize: 13 },
  infoBox: { margin: 24, marginTop: 50, padding: 30, borderRadius: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoText: { color: '#888', textAlign: 'center', lineHeight: 20, fontSize: 14 },
});
