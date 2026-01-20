import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from 'context/settingsContext';
import { router } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { defaultPageDisplayTime } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import { Message } from 'utils/defs';
import { isMessageActive, filterActiveMessages } from 'utils/classesHelpers';

const messagesPerPage = 3.0;

export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings?.messages) return 0;

  // Filter to only count active messages
  const activeMessages = localSettings.messages.filter((msg: Message) => isMessageActive(msg));
  return Math.ceil(activeMessages.length / messagesPerPage);
}

const Messages: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [PageDisplayTime] = useState(defaultPageDisplayTime);
  const heightScale = useHeightScale();

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('displayLarge') * heightScale);
  const messageSize = Math.round(useResponsiveFontSize('headingLarge') * heightScale);
  const emptyTitleSize = Math.round(useResponsiveFontSize('displayMedium') * heightScale);
  const emptyDescSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('large') * heightScale);
  const iconLargeSize = Math.round(useResponsiveIconSize('xxlarge') * heightScale);
  const padding = Math.round(useResponsiveSpacing(24) * heightScale);
  const margin = Math.round(useResponsiveSpacing(24) * heightScale);

  // Filter to only show active messages
  const activeMessages = useMemo(() => {
    return filterActiveMessages(settings.messages);
  }, [settings.messages]);

  useEffect(() => {
    const pages = Math.ceil(activeMessages.length / messagesPerPage);
    setTotalPages(pages);
    // Reset to first page if current page is out of bounds
    if (currentPage >= pages && pages > 0) {
      setCurrentPage(0);
    }
  }, [activeMessages.length, currentPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (totalPages > 0) {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }
    }, PageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, [PageDisplayTime, totalPages]);

  const getCurrentPageData = () => {
    const startIndex = currentPage * messagesPerPage;
    return activeMessages.slice(startIndex, startIndex + messagesPerPage);
  };

  if (!i18n.isInitialized)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );

  return (
    <View className="flex-1">
      {activeMessages.length > 0 ? (
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
            {getCurrentPageData().map((message) => (
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
      ) : (
        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: padding }}>
          {/* Empty State */}
          <View className="items-center bg-white/95 rounded-3xl shadow-xl max-w-md" style={{ padding: padding * 2 }}>
            <View className="bg-blue-100 rounded-full" style={{ padding: padding, marginBottom: padding }}>
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
      )}
    </View>
  );
};

export default Messages;
