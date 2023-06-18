import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSettings } from '../../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import GeneralSettingsTab from './general';
import MessagesSettingsTab from './messages';
import ClassesSettingsTab from './classes';
import { router, useNavigation } from 'expo-router';
import DeceasedSettingsTab from './deceased';
import { showConfirm } from '../../utils/alert';

const Tab = createMaterialTopTabNavigator();

export default function SettingsLayout() {
  const { settings, updateSettings, isLoading } = useSettings();
  // const { t, i18n } = useTranslation(undefined, { useSuspense: false });
  const { t, i18n } = useTranslation();
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [hasUnsavedFormChanges, setHasUnsavedFormChanges] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity set to 0
  const navigation = useNavigation();

  // Poll for changes to the global unsaved changes flag
  useEffect(() => {
    const interval = setInterval(() => {
      const hasChanges = (global as any).__deceasedFormHasUnsavedChanges || false;
      setHasUnsavedFormChanges(hasChanges);
    }, 300); // Check every 300ms

    return () => clearInterval(interval);
  }, []);

  // Check for unsaved changes before navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const hasUnsavedChanges = (global as any).__deceasedFormHasUnsavedChanges;

      if (!hasUnsavedChanges) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation dialog
      showConfirm(
        t('unsaved_changes'),
        t('unsaved_changes_message'),
        () => {
          // If user confirms, clear the flag and navigate
          (global as any).__deceasedFormHasUnsavedChanges = false;
          navigation.dispatch(e.data.action);
        },
        undefined,
        {
          confirmText: t('discard'),
          cancelText: t('deceased_cancel'),
          confirmStyle: 'destructive',
        },
      );
    });

    return unsubscribe;
  }, [navigation, t]);

  const handleSave = useCallback(async () => {
    // Check for unsaved changes in deceased form
    const hasUnsavedChanges = (global as any).__deceasedFormHasUnsavedChanges;

    if (hasUnsavedChanges) {
      showConfirm(
        t('unsaved_changes'),
        t('unsaved_person_warning'),
        () => {
          // User wants to continue without saving the person
          (global as any).__deceasedFormHasUnsavedChanges = false;
          proceedWithSave();
        },
        undefined,
        {
          confirmText: t('continue_without_saving'),
          cancelText: t('go_back'),
          confirmStyle: 'destructive',
        },
      );
      return;
    }

    proceedWithSave();
  }, [t]);

  const proceedWithSave = () => {
    // Simulate saving the settings
    setSettingsSaved(true);

    // Reset the animation value
    fadeAnim.setValue(0);

    // Start the blinking effect
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
            <Tab.Screen name="classes" component={ClassesSettingsTab} options={{ title: t('classes_title') }} />
            <Tab.Screen name="deceased" component={DeceasedSettingsTab} options={{ title: t('deceased_title') }} />
          </Tab.Navigator>
        </View>
        <View className="w-full max-w-md p-4">
          {hasUnsavedFormChanges && (
            <View className="bg-yellow-100 border border-yellow-400 p-2 rounded-lg mb-2">
              <Text className="text-yellow-800 text-center text-sm font-medium">⚠️ {t('unsaved_person_in_form')}</Text>
            </View>
          )}
          <TouchableOpacity className="bg-blue-500 p-4 rounded-lg items-center" onPress={handleSave}>
            <Text className="text-white font-medium text-lg">{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {settingsSaved && (
        <Animated.View className="absolute bottom-12 bg-green-600 p-2.5 rounded-lg" style={{ opacity: fadeAnim }}>
          <Text className="text-white text-base">{t('settings_saved')}</Text>
        </Animated.View>
      )}
    </View>
  );
}
