import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, Info, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '@/context/ThemeContext';
import { Motion } from '@legendapp/motion';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { notifications, clearNotifications } = useNotifications();

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#111' : '#FFF',
    border: isDark ? '#222' : '#EEE',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#888' : '#666',
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle color="#FF4B4B" size={24} />;
      case 'success': return <ShieldCheck color="#00FF9C" size={24} />;
      default: return <Info color="#00FF9C" size={24} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ChevronLeft color="#00FF9C" size={30} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Notificações</Text>
        <TouchableOpacity onPress={clearNotifications} style={styles.clearBtn}>
          <Trash2 color={theme.subtext} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Info size={40} color={isDark ? '#222' : '#DDD'} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>Você não possui novas notificações.</Text>
          </View>
        ) : (
          notifications.map((notif, index) => (
            <Motion.View 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 100 }}
              style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.notifIcon}>
                {getIcon(notif.priority === 'high' ? 'error' : 'info')}
              </View>
              <View style={styles.notifBody}>
                <View style={styles.row}>
                  <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                  <View style={[styles.badge, { backgroundColor: notif.priority === 'high' ? 'rgba(255, 75, 75, 0.1)' : 'rgba(0, 255, 156, 0.1)' }]}>
                    <Text style={[styles.badgeText, { color: notif.priority === 'high' ? '#FF4B4B' : '#00FF9C' }]}>{notif.category}</Text>
                  </View>
                </View>
                <Text style={[styles.notifMsg, { color: theme.subtext }]}>{notif.message}</Text>
              </View>
            </Motion.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, justifyContent: 'space-between', marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  clearBtn: { padding: 10 },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  empty: { marginTop: 100, alignItems: 'center', gap: 15 },
  emptyText: { textAlign: 'center', paddingHorizontal: 40 },
  notifCard: { flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 15, alignItems: 'center', gap: 15 },
  notifIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(0, 255, 156, 0.05)', justifyContent: 'center', alignItems: 'center' },
  notifBody: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontWeight: 'bold', fontSize: 16 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
});
