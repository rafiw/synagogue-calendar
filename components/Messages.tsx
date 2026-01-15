import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from 'context/settingsContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { defaultPageDisplayTime } from 'utils/utils';

const messagesPerPage = 3.0;
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings) return 0;
  return Math.ceil(localSettings.messages.length / messagesPerPage);
}

const Messages: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [PageDisplayTime] = useState(defaultPageDisplayTime);

  useEffect(() => {
    const updatePages = async () => {
      const subPages = await getSubPages();
      setTotalPages(subPages);
    };
    updatePages();
  }, [settings.messages.length]);

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
    return settings.messages.slice(startIndex, startIndex + messagesPerPage);
  };

  if (!i18n.isInitialized)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );

  return (
    <View className="flex-1">
      {settings.messages.length > 0 ? (
        <View className="flex-1 px-6 py-8">
          {/* Header Section */}
          <View className="mb-8 ">
            <View className="flex-row items-center justify-center mb-2">
              <View className="flex-row items-center bg-white/55 rounded-xl px-6 py-3 shadow-lg">
                <Ionicons name="notifications" size={40} color="#3b82f6" />
                <Text className="text-6xl font-bold text-gray-800 ml-3">{t('msg_title')}</Text>
              </View>
            </View>
            {/* Page Indicators */}
            {totalPages > 1 && (
              <View className="flex-row justify-center mt-4 space-x-2">
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
            {getCurrentPageData().map((message, index) => (
              <View key={index} className="bg-white/55 rounded-2xl shadow-lg mb-6 p-6 border-l-4 border-blue-500">
                <View className="flex-row items-start">
                  <Text className="flex-1 text-3xl font-medium text-gray-800 leading-relaxed text-center">
                    {message}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          {/* Empty State */}
          <View className="items-center bg-white/95 rounded-3xl shadow-xl p-10 max-w-md">
            <View className="bg-blue-100 rounded-full p-6 mb-6">
              <Ionicons name="chatbox-ellipses-outline" size={64} color="#3b82f6" />
            </View>
            <Text className="text-4xl font-bold text-gray-800 text-center mb-3">{t('msg_no_messages')}</Text>
            <Text className="text-xl text-gray-500 text-center mb-8 leading-relaxed">
              {t('msg_empty_description') || 'Add messages to display important announcements and information'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/settings/messages')}
              className="px-8 py-4 bg-blue-500 rounded-xl shadow-md active:opacity-80 flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text className="text-white font-semibold text-xl ml-2">{t('go_to_settings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Messages;
