import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from 'context/settingsContext';
import { router } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { defaultPageDisplayTime } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import { Message, Settings } from 'utils/defs';
import {
  isMessageActive,
  filterActiveMessages,
  buildMessagePages,
  calculateMessagesSubPages,
  MessagePage,
} from 'utils/classesHelpers';
import { getEventImage } from 'utils/eventAssets';

export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? (JSON.parse(localSettingsString) as Settings) : null;
  if (!localSettings?.messagesSettings?.enable || !localSettings?.messagesSettings?.messages) return 0;

  // Filter to only count active messages
  const activeMessages = localSettings.messagesSettings.messages.filter((msg: Message) => isMessageActive(msg));
  return calculateMessagesSubPages(activeMessages);
}

const Messages: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const heightScale = useHeightScale();

  const pageDisplayTime = settings.messagesSettings.screenDisplayTime || defaultPageDisplayTime;

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('displayLarge') * heightScale) * 0.6;
  const messageSize = Math.round(useResponsiveFontSize('headingLarge') * heightScale) * 0.9;
  const eventTextSize = Math.max(34, Math.round(useResponsiveFontSize('displayLarge') * heightScale) * 1.25);
  const emptyTitleSize = Math.round(useResponsiveFontSize('displayMedium') * heightScale);
  const emptyDescSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('large') * heightScale) * 0.6;
  const iconLargeSize = Math.round(useResponsiveIconSize('xxlarge') * heightScale) * 0.8;
  const padding = Math.round(useResponsiveSpacing(24) * heightScale);
  const margin = Math.round(useResponsiveSpacing(24) * heightScale);

  // Filter to only show active messages
  const activeMessages = useMemo(() => {
    return filterActiveMessages(settings.messagesSettings.messages || []);
  }, [settings.messagesSettings.messages]);

  const messagePages = useMemo<MessagePage[]>(() => {
    return buildMessagePages(activeMessages);
  }, [activeMessages]);

  const totalPages = messagePages.length;

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

  const currentPageData = messagePages[currentPage] || messagePages[0];

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
    <View className="flex-1" style={{ paddingHorizontal: padding, paddingVertical: padding }}>
      {/* Header Section */}
      <View style={{ marginBottom: margin }}>
        <View className="flex-row items-center justify-center mb-2">
          <View
            className="flex-row items-center bg-white/55 rounded-xl shadow-lg"
            style={{ paddingHorizontal: padding, paddingVertical: padding / 2 }}
          >
            <Ionicons name="notifications" size={iconSize} color="#3b82f6" />
            <Text className="font-bold text-gray-800" style={{ fontSize: titleSize, marginLeft: padding / 2 }}>
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
        contentContainerStyle={{ justifyContent: 'center', paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {currentPageData.messages.map((message) => (
          <View
            key={message.id}
            className="bg-white/55 rounded-2xl shadow-lg border-l-4 border-blue-500"
            style={{ marginBottom: margin, padding }}
          >
            <View className="flex-row items-start">
              <Text
                className="flex-1 font-medium text-gray-800 leading-relaxed text-center"
                style={{ fontSize: messageSize }}
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
