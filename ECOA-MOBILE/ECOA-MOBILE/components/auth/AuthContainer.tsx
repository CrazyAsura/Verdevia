import React from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from '../ui/liquid-glass';

interface AuthContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

const AuthContainer = ({ children, scrollable = true }: AuthContainerProps) => {
  const insets = useSafeAreaInsets();

  const Content = scrollable ? ScrollView : View;

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Cinematic Gradient / Ambient Glow */}
        <View style={styles.glow} />
        
        <Content 
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Content>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0, 255, 156, 0.05)',
    filter: Platform.OS === 'ios' ? 'blur(100px)' : undefined, // Native blur not supported on android View usually without extra libs, but good for iOS
  },
  content: {
    paddingHorizontal: 25,
  },
});

export default AuthContainer;
