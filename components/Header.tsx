import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSettings } from '@context/settingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { isRTL2 } from '@utils/utils';
import { useTranslation } from 'react-i18next';
import { ZmanimWrapper } from '@utils/zmanim_wrapper';
import {
  CARD_BORDER_CLASS,
  CARD_SURFACE_CLASS,
  HEADER_TEXT_FRAME_CLASS,
  TEXT_SHADOW_STYLE,
} from '@utils/surfaceStyles';
import {
  useResponsiveFontSize,
  useResponsiveIconSize,
  useResponsiveSpacing,
  useDeviceType,
  useHeightScale,
} from '@utils/responsive';

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
  const locale = settings.synagogueSettings.language === 'he' ? 'he-IL' : 'en-US';
  const [currentTime, setCurrentTime] = useState(getCurrentTime(locale));
  const router = useRouter();
  const isRTL = isRTL2(settings.synagogueSettings.language);
  const deviceType = useDeviceType(settings.synagogueSettings.screenOrientation);
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
  // Reduced padding for mobile to save vertical space, with height scaling
  const containerPaddingX = Math.round((isMobileOrTablet ? 12 : 24) * heightScale) * 0.5;
  const containerPaddingY = Math.round((isMobileOrTablet ? 8 : 20) * heightScale) * 0.5;
  const borderRadiusSize = Math.round((isMobileOrTablet ? 16 : 24) * heightScale) * 0.5;

  const zmanim = new ZmanimWrapper(
    settings.synagogueSettings.nusach,
    settings.zmanimSettings.latitude,
    settings.zmanimSettings.longitude,
    settings.zmanimSettings.olson,
    settings.synagogueSettings.language,
    settings.zmanimSettings.purimSettings,
    settings.zmanimSettings.elevation,
    settings.zmanimSettings.candleLightingMins,
    settings.zmanimSettings.city,
  );
  const dayOfWeek = t(zmanim.greg().toLocaleString('en-US', { weekday: 'long' }).toLowerCase());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime(locale));
    }, 1000);

    return () => clearInterval(interval);
  }, [locale]);

  const textFramePaddingY = Math.max(2, Math.round(padding * 0.35));

  const elements = [
    <View
      key={1}
      className={`flex ${HEADER_TEXT_FRAME_CLASS}`}
      style={{ paddingHorizontal: padding, paddingVertical: textFramePaddingY }}
    >
      <Text className="font-bold text-gray-900" style={[{ fontSize: dateSize }, TEXT_SHADOW_STYLE]}>
        {dayOfWeek} - {[zmanim.getHebrewDate(), ...zmanim.getHoliday()].filter(Boolean).join(' - ')}
      </Text>
    </View>,
    <View key={2} className="flex-1 items-center">
      <View
        className={HEADER_TEXT_FRAME_CLASS}
        style={{ paddingHorizontal: padding * 2, paddingVertical: textFramePaddingY }}
      >
        <Text className="font-extrabold text-gray-900" style={[{ fontSize: titleSize }, TEXT_SHADOW_STYLE]}>
          {title}
        </Text>
      </View>
    </View>,
    <View key={3} className="flex flex-row items-center" style={{ marginHorizontal: padding }}>
      <View
        className={HEADER_TEXT_FRAME_CLASS}
        style={{ paddingHorizontal: padding * 1.25, paddingVertical: textFramePaddingY }}
      >
        <Text className="font-extrabold text-gray-900" style={[{ fontSize: timeSize }, TEXT_SHADOW_STYLE]}>
          {currentTime}
        </Text>
      </View>
    </View>,
    <View key={4} className="flex flex-row items-center">
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === 'web' && typeof document !== 'undefined') {
            (document.activeElement as HTMLElement)?.blur?.();
          }
          router.push('/settings');
        }}
        className="bg-gray-800 rounded-lg shadow-md hover:bg-gray-700"
        style={{ padding: padding }}
      >
        <Ionicons name="settings-outline" size={iconSize} color="white" />
      </TouchableOpacity>
    </View>,
  ];

  if (deviceType === 'mobile') {
    const mobileTitleSize = Math.min(titleSize, 22);
    const mobileDateSize = Math.min(dateSize, 14);
    const mobileTimeSize = Math.min(timeSize, 16);

    return (
      <View
        className={`flex ${CARD_SURFACE_CLASS} shadow-2xl border ${CARD_BORDER_CLASS}`}
        style={{
          paddingHorizontal: containerPaddingX,
          paddingVertical: containerPaddingY,
          borderRadius: borderRadiusSize,
        }}
      >
        {/* Top row: Title (centered) and Settings button */}
        <View className={`flex flex-row items-center justify-between w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View style={{ width: iconSize + padding * 2 }} />
          <View className="flex-1 items-center px-1">
            <View
              className={HEADER_TEXT_FRAME_CLASS}
              style={{ paddingHorizontal: padding * 1.5, paddingVertical: textFramePaddingY }}
            >
              <Text
                className="font-extrabold text-gray-900 text-center"
                style={[{ fontSize: mobileTitleSize }, TEXT_SHADOW_STYLE]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'web' && typeof document !== 'undefined') {
                (document.activeElement as HTMLElement)?.blur?.();
              }
              router.push('/settings');
            }}
            className="bg-gray-800 rounded-lg shadow-md hover:bg-gray-700"
            style={{ padding }}
          >
            <Ionicons name="settings-outline" size={iconSize} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom row: Hebrew date & holiday on one side, time on the other */}
        <View
          className={`flex flex-row items-center justify-between w-full ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ marginTop: Math.max(4, Math.round(padding * 0.5)) }}
        >
          <View
            className={`flex-1 ${HEADER_TEXT_FRAME_CLASS}`}
            style={{ paddingHorizontal: padding, paddingVertical: textFramePaddingY }}
          >
            <Text
              className="font-bold text-gray-900"
              style={[
                {
                  fontSize: mobileDateSize,
                  textAlign: isRTL ? 'right' : 'left',
                },
                TEXT_SHADOW_STYLE,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {dayOfWeek} - {[zmanim.getHebrewDate(), ...zmanim.getHoliday()].filter(Boolean).join(' - ')}
            </Text>
          </View>
          <View
            className={HEADER_TEXT_FRAME_CLASS}
            style={{
              paddingHorizontal: padding,
              paddingVertical: textFramePaddingY,
              marginLeft: isRTL ? 0 : 8,
              marginRight: isRTL ? 8 : 0,
            }}
          >
            <Text className="font-extrabold text-gray-900" style={[{ fontSize: mobileTimeSize }, TEXT_SHADOW_STYLE]}>
              {currentTime}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const displayElements = isRTL ? [...elements].reverse() : elements;
  const style1 = isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left';

  return (
    <View
      className={`flex ${CARD_SURFACE_CLASS} shadow-2xl border ${CARD_BORDER_CLASS} ${style1}`}
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
