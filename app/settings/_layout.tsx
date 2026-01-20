import { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, useWindowDimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { useSettings } from '../../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import GeneralSettingsTab from './general';
import MessagesSettingsTab from './messages';
import ClassesSettingsTab from './classes';
import DeceasedSettingsTab from './deceased';
import ScheduleSettingsTab from './schedule';

const Tab = createMaterialTopTabNavigator();

type TabKey = 'general' | 'messages' | 'schedule' | 'classes' | 'deceased';

const TAB_COMPONENTS: Record<TabKey, React.ComponentType> = {
  general: GeneralSettingsTab,
  messages: MessagesSettingsTab,
  schedule: ScheduleSettingsTab,
  classes: ClassesSettingsTab,
  deceased: DeceasedSettingsTab,
};

export default function SettingsLayout() {
  const { isLoading } = useSettings();
  const { t } = useTranslation();
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  // Use sidebar layout for TV/wide screens (height < 700 and width > height)
  const isTVLayout = height < 700 && width > height;

  const handleSave = useCallback(() => {
    setSettingsSaved(true);
    fadeAnim.setValue(0);

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 2 },
    ).start(() => {
      setSettingsSaved(false);
      router.navigate('/');
    });
  }, [fadeAnim]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t('loading_settings')}</Text>
      </View>
    );
  }

  const tabs: { key: TabKey; title: string }[] = [
    { key: 'general', title: t('general_title') },
    { key: 'messages', title: t('messages_title') },
    { key: 'schedule', title: t('schedule_title') },
    { key: 'classes', title: t('classes_title') },
    { key: 'deceased', title: t('deceased_title') },
  ];

  // TV/Wide screen layout: Sidebar navigation on left, content on right
  if (isTVLayout) {
    const ActiveComponent = TAB_COMPONENTS[activeTab];

    return (
      <View className="flex-1 flex-row">
        {/* Left Sidebar */}
        <View className="w-48 bg-gray-100 border-r border-gray-300">
          {/* Title in sidebar */}
          <View className="p-3 border-b border-gray-300">
            <Text className="text-xl font-bold text-center">{t('settings_title')}</Text>
          </View>

          {/* Tab buttons */}
          <ScrollView className="flex-1">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`p-3 border-b border-gray-200 ${activeTab === tab.key ? 'bg-blue-500' : 'bg-transparent'}`}
              >
                <Text className={`text-base ${activeTab === tab.key ? 'text-white font-semibold' : 'text-gray-700'}`}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Save button in sidebar */}
          <View className="p-3 border-t border-gray-300">
            <TouchableOpacity className="bg-blue-500 p-3 rounded-lg items-center" onPress={handleSave}>
              <Text className="text-white font-medium">{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Content Area - Full height for settings content */}
        <View className="flex-1">
          <ActiveComponent />
        </View>

        {/* Save confirmation banner */}
        {settingsSaved && (
          <Animated.View style={[styles.banner, styles.bannerTV, { opacity: fadeAnim }]}>
            <Text className="text-white text-base">{t('settings_saved')}</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // Standard mobile/tablet layout: Top tab navigation
  return (
    <View className="flex-1">
      {/* Title */}
      <View className="items-center py-4">
        <Text className="text-3xl font-bold">{t('settings_title')}</Text>
      </View>
      <View className="flex-1 items-center">
        <View className="w-full max-w-2xl flex-1">
          <Tab.Navigator>
            <Tab.Screen name="general" component={GeneralSettingsTab} options={{ title: t('general_title') }} />
            <Tab.Screen name="messages" component={MessagesSettingsTab} options={{ title: t('messages_title') }} />
            <Tab.Screen name="schedule" component={ScheduleSettingsTab} options={{ title: t('schedule_title') }} />
            <Tab.Screen name="classes" component={ClassesSettingsTab} options={{ title: t('classes_title') }} />
            <Tab.Screen name="deceased" component={DeceasedSettingsTab} options={{ title: t('deceased_title') }} />
          </Tab.Navigator>
        </View>
        <View className="w-full max-w-md p-4">
          <TouchableOpacity className="bg-blue-500 p-4 rounded-lg items-center" onPress={handleSave}>
            <Text className="text-white font-medium text-lg">{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {settingsSaved && (
        <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
          <Text className="text-white text-base">{t('settings_saved')}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
  },
  bannerTV: {
    bottom: 20,
    right: 20,
    left: 'auto',
  },
});
