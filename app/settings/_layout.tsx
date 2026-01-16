import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSettings } from '../../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import GeneralSettingsTab from './general';
import MessagesSettingsTab from './messages';
import ClassesSettingsTab from './classes';
import { router } from 'expo-router';
import DeceasedSettingsTab from './deceased';
import ScheduleSettingsTab from './schedule';

const Tab = createMaterialTopTabNavigator();

export default function SettingsLayout() {
  const { isLoading } = useSettings();
  const { t } = useTranslation();
  const [settingsSaved, setSettingsSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0));

  const handleSave = () => {
    // Simulate saving the settings
    setSettingsSaved(true);

    // Reset the animation value
    fadeAnim.current.setValue(0);

    // Start the blinking effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim.current, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim.current, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 2 },
    ).start(() => {
      // After the blinking, hide the banner
      setSettingsSaved(false);
      router.navigate('/');
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t('loading_settings')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Title */}
      <View className="items-center py-4">
        <Text className="text-3xl font-bold">{t('settings_title')}</Text>
      </View>
      <View className="flex-1 items-center">
        <View className="w-full max-w-2xl flex-1">
          <Tab.Navigator>
            <Tab.Screen name="general" component={GeneralSettingsTab} options={{ title: t('settings_title') }} />
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
        <Animated.View
          className="absolute bottom-12 bg-green-600 p-2.5 rounded-lg"
          style={{ opacity: fadeAnim.current }}
        >
          <Text className="text-white text-base">{t('settings_saved')}</Text>
        </Animated.View>
      )}
    </View>
  );
}
