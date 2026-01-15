import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/settingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { isRTL2 } from 'utils/utils';
import { useTranslation } from 'react-i18next';
import { ZmanimWrapper } from 'utils/zmanim_wrapper';

const getCurrentTime = (locale: string) => {
  const now = new Date(); // cannot use zmanim.greg()
  return now.toLocaleTimeString([locale], { hour: '2-digit', minute: '2-digit' });
};

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const locale = settings.language === 'he' ? 'he-IL' : 'en-US';
  const [currentTime, setCurrentTime] = useState(getCurrentTime(locale));
  const router = useRouter();
  const isRTL = isRTL2(settings.language);
  const zmanim = new ZmanimWrapper(
    settings.latitude,
    settings.longitude,
    settings.olson,
    settings.language,
    settings.purimSettings,
    settings.elevation,
  );
  const [dayOfWeek, setDayOfWeek] = useState(
    t(zmanim.greg().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime(locale));
    }, 1000);

    return () => clearInterval(interval);
  }, [locale]);

  const elements = [
    <View key={1} className="flex">
      <Text className="text-4xl font-semibold text-gray-800 px-2">
        {dayOfWeek} - {[zmanim.getHebrewDate(), ...zmanim.getHoliday()].filter(Boolean).join(' - ')}
      </Text>
    </View>,
    <View key={2} className="flex-1 items-center">
      <Text className="text-5xl font-bold text-gray-900">{title}</Text>
    </View>,
    <View key={3} className="flex flex-row items-center">
      <Text className="mx-4 font-bold text-4xl text-gray-800">{currentTime}</Text>
    </View>,
    <View key={4} className="flex flex-row items-center">
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        className="bg-gray-800 rounded-lg shadow-md hover:bg-gray-700"
      >
        <Ionicons name="settings-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>,
  ];

  const displayElements = isRTL ? [...elements].reverse() : elements;
  const style1 = isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left';

  return (
    <View className={`flex px-6 py-4 bg-white/90 shadow-lg ${style1}`}>
      <View className="flex flex-row items-center justify-between w-full">{displayElements}</View>
    </View>
  );
};

export default Header;
