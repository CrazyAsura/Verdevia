import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { ProfileFrame } from './profile-frame';

interface Item {
  id: string;
  name: string;
  type: 'title' | 'frame';
  value: string;
}

interface CustomizationModalProps {
  isVisible: boolean;
  onClose: () => void;
  unlockedItems: Item[];
  activeTitle: string;
  activeFrame: string;
  onSelect: (item: Item) => void;
}

export const CustomizationModal = ({ 
  isVisible, 
  onClose, 
  unlockedItems, 
  activeTitle, 
  activeFrame,
  onSelect 
}: CustomizationModalProps) => {
  
  const titles = unlockedItems.filter(i => i.type === 'title');
  const frames = unlockedItems.filter(i => i.type === 'frame');

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Personalização</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Molduras de Avatar</Text>
            <View style={styles.grid}>
              {frames.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.frameItem, activeFrame === item.value && styles.activeItem]}
                  onPress={() => onSelect(item)}
                >
                  {item.value.startsWith('frame://') ? (
                    <ProfileFrame size={66} frameUrl={item.value} />
                  ) : (
                    <Image source={{ uri: item.value }} style={styles.framePreview} />
                  )}
                  {activeFrame === item.value && <View style={styles.checkBadge}><Check size={12} color="#000" /></View>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Seus Títulos</Text>
            <View style={styles.titlesList}>
              {titles.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.titleItem, activeTitle === item.value && styles.activeTitleItem]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.titleLabel, activeTitle === item.value && styles.activeTitleLabel]}>
                    {item.value}
                  </Text>
                  {activeTitle === item.value && <Check size={16} color="#00FF9C" />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '70%', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  frameItem: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#1A1A1A', padding: 5, borderWidth: 2, borderColor: 'transparent' },
  activeItem: { borderColor: '#00FF9C' },
  framePreview: { width: '100%', height: '100%', resizeMode: 'contain' },
  checkBadge: { position: 'absolute', bottom: -5, right: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#00FF9C', justifyContent: 'center', alignItems: 'center' },
  titlesList: { gap: 10 },
  titleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
  activeTitleItem: { borderColor: '#00FF9C', backgroundColor: 'rgba(0,255,156,0.05)' },
  titleLabel: { color: '#888', fontSize: 16, fontWeight: '600' },
  activeTitleLabel: { color: '#00FF9C' }
});
