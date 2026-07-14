import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor,
  interpolate,
  withTiming,
  FadeIn
} from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';

interface PremiumInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: LucideIcon;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  placeholder?: string;
  rightElement?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

const PremiumInput = ({ 
  label, 
  value, 
  onChangeText, 
  icon: Icon, 
  secureTextEntry, 
  keyboardType = 'default',
  error,
  placeholder,
  rightElement,
  autoCapitalize,
  autoCorrect
}: PremiumInputProps) => {
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  useEffect(() => {
    focusAnim.value = withSpring(focused || value.length > 0 ? 1 : 0, {
      damping: 15,
      stiffness: 120
    });
  }, [focused, value]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        ['#262626', '#00FF9C']
      ),
      borderWidth: 1,
      shadowColor: '#00FF9C',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: withSpring(focusAnim.value * 0.3),
      shadowRadius: withSpring(focusAnim.value * 10),
      backgroundColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        ['#121212', '#161616']
      ),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(focusAnim.value, [0, 1], [0, -28]) },
        { scale: interpolate(focusAnim.value, [0, 1], [1, 0.85]) }
      ],
      color: interpolateColor(
        focusAnim.value,
        [0, 1],
        ['#666', '#00FF9C']
      ),
      left: interpolate(focusAnim.value, [0, 1], [Icon ? 50 : 20, 15]),
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon 
              size={22} 
              color={focused ? '#00FF9C' : '#666'} 
              strokeWidth={1.5}
            />
          </View>
        )}
        
        <View style={styles.inputStack}>
          <Animated.Text style={[styles.label, labelStyle]}>
            {label}
          </Animated.Text>
          
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            placeholder={focused ? placeholder : ''}
            placeholderTextColor="#444"
            style={styles.input}
            cursorColor="#00FF9C"
            selectionColor="rgba(0, 255, 156, 0.3)"
          />
        </View>

        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </Animated.View>
      
      {error && (
        <Animated.Text 
          entering={FadeIn} 
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 65,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStack: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  label: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    paddingTop: 10,
    height: '100%',
  },
  rightElement: {
    paddingLeft: 10,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 15,
    fontWeight: '500',
  },
});

export default React.memo(PremiumInput);
