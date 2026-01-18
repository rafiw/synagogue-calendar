import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundSettings } from '../utils/defs';

interface BackgroundWrapperProps {
  settings: BackgroundSettings;
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ settings, children }) => {
  const { mode, imageUrl, solidColor, gradientColors, gradientStart, gradientEnd } = settings;

  if (mode === 'image' && imageUrl) {
    return (
      <ImageBackground source={{ uri: imageUrl }} style={styles.container} resizeMode="cover">
        {children}
      </ImageBackground>
    );
  }

  if (mode === 'solid') {
    return <View style={[styles.container, { backgroundColor: solidColor }]}>{children}</View>;
  }

  if (mode === 'gradient') {
    // Ensure at least 2 colors for gradient and convert to tuple type
    const colors =
      gradientColors.length >= 2
        ? (gradientColors as [string, string, ...string[]])
        : (['#E3F2FD', '#90CAF9'] as [string, string]);
    return (
      <LinearGradient
        colors={colors}
        start={gradientStart || { x: 0, y: 0 }}
        end={gradientEnd || { x: 1, y: 1 }}
        style={styles.container}
      >
        {children}
      </LinearGradient>
    );
  }

  // Fallback to solid color if mode is not recognized
  return <View style={[styles.container, { backgroundColor: solidColor }]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BackgroundWrapper;
