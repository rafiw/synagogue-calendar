/*
 * Copyright (C) 2026 Rafi Wiener
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

import { View, Text, ActivityIndicator, I18nManager, useWindowDimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';

import Classes, { getSubPages as getClassSubPages } from '../components/Classes';
import Deceased, { getSubPages as getDeceasedSubPages } from '../components/Deceased';
import Messages, { getSubPages as getMessagesSubPages } from '../components/Messages';
import Zmanim from '../components/Zmanim';
import Header from '../components/Header';
// import Footer from '../components/Footer';
import { useSettings } from '../context/settingsContext';
import { defaultPageDisplayTime, getNoScreenText } from '../utils/utils';
import { useScreenRotation } from '../utils/useScreenRotation';
import { Screen } from '../utils/defs';
import Schedule from '../components/Schedule';
import { useResponsiveSpacing, useDeviceType } from '../utils/responsive';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function App() {
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [screens, setScreens] = useState<Screen[]>([]);
  const { settings } = useSettings();

  const { CurrentScreenComponent, isValid } = useScreenRotation({
    screens,
    defaultDisplayTime: defaultPageDisplayTime,
  });

  // Responsive sizing based on device type - MUST call all hooks unconditionally
  const deviceType = useDeviceType();
  const { height } = useWindowDimensions();
  const baseSpacing = useResponsiveSpacing(12);

  // Scale down for small height screens (like TV at 540px logical height)
  const heightScale = height < 600 ? 0.7 : height < 800 ? 0.85 : 1.0;

  // Reduced spacing on mobile to maximize content area, with height scaling
  const isMobile = deviceType === 'mobile';
  const containerPadding = Math.round((isMobile ? 8 : baseSpacing) * heightScale);
  const headerMargin = Math.round((isMobile ? 8 : baseSpacing) * heightScale);
  const contentPadding = Math.round((isMobile ? 8 : baseSpacing) * heightScale);
  const borderRadius = Math.round(
    (deviceType === 'tv' ? 48 : deviceType === 'desktop' ? 32 : deviceType === 'tablet' ? 32 : 16) * heightScale,
  );

  useEffect(() => {
    const shouldBeRTL = settings.synagogueSettings.language === 'he'; // or use your isRTL2 function
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, [settings.synagogueSettings.language]);

  const createScreens = useCallback(async (): Promise<Screen[]> => {
    const [classSubPages, messagesSubPages, deceasedSubPages] = await Promise.all([
      getClassSubPages(),
      getMessagesSubPages(),
      getDeceasedSubPages(),
    ]);

    return [
      {
        id: 1,
        name: 'zmanim',
        content: () => (settings.zmanimSettings.enable ? <Zmanim /> : null),
        presentTime: settings.zmanimSettings.screenDisplayTime * 1000 || defaultPageDisplayTime,
      },
      {
        id: 2,
        name: 'classes',
        content: () => (settings.classesSettings.enable ? <Classes /> : null),
        presentTime: settings.classesSettings.screenDisplayTime * 1000 || classSubPages * defaultPageDisplayTime,
      },
      {
        id: 3,
        name: 'deceased',
        content: () => (settings.deceasedSettings.enable ? <Deceased /> : null),
        presentTime: settings.deceasedSettings.screenDisplayTime * 1000 || deceasedSubPages * defaultPageDisplayTime,
      },
      {
        id: 4,
        name: 'messages',
        content: () => (settings.messagesSettings.enable ? <Messages /> : null),
        presentTime: settings.messagesSettings.screenDisplayTime * 1000 || messagesSubPages * defaultPageDisplayTime,
      },
      {
        id: 5,
        name: 'schedule',
        content: () => (settings.scheduleSettings.enable ? <Schedule /> : null),
        presentTime: settings.scheduleSettings.screenDisplayTime * 1000 || defaultPageDisplayTime,
      },
    ].filter((screen) => screen.content() !== null && screen.presentTime > 0) as Screen[];
  }, [settings]);

  useEffect(() => {
    const loadScreens = async () => {
      setIsLoadingScreens(true);
      try {
        const loadedScreens = await createScreens();
        setScreens(loadedScreens);
      } finally {
        setIsLoadingScreens(false);
      }
    };
    loadScreens();
  }, [createScreens]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!isValid) {
      timer = setTimeout(() => {
        router.push('/settings');
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isValid]);

  if (isLoadingScreens) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isValid) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-medium text-red-500">{getNoScreenText(settings.synagogueSettings.language)}</Text>
      </View>
    );
  }

  const backgroundSettings = settings.synagogueSettings.backgroundSettings || {
    mode: 'image' as const,
    imageUrl: '',
    solidColor: '#E3F2FD',
    gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
  };

  return (
    <BackgroundWrapper settings={backgroundSettings}>
      {/* Subtle overlay for better content visibility */}
      <View className="absolute inset-0 bg-black/10" />

      <View className="flex-1" style={{ padding: containerPadding }}>
        {/* Header Section */}
        <View style={{ marginBottom: headerMargin }}>
          <Header title={settings.synagogueSettings.name} />
        </View>

        {/* Main Content Section - Card Style (no backdrop-blur for RN compatibility) */}
        <View
          className="flex-1 bg-white/40 shadow-2xl overflow-hidden border border-white/50"
          style={{
            borderRadius,
            elevation: 8, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <View className="flex-1" style={{ padding: contentPadding }}>
            {CurrentScreenComponent && <CurrentScreenComponent />}
          </View>
        </View>

        {/* Optional Footer Space */}
        {/* <View style={{ marginTop: headerMargin }}>
          <Footer />
        </View> */}
      </View>
    </BackgroundWrapper>
  );
}
