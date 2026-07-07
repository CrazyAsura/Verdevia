import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInDown.delay(200).springify()} 
        style={styles.title}
      >
        {title}
      </Animated.Text>
      <Animated.Text 
        entering={FadeInDown.delay(400).springify()} 
        style={styles.subtitle}
      >
        {subtitle}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
  },
  title: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 48,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '400',
    lineHeight: 24,
  },
});

export default React.memo(AuthHeader);
