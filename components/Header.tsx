import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSettings } from '../context/settingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { isRTL2 } from 'utils/utils';
import { useTranslation } from 'react-i18next';
import { ZmanimWrapper } from 'utils/zmanim_wrapper';
import {
  useResponsiveFontSize,
  useResponsiveIconSize,
  useResponsiveSpacing,
  useDeviceType,
  useHeightScale,
} from 'utils/responsive';

const getCurrentTime = (locale: string) => {
  const now = new Date(); // cannot use zmanim.greg()
  return now.toLocaleTimeString([locale], { hour: '2-digit', minute: '2-digit' });
};

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const locale = settings.language === 'he' ? 'he-IL' : 'en-US';
  const [currentTime, setCurrentTime] = useState(getCurrentTime(locale));
  const router = useRouter();
  const isRTL = isRTL2(settings.language);
  const deviceType = useDeviceType();
  const heightScale = useHeightScale();

  // Responsive sizes - use smaller fonts for header on mobile/tablet
  // On mobile: headingLarge=24px, headingMedium=20px (instead of display sizes)
  // On larger devices: use display sizes for better visibility
  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  const titleSize = Math.round(
    useResponsiveFontSize(isMobileOrTablet ? 'headingLarge' : 'displayMedium') * heightScale,
  );
  const dateSize = Math.round(useResponsiveFontSize(isMobileOrTablet ? 'headingMedium' : 'headingLarge') * heightScale);
  const timeSize = Math.round(useResponsiveFontSize(isMobileOrTablet ? 'headingMedium' : 'headingLarge') * heightScale);
  const iconSize = Math.round((useResponsiveIconSize('small') * heightScale) / 2.0);
  const padding = Math.round(useResponsiveSpacing(6) * heightScale);

  const zmanim = new ZmanimWrapper(
    settings.nusach,
    settings.latitude,
    settings.longitude,
    settings.olson,
    settings.language,
    settings.purimSettings,
    settings.elevation,
  );
  const [dayOfWeek] = useState(t(zmanim.greg().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()));
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime(locale));
    }, 1000);

    return () => clearInterval(interval);
  }, [locale]);

  const elements = [
    <View key={1} className="flex">
      <Text className="font-semibold text-gray-800" style={{ fontSize: dateSize, paddingHorizontal: padding }}>
        {dayOfWeek} - {[zmanim.getHebrewDate(), ...zmanim.getHoliday()].filter(Boolean).join(' - ')}
      </Text>
    </View>,
    <View key={2} className="flex-1 items-center">
      <Text className="font-bold text-gray-900" style={{ fontSize: titleSize }}>
        {title}
      </Text>
    </View>,
    <View key={3} className="flex flex-row items-center">
      <Text className="font-bold text-gray-800" style={{ fontSize: timeSize, marginHorizontal: padding * 2 }}>
        {currentTime}
      </Text>
    </View>,
    <View key={4} className="flex flex-row items-center">
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        className="bg-gray-800 rounded-lg shadow-md hover:bg-gray-700"
        style={{ padding: padding }}
      >
        <Ionicons name="settings-outline" size={iconSize} color="white" />
      </TouchableOpacity>
    </View>,
  ];

  const displayElements = isRTL ? [...elements].reverse() : elements;
  const style1 = isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left';

  // Reduced padding for mobile to save vertical space, with height scaling
  const containerPaddingX = Math.round((isMobileOrTablet ? 12 : 24) * heightScale);
  const containerPaddingY = Math.round((isMobileOrTablet ? 8 : 20) * heightScale);
  const borderRadiusSize = Math.round((isMobileOrTablet ? 16 : 24) * heightScale);

  return (
    <View
      className={`flex bg-white/40 backdrop-blur-sm shadow-2xl border border-white/50 ${style1}`}
      style={{
        paddingHorizontal: containerPaddingX,
        paddingVertical: containerPaddingY,
        borderRadius: borderRadiusSize,
      }}
    >
      <View className="flex flex-row items-center justify-between w-full">{displayElements}</View>
    </View>
  );
};

export default Header;
