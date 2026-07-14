import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ClipboardList, BookOpen, Plus, MessageSquare, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomBarProps {
  colorMode: 'light' | 'dark';
  activeTab: string;
  onTabPress: (tab: string) => void;
  onFabPress: () => void;
}

export function BottomBar({ colorMode, activeTab, onTabPress, onFabPress }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const isDark = colorMode === 'dark';

  const leftItems = [
    { id: 'history', icon: ClipboardList, label: 'Minhas Queixas' },
    { id: 'courses', icon: BookOpen, label: 'Cursos' },
  ];

  const rightItems = [
    { id: 'forum', icon: MessageSquare, label: 'Postagens' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <View style={[
      styles.outerContainer, 
      { bottom: Math.max(insets.bottom, 16) }
    ]}>
      <Animated.View 
        style={[
          styles.dockContainer, 
          { 
            backgroundColor: isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
        ]}
      >
        {/* Left Side Tabs */}
        {leftItems.map((item) => (
          <DockItem 
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => onTabPress(item.id)}
            isDark={isDark}
          />
        ))}

        {/* Central FAB */}
        <TouchableOpacity 
          onPress={onFabPress}
          activeOpacity={0.8}
          style={styles.fabButton}
        >
          <View style={styles.fabInner}>
            <Plus color="#000" size={28} strokeWidth={3} />
          </View>
        </TouchableOpacity>

        {/* Right Side Tabs */}
        {rightItems.map((item) => (
          <DockItem 
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => onTabPress(item.id)}
            isDark={isDark}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function DockItem({ item, isActive, onPress, isDark }: any) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isActive ? 1 : 0.4);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0.4, { duration: 250 });
    if (isActive) {
      scale.value = withSequence(
        withSpring(1.2, { stiffness: 200, damping: 20 }),
        withSpring(1, { stiffness: 200, damping: 20 })
      );
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        <item.icon 
          size={22} 
          color={isActive ? '#00FF9C' : isDark ? '#FFF' : '#222'} 
          strokeWidth={isActive ? 2.5 : 2}
        />
        {isActive && (
          <View style={styles.activeIndicator} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 32,
    borderWidth: 1.5,
    width: '100%',
    maxWidth: 420,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 50,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#00FF9C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00FF9C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00FF9C',
    shadowColor: '#00FF9C',
    shadowOpacity: 1,
    shadowRadius: 4,
  }
});
