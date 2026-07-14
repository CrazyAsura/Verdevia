import React from 'react';
import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

const ActionButton = ({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  variant = 'primary',
  icon 
}: ActionButtonProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <Animated.View style={[vStyles.container, animatedStyle, (disabled || loading) && styles.disabled]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.pressable}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#000' : '#00FF9C'} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={vStyles.text}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  primaryContainer: {
    backgroundColor: '#00FF9C',
    height: 65,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#00FF9C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryContainer: {
    backgroundColor: '#1A1A1A',
    height: 65,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    height: 65,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#00FF9C',
  },
  outlineText: {
    color: '#00FF9C',
    fontSize: 17,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default React.memo(ActionButton);
