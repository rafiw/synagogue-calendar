import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { cities } from 'assets/data';
import { Settings } from 'utils/defs';
const defaultName = 'בית כנסת לדוגמא';

const defaultSettings: Settings = {
  lastUpdateTime: new Date(),
  githubSettings: {
    gistId: '',
    gistFileName: 'synagogue-settings.json',
    githubKey: '',
  },
  synagogueSettings: {
    name: defaultName,
    language: 'he',
    nusach: 'ashkenaz',
    backgroundSettings: {
      mode: 'gradient',
      imageUrl: '',
      solidColor: '#E3F2FD',
      gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
      gradientStart: { x: 1, y: 1 },
      gradientEnd: { x: 0, y: 0 },
    },
  },
  zmanimSettings: {
    enable: true,
    screenDisplayTime: 10,
    city: cities[0]?.hebrew_name || '',
    latitude: 31.7667,
    longitude: 35.2333,
    elevation: 0,
    olson: 'Asia/Jerusalem',
    il: true,
    purimSettings: {
      regular: true,
      shushan: false,
    },
  },
  messagesSettings: {
    enable: true,
    screenDisplayTime: 10,
    messages: [
      {
        id: 'msg_default_1',
        text: 'מזל טוב למשפחת כהן לרגל הולדת הבן 👶 יהי רצון שיגדל לתורה, לחופה ולמעשים טובים.',
        enabled: true,
      },
      {
        id: 'msg_default_2',
        text: 'אנו שמחים לברך את המתפללים והאורחים החדשים שהצטרפו אלינו היום. תרגישו בבית',
        enabled: true,
      },
      {
        id: 'msg_default_3',
        text: 'החל מהשבוע: שיעור בגמרא עם הרב לוי כל יום שלישי בשעה 20:30 בבית הכנסת.',
        enabled: true,
      },
    ],
  },
  classesSettings: {
    enable: true,
    screenDisplayTime: 10,
    classes: [
      {
        id: 'class_1768698520454_52xjbtgq6',
        day: [0, 1, 2, 3, 4, 6],
        start: '22:00',
        end: '21:00',
        tutor: 'משה כהן',
        subject: 'דף יומי',
      },
      {
        id: 'class_1768767659451_j99pmr5ea',
        day: [5],
        start: '12:00',
        end: '13:00',
        tutor: 'משה כהן',
        subject: 'דף יומי',
      },
      {
        id: 'class_1768767679349_gyuwn19ix',
        day: [0, 3],
        start: '21:00',
        end: '21:00',
        tutor: 'הרב יפרח',
        subject: 'מסילת ישרים',
      },
    ],
  },
  deceasedSettings: {
    enable: true,
    screenDisplayTime: 10,
    deceased: [],
    imgbbApiKey: '',
    displaySettings: {
      tableRows: 3,
      tableColumns: 2,
      displayMode: 'all',
      defaultTemplate: 'simple',
    },
  },
  scheduleSettings: {
    enable: true,
    screenDisplayTime: 10,
    columns: [
      {
        id: '1768569282274',
        title: 'שבת',
        prayers: [
          {
            id: '1768569315318',
            name: 'מנחה ערב שבת',
            time: "10 דק' אחרי כניסת שבת",
          },
          {
            id: '1768569329105',
            name: 'שחרית',
            time: '8:30',
          },
          {
            id: '1768569339611',
            name: 'מנחה שבת',
            time: '16:00',
          },
        ],
      },
      {
        id: '1768768271286',
        title: 'ימי חול',
        prayers: [
          {
            id: '1768768280476',
            name: 'שחרית',
            time: '6:00',
          },
          {
            id: '1768768287501',
            name: 'שחרית',
            time: '7:00',
          },
          {
            id: '1768768296689',
            name: 'מנחה',
            time: '20 דק לפני שקיעה',
          },
          {
            id: '1768768306304',
            name: 'ערבית',
            time: 'סמוך למנחה',
          },
          {
            id: '1768768313552',
            name: 'ערבית',
            time: '20:00',
          },
        ],
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

// Helper functions for secure storage
// expo-secure-store only works on native (iOS/Android), so we fall back to AsyncStorage on web
const getSecureGithubKey = async (): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      const key = await AsyncStorage.getItem(GITHUB_KEY_STORAGE_KEY);
      return key || '';
    }
    const key = await SecureStore.getItemAsync(GITHUB_KEY_STORAGE_KEY);
    return key || '';
  } catch (error) {
    console.error('Error retrieving GitHub key:', error);
    return '';
  }
};

const setSecureGithubKey = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (key) {
        await AsyncStorage.setItem(GITHUB_KEY_STORAGE_KEY, key);
      } else {
        await AsyncStorage.removeItem(GITHUB_KEY_STORAGE_KEY);
      }
      return;
    }
    if (key) {
      await SecureStore.setItemAsync(GITHUB_KEY_STORAGE_KEY, key);
    } else {
      await SecureStore.deleteItemAsync(GITHUB_KEY_STORAGE_KEY);
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
        await setSecureGithubKey(localSettings.githubKey);
        // Remove githubKey from AsyncStorage
        delete localSettings.githubKey;
        await AsyncStorage.setItem('settings', JSON.stringify(localSettings));
      }

      // Load GitHub key from encrypted storage
      const githubKey = await getSecureGithubKey();

      // Use local settings values if available, otherwise fall back to current state
      const gistId = localSettings?.githubSettings?.gistId || localSettings?.gistId || settings.githubSettings.gistId;
      const gistFileName =
        localSettings?.githubSettings?.gistFileName ||
        localSettings?.gistFileName ||
        settings.githubSettings.gistFileName;

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

      // Ensure settings are properly initialized and migrated
      if (finalSettings) {
        // Migrate old structure to new structure if needed
        if (!finalSettings.githubSettings) {
          finalSettings.githubSettings = {
            gistId: finalSettings.gistId || '',
            gistFileName: finalSettings.gistFileName || 'synagogue-settings.json',
            githubKey: githubKey,
          };
        } else {
          finalSettings.githubSettings.githubKey = githubKey;
        }

        if (!finalSettings.synagogueSettings) {
          finalSettings.synagogueSettings = {
            name: finalSettings.name || defaultName,
            language: finalSettings.language || 'he',
            nusach: finalSettings.nusach || 'ashkenaz',
            backgroundSettings:
              finalSettings.backgroundSettings || defaultSettings.synagogueSettings.backgroundSettings,
          };
        }

        if (!finalSettings.zmanimSettings) {
          finalSettings.zmanimSettings = {
            enable: finalSettings.enableZmanim !== undefined ? finalSettings.enableZmanim : true,
            screenDisplayTime: finalSettings.screenDisplayTimes?.zmanim || 10,
            city: finalSettings.city || cities[0]?.hebrew_name || '',
            latitude: finalSettings.latitude || 31.7667,
            longitude: finalSettings.longitude || 35.2333,
            elevation: finalSettings.elevation || 0,
            olson: finalSettings.olson || 'Asia/Jerusalem',
            il: finalSettings.il !== undefined ? finalSettings.il : true,
            purimSettings: finalSettings.purimSettings || { regular: true, shushan: false },
          };
        }

        if (!finalSettings.messagesSettings) {
          finalSettings.messagesSettings = {
            enable: finalSettings.enableMessages !== undefined ? finalSettings.enableMessages : true,
            screenDisplayTime: finalSettings.screenDisplayTimes?.messages || 10,
            messages: finalSettings.messages || [],
          };
        }

        if (!finalSettings.classesSettings) {
          finalSettings.classesSettings = {
            enable: finalSettings.enableClasses !== undefined ? finalSettings.enableClasses : true,
            screenDisplayTime: finalSettings.screenDisplayTimes?.classes || 10,
            classes: finalSettings.classes || [],
          };
        }

        if (!finalSettings.deceasedSettings) {
          finalSettings.deceasedSettings = defaultSettings.deceasedSettings;
        } else {
          // Ensure nested structure
          if (!finalSettings.deceasedSettings.displaySettings) {
            finalSettings.deceasedSettings = {
              enable: finalSettings.enableDeceased !== undefined ? finalSettings.enableDeceased : true,
              screenDisplayTime: finalSettings.screenDisplayTimes?.deceased || 10,
              deceased: finalSettings.deceasedSettings.deceased || [],
              imgbbApiKey: finalSettings.deceasedSettings.imgbbApiKey || '',
              displaySettings: {
                tableRows: finalSettings.deceasedSettings.tableRows || 3,
                tableColumns: finalSettings.deceasedSettings.tableColumns || 2,
                displayMode: finalSettings.deceasedSettings.displayMode || 'all',
                defaultTemplate: finalSettings.deceasedSettings.defaultTemplate || 'simple',
              },
            };
          }
        }

        if (!finalSettings.scheduleSettings) {
          finalSettings.scheduleSettings = defaultSettings.scheduleSettings;
        } else {
          // Ensure enable and screenDisplayTime fields
          if (!('enable' in finalSettings.scheduleSettings)) {
            finalSettings.scheduleSettings = {
              enable: finalSettings.enableSchedule !== undefined ? finalSettings.enableSchedule : true,
              screenDisplayTime: finalSettings.screenDisplayTimes?.schedule || 10,
              columns: finalSettings.scheduleSettings.columns || [],
            };
          }
        }
      }

      const settingsToSet = finalSettings || defaultSettings;
      // Ensure githubKey is included in settings state
      if (settingsToSet.githubSettings) {
        settingsToSet.githubSettings.githubKey = githubKey;
      }
      setSettings(settingsToSet);
      latestSettings.current = settingsToSet;

      // Save the resolved settings to AsyncStorage (without githubKey)
      const settingsWithoutKey = { ...settingsToSet };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = githubSettingsWithoutKey;
      }
      await AsyncStorage.setItem('settings', JSON.stringify(settingsWithoutKey));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRemoteSettings = async (settings: Settings): Promise<boolean> => {
    try {
      const settingsWithoutKey = { ...settings };
      const githubKey = settings.githubSettings.githubKey;
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = githubSettingsWithoutKey as any;
      }
      const response = await fetch(`https://api.github.com/gists/${settings.githubSettings.gistId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [settings.githubSettings.gistFileName]: {
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
    if (!settings.githubSettings.gistId) return;

    const interval = setInterval(() => {
      void (async () => {
        const currentSettings = latestSettings.current;
        const remoteSettings = await fetchRemoteSettings(
          currentSettings.githubSettings.gistId,
          currentSettings.githubSettings.githubKey,
          currentSettings.githubSettings.gistFileName,
        );
        if (remoteSettings && new Date(remoteSettings.lastUpdateTime) > new Date(currentSettings.lastUpdateTime)) {
          // Add githubKey from encrypted storage
          const githubKey = await getSecureGithubKey();
          const settingsWithKey = { ...remoteSettings };
          if (settingsWithKey.githubSettings) {
            settingsWithKey.githubSettings.githubKey = githubKey;
          }

          setSettings(settingsWithKey);
          latestSettings.current = settingsWithKey;

          // Store without githubKey in AsyncStorage
          const settingsWithoutKey = { ...settingsWithKey };
          if (settingsWithoutKey.githubSettings) {
            const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
            settingsWithoutKey.githubSettings = githubSettingsWithoutKey;
          }
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
  }, [settings.githubSettings.gistId]);

  // Monitor network connectivity and refresh settings when connection is restored
  useEffect(() => {
    if (!settings.githubSettings.gistId) return;

    let wasConnected: boolean | null = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;

      // If we just reconnected (was offline, now online)
      if (!wasConnected && isConnected) {
        console.log('Internet connection restored, refreshing settings...');

        // Fetch and update remote settings
        const currentSettings = latestSettings.current;
        fetchRemoteSettings(
          currentSettings.githubSettings.gistId,
          currentSettings.githubSettings.githubKey,
          currentSettings.githubSettings.gistFileName,
        )
          .then(async (remoteSettings) => {
            if (remoteSettings && new Date(remoteSettings.lastUpdateTime) > new Date(currentSettings.lastUpdateTime)) {
              // Add githubKey from encrypted storage
              const githubKey = await getSecureGithubKey();
              const settingsWithKey = { ...remoteSettings };
              if (settingsWithKey.githubSettings) {
                settingsWithKey.githubSettings.githubKey = githubKey;
              }

              setSettings(settingsWithKey);
              latestSettings.current = settingsWithKey;

              // Store without githubKey in AsyncStorage
              const settingsWithoutKey = { ...settingsWithKey };
              if (settingsWithoutKey.githubSettings) {
                const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
                settingsWithoutKey.githubSettings = githubSettingsWithoutKey;
              }
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
  }, [settings.githubSettings.gistId]);

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
      if (newSettings.githubSettings?.githubKey) {
        await setSecureGithubKey(newSettings.githubSettings.githubKey);
      }

      // Remove githubKey from settings before storing in AsyncStorage
      const settingsWithoutKey = { ...updatedSettings };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = githubSettingsWithoutKey as any;
      }

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
          if (hasUnsavedChanges.current && latestSettings.current.githubSettings.gistId) {
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
