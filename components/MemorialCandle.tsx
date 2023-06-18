import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Platform } from 'react-native';

interface MemorialCandleProps {
  size?: number;
}

const MemorialCandle: React.FC<MemorialCandleProps> = ({ size = 40 }) => {
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameOpacity = useRef(new Animated.Value(1)).current;
  const innerFlameScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Main flame flickering animation
    const flameAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.1,
            duration: 150 + Math.random() * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(flameOpacity, {
            toValue: 0.85,
            duration: 150 + Math.random() * 100,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 0.95,
            duration: 100 + Math.random() * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(flameOpacity, {
            toValue: 1,
            duration: 100 + Math.random() * 100,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.05,
            duration: 120 + Math.random() * 80,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(flameOpacity, {
            toValue: 0.9,
            duration: 120 + Math.random() * 80,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 130 + Math.random() * 70,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(flameOpacity, {
            toValue: 1,
            duration: 130 + Math.random() * 70,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );

    // Inner flame animation (slightly offset)
    const innerFlameAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(innerFlameScale, {
          toValue: 1.15,
          duration: 180,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(innerFlameScale, {
          toValue: 0.9,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(innerFlameScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    // Glow pulsing animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    flameAnimation.start();
    innerFlameAnimation.start();
    glowAnimation.start();

    return () => {
      flameAnimation.stop();
      innerFlameAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const candleWidth = size * 0.3;
  const candleHeight = size * 0.5;
  const flameWidth = size * 0.25;
  const flameHeight = size * 0.4;

  return (
    <View style={{ alignItems: 'center', height: size, width: size }}>
      {/* Glow effect behind flame */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          width: flameWidth * 2.5,
          height: flameHeight * 1.5,
          borderRadius: flameWidth * 1.25,
          backgroundColor: '#fbbf24',
          opacity: glowOpacity,
          ...Platform.select({
            web: {
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.8)',
            },
            default: {
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
            },
          }),
        }}
      />

      {/* Outer flame */}
      <Animated.View
        style={{
          position: 'absolute',
          top: size * 0.05,
          width: flameWidth,
          height: flameHeight,
          borderRadius: flameWidth / 2,
          borderTopLeftRadius: flameWidth * 0.8,
          borderTopRightRadius: flameWidth * 0.8,
          backgroundColor: '#f97316',
          transform: [{ scaleY: flameScale }, { scaleX: flameScale }],
          opacity: flameOpacity,
        }}
      />

      {/* Inner flame (brighter) */}
      <Animated.View
        style={{
          position: 'absolute',
          top: size * 0.12,
          width: flameWidth * 0.5,
          height: flameHeight * 0.6,
          borderRadius: flameWidth * 0.25,
          borderTopLeftRadius: flameWidth * 0.5,
          borderTopRightRadius: flameWidth * 0.5,
          backgroundColor: '#fde047',
          transform: [{ scaleY: innerFlameScale }],
        }}
      />

      {/* Candle body */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: candleWidth,
          height: candleHeight,
          backgroundColor: '#fef3c7',
          borderRadius: 2,
          borderTopLeftRadius: candleWidth * 0.3,
          borderTopRightRadius: candleWidth * 0.3,
        }}
      />

      {/* Candle highlight */}
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          left: size / 2 - candleWidth / 2 + 2,
          width: candleWidth * 0.3,
          height: candleHeight - 4,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 1,
        }}
      />

      {/* Wick */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          width: 2,
          height: size * 0.08,
          backgroundColor: '#374151',
          borderRadius: 1,
        }}
      />
    </View>
  );
};

export default MemorialCandle;
