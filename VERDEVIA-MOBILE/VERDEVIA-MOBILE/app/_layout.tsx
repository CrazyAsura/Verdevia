import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, View, StyleSheet, Platform } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Slot, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/providers/AppProviders';
import '@/i18n';

// Custom Navigation Components
import { TopBar } from '@/components/navigation/TopBar';
import { BottomBar } from '@/components/navigation/BottomBar';
import { FabModal } from '@/components/navigation/FabModal';
import { CookieConsent } from '@/components/navigation/CookieConsent';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';

export {
  ErrorBoundary
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <CustomThemeProvider>
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode, toggleColorMode, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const activeTab = pathname === '/' ? 'home' : pathname.split('/')[1];

  const handleTabPress = (tab: string) => {
    if (tab === 'home') router.replace('/');
    else router.push(`/${tab}` as any);
  };

  const isAuthScreen = pathname.includes('auth');
  const isLessonPlayer = pathname.includes('/course/lesson/');
  const isComplaintCaptureFlow = pathname === '/make-complaint' || pathname.startsWith('/complaint/edit');
  const hideNavigation = isAuthScreen || isLessonPlayer || isComplaintCaptureFlow;

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('VERDEVIA:unauthorized', () => {
      if (!pathname.includes('auth')) {
        router.replace('/auth/login');
      }
    });

    return () => subscription.remove();
  }, [pathname, router]);

  return (
    <AppProviders>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GluestackUIProvider mode={colorMode}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            
            <View style={[styles.mainContainer, { backgroundColor: isDark ? '#0A0A0A' : '#F8F8F8' }]}>
              {!hideNavigation && <TopBar colorMode={colorMode} pathname={pathname} />}

              <View style={[styles.content, hideNavigation && { paddingBottom: 0 }]}>
                <Slot />
              </View>

              {!hideNavigation && (
                <BottomBar 
                  colorMode={colorMode} 
                  activeTab={activeTab}
                  onTabPress={handleTabPress}
                  onFabPress={() => setModalVisible(true)}
                />
              )}
            </View>

            {!hideNavigation && (
              <FabModal 
                isVisible={modalVisible} 
                onClose={() => setModalVisible(false)} 
                colorMode={colorMode}
              />
            )}

            <CookieConsent />
          </GluestackUIProvider>
        </GestureHandlerRootView>
      </NavigationThemeProvider>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 90, 
  }
});
