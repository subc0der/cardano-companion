import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cyberpunk } from '../../lib/theme/colors';

type GlowColor = 'cyan' | 'magenta' | 'none';

interface CyberCardProps {
  children: React.ReactNode;
  glowColor?: GlowColor;
  style?: ViewStyle;
}

export function CyberCard({ children, glowColor = 'none', style }: CyberCardProps) {
  const getGlowColors = (): [string, string] => {
    switch (glowColor) {
      case 'cyan':
        return [cyberpunk.neonCyan, cyberpunk.electricBlue];
      case 'magenta':
        return [cyberpunk.neonMagenta, '#8800FF'];
      default:
        return [cyberpunk.bgTertiary, cyberpunk.bgTertiary];
    }
  };

  const gradientColors = getGlowColors();

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBorder}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: cyberpunk.bgSecondary,
  },
  topBorder: {
    height: 2,
  },
  content: {
    padding: 16,
    backgroundColor: cyberpunk.bgSecondary,
  },
});
