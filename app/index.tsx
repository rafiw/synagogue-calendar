import { View, Text, ActivityIndicator, I18nManager } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';

import Classes, { getSubPages as getClassSubPages } from '../components/Classes';
import Deceased, { getSubPages as getDeceasedSubPages } from '../components/Deceased';
import Messages, { getSubPages as getMessagesSubPages } from '../components/Messages';
import Zmanim, { getSubPages as getZmanimSubPages } from '../components/Zmanim';
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
  const baseSpacing = useResponsiveSpacing(12);

  // Reduced spacing on mobile to maximize content area
  const isMobile = deviceType === 'mobile';
  const containerPadding = isMobile ? 8 : baseSpacing;
  const headerMargin = isMobile ? 8 : baseSpacing;
  const contentPadding = isMobile ? 8 : baseSpacing;
  const borderRadius = deviceType === 'tv' ? 48 : deviceType === 'desktop' ? 32 : deviceType === 'tablet' ? 32 : 16;

  useEffect(() => {
    const shouldBeRTL = settings.language === 'he'; // or use your isRTL2 function
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, [settings.language]);

  const createScreens = useCallback(async (): Promise<Screen[]> => {
    const [classSubPages, messagesSubPages, zmanimSubPages, deceasedSubPages] = await Promise.all([
      getClassSubPages(),
      getMessagesSubPages(),
      getZmanimSubPages(),
      getDeceasedSubPages(),
    ]);

    return [
      {
        id: 1,
        name: 'zmanim',
        content: () => (settings.enableZmanim ? <Zmanim /> : null),
        presentTime: zmanimSubPages * defaultPageDisplayTime,
      },
      {
        id: 2,
        name: 'classes',
        content: () => (settings.enableClasses ? <Classes /> : null),
        presentTime: classSubPages * defaultPageDisplayTime,
      },
      {
        id: 3,
        name: 'deceased',
        content: () => (settings.enableDeceased ? <Deceased /> : null),
        presentTime: deceasedSubPages * defaultPageDisplayTime,
      },
      {
        id: 4,
        name: 'messages',
        content: () => (settings.enableMessages ? <Messages /> : null),
        presentTime: messagesSubPages * defaultPageDisplayTime,
      },
      {
        id: 5,
        name: 'schedule',
        content: () => (settings.enableSchedule ? <Schedule /> : null),
        presentTime: defaultPageDisplayTime,
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
        <Text className="text-lg font-medium text-red-500">{getNoScreenText(settings.language)}</Text>
      </View>
    );
  }

  const backgroundSettings = settings.backgroundSettings || {
    mode: 'image' as const,
    imageUrl: settings.background || '../assets/images/background1.png',
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
          <Header title={settings.name} />
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
