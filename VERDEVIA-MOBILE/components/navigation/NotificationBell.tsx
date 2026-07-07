import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Motion } from '@legendapp/motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';

export const NotificationBell = ({ isDark }: { isDark: boolean }) => {
  const { notifications } = useNotifications();
  const router = useRouter();
  const unreadCount = notifications.length;

  return (
    <TouchableOpacity 
      onPress={() => router.push('/notifications' as any)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Box className="p-2.5 rounded-xl" style={{ backgroundColor: isDark ? '#161616' : '#F5F5F5' }}>
        <Bell size={20} color="#00FF9C" />
        
        {unreadCount > 0 && (
          <Motion.View 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={styles.badge}
          >
            <View style={styles.badgeInner} />
          </Motion.View>
        )}
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4B4B',
    borderWidth: 2,
    borderColor: '#161616',
    zIndex: 1,
  },
  badgeInner: {
    flex: 1,
  }
});
