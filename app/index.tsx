import { ImageBackground, View, Text, ActivityIndicator, I18nManager } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';

import Classes, { getSubPages as getClassSubPages } from '../components/Classes';
import Deceased, { getSubPages as getDeceasedSubPages } from '../components/Deceased';
import Messages, { getSubPages as getMessagesSubPages } from '../components/Messages';
import Zmanim, { getSubPages as getZmanimSubPages } from '../components/Zmanim';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSettings } from '../context/settingsContext';
import { defaultPageDisplayTime, getNoScreenText } from '../utils/utils';
import { useScreenRotation } from '../utils/useScreenRotation';
import { Screen } from '../utils/defs';
import Schedule from '../components/Schedule';

export default function App() {
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [screens, setScreens] = useState<Screen[]>([]);
  const { settings } = useSettings();

  const { CurrentScreenComponent, isValid } = useScreenRotation({
    screens,
    defaultDisplayTime: defaultPageDisplayTime,
  });

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
      // {
      //   id: 5,
      //   name: 'schedule',
      //   content: () => (settings.enableSchedule ? <Schedule /> : null),
      //   presentTime: defaultPageDisplayTime,
      // },
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

  return (
    <ImageBackground source={{ uri: settings.background }} className="flex-1 bg-cover bg-center">
      <View className="flex-1">
        <View className="h-[12%]">
          <Header title={settings.name} />
        </View>
        <View className="h-[80%]">{CurrentScreenComponent && <CurrentScreenComponent />}</View>
        <View className="h-[3%]">
          <Footer footerText="כל הזכויות שמורות לרפי וינר" />
        </View>
      </View>
    </ImageBackground>
  );
}
