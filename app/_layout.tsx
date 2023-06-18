import { Stack } from 'expo-router';
import { SettingsProvider, useSettings } from '../context/settingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { useState, useEffect, StrictMode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initializeI18n, i18n } from '../utils/i18n';
import '../global.css';

function AppContent() {
  const { settings, isLoading } = useSettings();
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      await initializeI18n(settings.language);
      setIsI18nInitialized(true);
    };
    initI18n();
  }, [settings.language]);

  if (isLoading || !isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            title: '',
          }}
        />
      </Stack>
    </I18nextProvider>
  );
}

export default function RootLayout() {
  return (
    <StrictMode>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </GestureHandlerRootView>
    </StrictMode>
  );
}
