import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Plus, X, Camera, MapPin, Newspaper, BookOpen, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Motion } from '@legendapp/motion';
import { useTranslation } from 'react-i18next';

interface FabModalProps {
  isVisible: boolean;
  onClose: () => void;
  colorMode: 'light' | 'dark';
}

export function FabModal({ isVisible, onClose, colorMode }: FabModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isDark = colorMode === 'dark';

  const menuItems = [
    { icon: Camera, title: 'Fazer Queixa', route: '/make-complaint', description: 'Registre problemas ambientais com fotos e detalhes' },
    { icon: Newspaper, title: 'Nova Resenha', route: '/post/create', description: 'Compartilhe suas ideias e análises com a comunidade' },
    { icon: Globe, title: 'Queixas Globais', route: '/global-complaints', description: 'Explore incidentes e soluções ao redor do mundo' },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Motion.View 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          style={[styles.container, { backgroundColor: isDark ? '#161616' : '#FFF' }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>O que deseja fazer?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={isDark ? '#666' : '#999'} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.listItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderLeftColor: '#00FF9C' }]} 
                onPress={() => handleNavigate(item.route)}
              >
                <View style={styles.iconCircle}>
                  <item.icon color="#00FF9C" size={22} />
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: isDark ? '#FFF' : '#000' }]}>{item.title}</Text>
                  <Text style={[styles.itemSub, { color: isDark ? '#666' : '#888' }]}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Motion.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 35,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 5,
  },
  list: {
    gap: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 156, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
  },
});
