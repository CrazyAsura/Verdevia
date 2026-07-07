import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colorMode: 'dark',
  toggleColorMode: () => {},
  isDark: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Prevent crashes during SSR (Node environment)
        if (typeof window === 'undefined') return;
        
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme) {
          setColorMode(savedTheme as ColorMode);
        }
      } catch (e) {
        console.warn('Failed to load theme from storage', e);
      }
    };
    loadTheme();
  }, []);

  const toggleColorMode = async () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    if (typeof window !== 'undefined') {
      await AsyncStorage.setItem('user-theme', newMode);
    }
  };

  const isDark = colorMode === 'dark';

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
