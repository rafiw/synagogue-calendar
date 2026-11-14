import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '@context/settingsContext';
import { router } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { defaultPageDisplayTime, safeJsonParse } from '@utils/utils';
import { CARD_SUBSURFACE_CLASS, TEXT_SHADOW_STYLE } from '@utils/surfaceStyles';
import {
  useEffectiveDimensions,
  useResponsiveFontSize,
  useResponsiveIconSize,
  useResponsiveSpacing,
  useHeightScale,
} from '@utils/responsive';
import { Message, Settings } from '@utils/defs';
import {
  isMessageActive,
  filterActiveMessages,
  buildMessagePages,
  calculateMessagesSubPages,
  MessagePage,
} from '@utils/classesHelpers';
import { getEventImage } from '@utils/eventAssets';

export async function getSubPages(): Promise<number> {
  try {
    const localSettingsString = await AsyncStorage.getItem('settings');
    const localSettings = safeJsonParse<Settings | null>(localSettingsString, null);
    if (!localSettings?.messagesSettings?.enable || !Array.isArray(localSettings?.messagesSettings?.messages)) return 1;

    // Filter to only count active messages
    const activeMessages = localSettings.messagesSettings.messages.filter((msg: Message) => isMessageActive(msg));
    return Math.max(1, calculateMessagesSubPages(activeMessages));
  } catch {
    return 1;
  }
}

const Messages: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const { width } = useEffectiveDimensions(settings.synagogueSettings.screenOrientation);
  const baseHeightScale = useHeightScale();

  const pageDisplayTime = settings.messagesSettings.screenDisplayTime || defaultPageDisplayTime;

  // Filter to only show active messages
  const activeMessages = useMemo(() => {
    return filterActiveMessages(settings.messagesSettings.messages || []);
  }, [settings.messagesSettings.messages]);

  const messagePages = useMemo<MessagePage[]>(() => {
    return buildMessagePages(activeMessages);
  }, [activeMessages]);

  const totalPages = messagePages.length;
  const currentPageData = messagePages[currentPage] || messagePages[0];

  const baseTitleFont = useResponsiveFontSize('displayLarge');
  const baseMsgFont = useResponsiveFontSize('headingLarge');
  const baseEmptyTitleFont = useResponsiveFontSize('displayMedium');
  const baseEmptyDescFont = useResponsiveFontSize('bodyLarge');
  const baseBtnFont = useResponsiveFontSize('headingMedium');
  const baseIconLarge = useResponsiveIconSize('large');
  const baseIconXXLarge = useResponsiveIconSize('xxlarge');
  const baseSpacing = useResponsiveSpacing(24);

  const heightScale = useMemo(() => {
    if (availableHeight > 100 && currentPageData && currentPageData.type === 'standard') {
      const msgs = currentPageData.messages;
      const msgCount = Math.max(1, msgs.length);
      const charsPerLine = Math.max(25, Math.floor((width * 0.78) / (baseMsgFont * 0.9 * 0.55)));
      const totalLines = msgs.reduce((sum, m) => sum + Math.max(1, Math.ceil((m.text || '').length / charsPerLine)), 0);

      const headerUnit = baseTitleFont * 0.6 * 1.3 + baseSpacing * 2 + (totalPages > 1 ? 18 : 0);
      const cardsChromeUnit = msgCount * (baseSpacing * 3);
      const textUnit = totalLines * (baseMsgFont * 0.9 * 1.6);
      const unitHeight = baseSpacing * 2 + headerUnit + cardsChromeUnit + textUnit * 1.1;

      return Math.min(baseHeightScale * 1.4, Math.max(0.5, (availableHeight * 0.92) / unitHeight));
    }
    return baseHeightScale;
  }, [availableHeight, currentPageData, width, baseMsgFont, baseTitleFont, baseSpacing, totalPages, baseHeightScale]);

  // Responsive sizes with height adjustment
  const titleSize = Math.round(baseTitleFont * heightScale) * 0.6;
  const messageSize = Math.round(baseMsgFont * heightScale) * 0.9;
  const eventTextSize = Math.max(34, Math.round(baseTitleFont * baseHeightScale) * 1.25);
  const emptyTitleSize = Math.round(baseEmptyTitleFont * baseHeightScale);
  const emptyDescSize = Math.round(baseEmptyDescFont * baseHeightScale);
  const buttonTextSize = Math.round(baseBtnFont * baseHeightScale);
  const iconSize = Math.round(baseIconLarge * heightScale) * 0.6;
  const iconLargeSize = Math.round(baseIconXXLarge * baseHeightScale) * 0.8;
  const padding = Math.round(baseSpacing * heightScale);
  const margin = Math.round(baseSpacing * heightScale);

  useEffect(() => {
    // Reset to first page if current page is out of bounds
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, pageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, [pageDisplayTime, totalPages]);

  if (!i18n.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (totalPages === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: padding }}>
        <View className="items-center bg-white/95 rounded-3xl shadow-xl max-w-md" style={{ padding: padding * 2 }}>
          <View className="bg-blue-100 rounded-full" style={{ padding, marginBottom: padding }}>
            <Ionicons name="chatbox-ellipses-outline" size={iconLargeSize} color="#3b82f6" />
          </View>
          <Text
            className="font-bold text-gray-800 text-center"
            style={{ fontSize: emptyTitleSize, marginBottom: padding / 2 }}
          >
            {t('msg_no_messages')}
          </Text>
          <Text
            className="text-gray-500 text-center leading-relaxed"
            style={{ fontSize: emptyDescSize, marginBottom: margin }}
          >
            {t('msg_empty_description') || 'Add messages to display important announcements and information'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/settings/messages')}
            className="bg-blue-500 rounded-xl shadow-md active:opacity-80 flex-row items-center"
            style={{ paddingHorizontal: padding, paddingVertical: padding / 2 }}
          >
            <Ionicons name="add-circle-outline" size={iconSize / 2} color="white" />
            <Text className="text-white font-semibold" style={{ fontSize: buttonTextSize, marginLeft: padding / 3 }}>
              {t('go_to_settings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentPageData) {
    return null;
  }

  if (currentPageData.type === 'event') {
    const { message } = currentPageData;
    const eventImage = getEventImage(message.eventType);

    return (
      <View className="flex-1">
        <ImageBackground
          source={eventImage}
          className="flex-1 justify-between"
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        >
          {/* Top Section: Indicators & Direct Text */}
          <View
            className="w-full items-center"
            style={{
              paddingHorizontal: padding * 1.5,
              paddingTop: padding,
            }}
          >
            {/* Page Indicators */}
            {totalPages > 1 && (
              <View className="flex-row justify-center space-x-2" style={{ marginBottom: margin / 2 }}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full ${index === currentPage ? 'w-8 bg-blue-500' : 'w-2 bg-white/70'}`}
                  />
                ))}
              </View>
            )}

            {/* Direct Text on Picture (no rectangle, no headline) */}
            {message.text ? (
              <View className="w-full max-w-5xl items-center" style={{ marginTop: margin }}>
                <Text
                  className="font-extrabold text-center leading-tight"
                  style={{
                    fontSize: eventTextSize,
                    color: '#111827',
                    textShadowColor: 'rgba(255, 255, 255, 0.95)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}
                >
                  {message.text}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Spacer to keep ceremonial items in bottom photo region visible */}
          <View style={{ height: padding }} />
        </ImageBackground>
      </View>
    );
  }

  // Standard Messages Page
  return (
    <View
      className="flex-1"
      style={{ paddingHorizontal: padding, paddingVertical: padding }}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && Math.abs(h - availableHeight) > 2) {
          setAvailableHeight(h);
        }
      }}
    >
      {/* Header Section */}
      <View style={{ marginBottom: margin }}>
        <View className="flex-row items-center justify-center mb-2">
          <View
            className={`flex-row items-center ${CARD_SUBSURFACE_CLASS} rounded-xl shadow-lg`}
            style={{ paddingHorizontal: padding, paddingVertical: padding / 2 }}
          >
            <Ionicons name="notifications" size={iconSize} color="#3b82f6" />
            <Text
              className="font-extrabold text-gray-900"
              style={[{ fontSize: titleSize, marginLeft: padding / 2 }, TEXT_SHADOW_STYLE]}
            >
              {t('msg_title')}
            </Text>
          </View>
        </View>

        {/* Page Indicators */}
        {totalPages > 1 && (
          <View className="flex-row justify-center space-x-2" style={{ marginTop: margin / 2 }}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${index === currentPage ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Messages List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly', paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {currentPageData.messages.map((message) => (
          <View
            key={message.id}
            className={`${CARD_SUBSURFACE_CLASS} rounded-2xl shadow-lg border-l-4 border-blue-500`}
            style={{ marginBottom: margin, padding }}
          >
            <View className="flex-row items-start">
              <Text
                className="flex-1 font-bold text-gray-900 leading-relaxed text-center"
                style={[{ fontSize: messageSize }, TEXT_SHADOW_STYLE]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Messages;
