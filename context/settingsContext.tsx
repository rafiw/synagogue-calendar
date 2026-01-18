import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { cities } from 'assets/data';
import { Settings } from 'utils/defs';

// Type definition for EncryptedStorage
interface IEncryptedStorage {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
}

// Dynamically load EncryptedStorage only on native platforms
let EncryptedStorage: IEncryptedStorage | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  EncryptedStorage = require('react-native-encrypted-storage').default as IEncryptedStorage;
}
const defaultName = 'בית כנסת לדוגמא';

const defaultSettings: Settings = {
  name: defaultName,
  gistId: '',
  gistFileName: 'synagogue-settings.json',
  githubKey: '',
  lastUpdateTime: new Date(),
  language: 'he',
  nusach: 'ashkenaz',
  city: cities[0]?.hebrew_name || '',
  latitude: 31.7667,
  longitude: 35.2333,
  elevation: 0,
  olson: 'Asia/Jerusalem',
  il: true,
  background: '../assets/images/background1.png',
  backgroundSettings: {
    mode: 'image',
    imageUrl: '../assets/images/background1.png',
    solidColor: '#E3F2FD',
    gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
  },
  purimSettings: {
    regular: true,
    shushan: false,
  },
  enableZmanim: true,
  enableClasses: true,
  enableDeceased: true,
  enableMessages: true,
  enableSchedule: true,
  messages: [],
  classes: [],
  deceased: [],
  deceasedSettings: {
    tableRows: 3,
    tableColumns: 2,
    displayMode: 'all',
    defaultTemplate: 'simple',
    imgbbApiKey: '',
  },
  scheduleSettings: {
    columns: [
      {
        id: '1',
        title: 'טור-1',
        prayers: [],
      },
    ],
  },
};

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
const REMOTE_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const GITHUB_KEY_STORAGE_KEY = 'github_token';

// Helper functions for encrypted storage with web fallback
const getEncryptedGithubKey = async (): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      // On web, fall back to AsyncStorage (not encrypted, but works for development)
      const key = await AsyncStorage.getItem(GITHUB_KEY_STORAGE_KEY);
      return key || '';
    } else {
      // On native platforms, use encrypted storage
      if (!EncryptedStorage) {
        throw new Error('EncryptedStorage is not available');
      }
      const key = await EncryptedStorage.getItem(GITHUB_KEY_STORAGE_KEY);
      return key || '';
    }
  } catch (error) {
    console.error('Error retrieving GitHub key:', error);
    return '';
  }
};

const setEncryptedGithubKey = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // On web, fall back to AsyncStorage (not encrypted, but works for development)
      if (key) {
        await AsyncStorage.setItem(GITHUB_KEY_STORAGE_KEY, key);
      } else {
        await AsyncStorage.removeItem(GITHUB_KEY_STORAGE_KEY);
      }
    } else {
      // On native platforms, use encrypted storage
      if (!EncryptedStorage) {
        throw new Error('EncryptedStorage is not available');
      }
      if (key) {
        await EncryptedStorage.setItem(GITHUB_KEY_STORAGE_KEY, key);
      } else {
        await EncryptedStorage.removeItem(GITHUB_KEY_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Error storing GitHub key:', error);
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);
  const latestSettings = useRef(settings);

  const fetchRemoteSettings = async (gistId: string, key: string, gistFileName: string) => {
    if (!gistId || gistId.length <= 5) return null;
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${key}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const gist = await response.json();
      const requiredKeys = ['lastUpdateTime', 'name', 'language']; // Add your required keys

      for (const filename of Object.keys(gist.files)) {
        try {
          if (filename !== gistFileName) continue;
          // Parse the file content as JSON
          const data = JSON.parse(gist.files[filename].content);

          // Check if all required keys are present
          const hasAllRequiredKeys = requiredKeys.every((requiredKey) => requiredKey in data);
          if (hasAllRequiredKeys) {
            // Return the transformed record
            return {
              ...data,
              lastUpdateTime: new Date(data.lastUpdateTime), // Convert timestamp to Date
            };
          }
        } catch (error) {
          console.error('Failed to parse file content as JSON', gist.files[filename].content, error);
        }
      }
      // Return null if no valid file is found
      return null;
    } catch (error) {
      if (error instanceof TypeError) {
        console.error('Network error:', error);
      } else {
        console.error('Other error:', error);
      }
      return null;
    }
  };

  const loadSettings = async () => {
    try {
      // Load local settings
      const localSettingsString = await AsyncStorage.getItem('settings');
      const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;

      // Migrate githubKey from AsyncStorage to encrypted storage if it exists
      if (localSettings?.githubKey) {
        await setEncryptedGithubKey(localSettings.githubKey);
        // Remove githubKey from AsyncStorage
        delete localSettings.githubKey;
        await AsyncStorage.setItem('settings', JSON.stringify(localSettings));
      }

      // Load GitHub key from encrypted storage
      const githubKey = await getEncryptedGithubKey();

      // Use local settings values if available, otherwise fall back to current state
      const gistId = localSettings?.gistId || settings.gistId;
      const gistFileName = localSettings?.gistFileName || settings.gistFileName;

      // Try to fetch remote settings
      const remoteSettings = await fetchRemoteSettings(gistId, githubKey, gistFileName);

      if (!localSettings && !remoteSettings) {
        // First time use - use defaults
        setSettings(defaultSettings);
        return;
      }

      // Use whichever is newer
      let finalSettings;
      if (!remoteSettings) {
        finalSettings = localSettings;
      } else if (!localSettings) {
        finalSettings = remoteSettings;
      } else {
        if (localSettings.name === defaultName && remoteSettings.name !== defaultName) {
          finalSettings = remoteSettings;
        } else {
          const localDate = new Date(localSettings.lastUpdateTime);
          const remoteDate = new Date(remoteSettings.lastUpdateTime);
          finalSettings = remoteDate > localDate ? remoteSettings : localSettings;
        }
      }

      // Ensure deceased settings are properly initialized
      if (finalSettings) {
        // Add githubKey from encrypted storage
        finalSettings.githubKey = githubKey;

        finalSettings.deceased = finalSettings.deceased || [];
        finalSettings.deceasedSettings = {
          tableRows: 3,
          tableColumns: 2,
          displayMode: 'all',
          defaultTemplate: 'simple',
          imgbbApiKey: '',
          ...finalSettings.deceasedSettings,
        };
        finalSettings.scheduleSettings = finalSettings.scheduleSettings || {
          columns: [
            {
              id: '1',
              title: 'Regular Day',
              prayers: [],
            },
            {
              id: '2',
              title: 'Holiday',
              prayers: [],
            },
          ],
        };
        // Ensure background settings are properly initialized
        finalSettings.backgroundSettings = finalSettings.backgroundSettings || {
          mode: 'image',
          imageUrl: finalSettings.background || '../assets/images/background1.png',
          solidColor: '#E3F2FD',
          gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
          gradientStart: { x: 0, y: 0 },
          gradientEnd: { x: 1, y: 1 },
        };
      }

      const settingsToSet = finalSettings || defaultSettings;
      // Ensure githubKey is included in settings state
      settingsToSet.githubKey = githubKey;
      setSettings(settingsToSet);
      latestSettings.current = settingsToSet;

      // Save the resolved settings to AsyncStorage (without githubKey)
      const { githubKey: _, ...settingsWithoutKey } = settingsToSet;
      await AsyncStorage.setItem('settings', JSON.stringify(settingsWithoutKey));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRemoteSettings = async (settings: Settings): Promise<boolean> => {
    try {
      const { githubKey, ...settingsWithoutKey } = settings;
      const response = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${settings.githubKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [settings.gistFileName]: {
              content: JSON.stringify(settingsWithoutKey, null, 4),
            },
          },
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.log('update error ' + error);
        throw new Error(error.message || 'Failed to upload Gist');
      }
      return response.ok;
    } catch (error) {
      console.error('Error updating remote settings:', error);
      return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settings.gistId) return;

    const interval = setInterval(() => {
      void (async () => {
        const currentSettings = latestSettings.current;
        const remoteSettings = await fetchRemoteSettings(
          currentSettings.gistId,
          currentSettings.githubKey,
          currentSettings.gistFileName,
        );
        if (remoteSettings && new Date(remoteSettings.lastUpdateTime) > new Date(currentSettings.lastUpdateTime)) {
          // Add githubKey from encrypted storage
          const githubKey = await getEncryptedGithubKey();
          const settingsWithKey = { ...remoteSettings, githubKey };

          setSettings(settingsWithKey);
          latestSettings.current = settingsWithKey;

          // Store without githubKey in AsyncStorage
          const { githubKey: _, ...settingsWithoutKey } = settingsWithKey;
          await AsyncStorage.setItem('settings', JSON.stringify(settingsWithoutKey));
        }
      })();
    }, REMOTE_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
      // Handle any pending updates
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
        if (hasUnsavedChanges.current) {
          updateRemoteSettings(latestSettings.current);
        }
      }
    };
  }, [settings.gistId]);

  // Monitor network connectivity and refresh settings when connection is restored
  useEffect(() => {
    if (!settings.gistId) return;

    let wasConnected: boolean | null = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;

      // If we just reconnected (was offline, now online)
      if (!wasConnected && isConnected) {
        console.log('Internet connection restored, refreshing settings...');

        // Fetch and update remote settings
        const currentSettings = latestSettings.current;
        fetchRemoteSettings(currentSettings.gistId, currentSettings.githubKey, currentSettings.gistFileName)
          .then(async (remoteSettings) => {
            if (remoteSettings && new Date(remoteSettings.lastUpdateTime) > new Date(currentSettings.lastUpdateTime)) {
              // Add githubKey from encrypted storage
              const githubKey = await getEncryptedGithubKey();
              const settingsWithKey = { ...remoteSettings, githubKey };

              setSettings(settingsWithKey);
              latestSettings.current = settingsWithKey;

              // Store without githubKey in AsyncStorage
              const { githubKey: _, ...settingsWithoutKey } = settingsWithKey;
              await AsyncStorage.setItem('settings', JSON.stringify(settingsWithoutKey));
              console.log('Settings refreshed from remote after reconnection');
            }
          })
          .catch((error) => {
            console.error('Error refreshing settings after reconnection:', error);
          });
      }

      wasConnected = isConnected;
    });

    return () => {
      unsubscribe();
    };
  }, [settings.gistId]);

  useEffect(() => {
    // Cleanup function to clear any existing timer
    return () => {
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
        updateTimer.current = null;
      }
    };
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
        lastUpdateTime: new Date(),
      };

      // If githubKey is being updated, store it in encrypted storage
      if ('githubKey' in newSettings) {
        await setEncryptedGithubKey(newSettings.githubKey || '');
      }

      // Remove githubKey from settings before storing in AsyncStorage
      const { githubKey, ...settingsWithoutKey } = updatedSettings;

      await AsyncStorage.setItem('settings', JSON.stringify(settingsWithoutKey));
      setSettings(updatedSettings);
      latestSettings.current = updatedSettings;
      hasUnsavedChanges.current = true;

      // Clear any existing timer
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }

      // Create new timer
      updateTimer.current = setTimeout(() => {
        void (async () => {
          if (hasUnsavedChanges.current && latestSettings.current.gistId) {
            const success = await updateRemoteSettings(latestSettings.current);
            if (success) {
              hasUnsavedChanges.current = false;
            }
          }
        })();
      }, REMOTE_UPDATE_INTERVAL);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
