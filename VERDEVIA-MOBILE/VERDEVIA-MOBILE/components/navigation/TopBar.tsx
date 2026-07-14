import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Motion } from '@legendapp/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Gluestack Components
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { NotificationBell } from '@/components/navigation/NotificationBell';

interface TopBarProps {
  colorMode: 'light' | 'dark';
  pathname: string;
}

export const TopBar = ({ colorMode, pathname }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  const isDark = colorMode === 'dark';
  const isProfile = pathname === '/profile';

  return (
    <Motion.View
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'timing', duration: 800 }}
    >
      <Box
        className="px-5 pb-4 border-b-[0.5px] z-100"
        style={{
          paddingTop: insets.top + 10,
          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
          borderBottomColor: isDark ? '#222' : '#EEE'
        }}
      >
        <HStack className="justify-between items-center">
          <Motion.View
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 300 }}
          >
            <Text className="text-2xl font-black tracking-widest" style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
              VERDEVIA<Text className="text-[#00FF9C]">.</Text>
            </Text>
          </Motion.View>

          <HStack className="items-center gap-3">
            <NotificationBell isDark={isDark} />
          </HStack>
        </HStack>
      </Box>
    </Motion.View>
  );
};
