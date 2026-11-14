import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundSettings } from '@utils/defs';
import { getBackgroundPreset } from '@utils/backgroundAssets';

interface BackgroundWrapperProps {
  settings: BackgroundSettings;
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ settings, children }) => {
  const { mode, imageUrl, customImageUri, presetId, solidColor, gradientColors, gradientStart, gradientEnd } = settings;

  if (mode === 'image') {
    const preset = getBackgroundPreset(presetId);
    if (preset) {
      return (
        <ImageBackground source={preset.source} style={styles.container} resizeMode={preset.resizeMode}>
          {children}
        </ImageBackground>
      );
    }

    const resolvedUri = customImageUri || imageUrl;
    if (resolvedUri) {
      return (
        <ImageBackground source={{ uri: resolvedUri }} style={styles.container} resizeMode="cover">
          {children}
        </ImageBackground>
      );
    }
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
    width: '100%',
    height: '100%',
  },
});

export default BackgroundWrapper;
