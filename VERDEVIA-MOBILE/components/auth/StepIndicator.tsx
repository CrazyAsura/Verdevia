import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from 'react-native-reanimated';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isActive = step <= currentStep;
        
        return (
          <View key={i} style={styles.track}>
            <Animated.View 
              style={[
                styles.dot,
                { 
                  backgroundColor: isActive ? '#00FF9C' : '#262626',
                  width: step === currentStep ? 40 : 12,
                }
              ]} 
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  track: {
    height: 6,
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});

export default React.memo(StepIndicator);
