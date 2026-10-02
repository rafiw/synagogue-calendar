import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import {
  defaultName,
  defaultSettings,
  mergeSettings,
  SETTINGS_STORAGE_KEY,
  BACKUP_SETTINGS_STORAGE_KEY,
} from '@utils/settingsMerge';
export { defaultName, defaultSettings, mergeSettings, SETTINGS_STORAGE_KEY, BACKUP_SETTINGS_STORAGE_KEY };

export interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveSettings: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  revertToPreviousSettings: () => Promise<boolean>;
  hasBackupSettings: () => Promise<boolean>;
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

const backupCurrentLocalSettings = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (existing) {
      // Validate that it is valid JSON before backing up
      JSON.parse(existing);
      await AsyncStorage.setItem(BACKUP_SETTINGS_STORAGE_KEY, existing);
    }
  } catch (error) {
    console.error('Failed to backup current settings:', error);
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const latestSettings = useRef(settings);
  const pendingRemoteSync = useRef(false);
  const hasPendingEdits = useRef(false);

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
      const requiredKeys = ['lastUpdateTime', 'synagogueSettings', 'zmanimSettings'];
      for (const filename of Object.keys(gist.files)) {
        try {
          if (filename !== gistFileName) continue;
          // Parse the file content as JSON
          const data = JSON.parse(gist.files[filename].content);

          // Check if all required keys are present
          const hasAllRequiredKeys = requiredKeys.every((requiredKey) => requiredKey in data);
          if (hasAllRequiredKeys) {
            // Sanitize remote settings with defaults to guarantee type safety
            return mergeSettings(data, defaultSettings);
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
      const localSettingsString = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      let localSettings: any = null;
      if (localSettingsString) {
        try {
          localSettings = JSON.parse(localSettingsString);
        } catch (parseError) {
          console.error('Corrupted JSON detected in AsyncStorage settings, resetting storage:', parseError);
          localSettings = null;
          await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        }
      }

      // If local settings exist but no backup exists yet, initialize the backup
      const existingBackup = await AsyncStorage.getItem(BACKUP_SETTINGS_STORAGE_KEY);
      if (!existingBackup && localSettingsString && localSettings) {
        try {
          await AsyncStorage.setItem(BACKUP_SETTINGS_STORAGE_KEY, localSettingsString);
        } catch {}
      }

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
        latestSettings.current = defaultSettings;
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
          finalSettings =
            !isNaN(remoteDate.getTime()) && !isNaN(localDate.getTime()) && remoteDate > localDate
              ? remoteSettings
              : localSettings;
        }
      }

      const settingsToSet = mergeSettings(finalSettings, defaultSettings);
      // Ensure githubKey is included in settings state
      if (settingsToSet.githubSettings) {
        settingsToSet.githubSettings.githubKey = githubKey;
      }
      setSettings(settingsToSet);
      latestSettings.current = settingsToSet;
      hasPendingEdits.current = false;

      // Save the resolved settings to AsyncStorage (without githubKey)
      const settingsWithoutKey: any = { ...settingsToSet };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = githubSettingsWithoutKey;
      }
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutKey));
    } catch (error) {
      console.error('Error loading settings, self-healing with default settings:', error);
      setSettings(defaultSettings);
      latestSettings.current = defaultSettings;
      try {
        await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
      } catch (healError) {
        console.error('Failed to write default settings during self-healing:', healError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateRemoteSettings = async (settings: Settings): Promise<boolean> => {
    try {
      const settingsWithoutKey: any = { ...settings };
      const githubKey = settings.githubSettings.githubKey;
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...githubSettingsWithoutKey } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = githubSettingsWithoutKey;
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
      // Don't pull remote updates while user has unsaved edits
      if (hasPendingEdits.current) return;

      void (async () => {
        const currentSettings = latestSettings.current;
        const remoteSettings = await fetchRemoteSettings(
          currentSettings.githubSettings.gistId,
          currentSettings.githubSettings.githubKey,
          currentSettings.githubSettings.gistFileName,
        );
        if (remoteSettings && shouldPreferRemote(currentSettings, remoteSettings)) {
          await applyRemoteSettings(remoteSettings);
        }
      })();
    }, REMOTE_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
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

        // Don't sync while user has unsaved in-memory edits
        if (hasPendingEdits.current) {
          wasConnected = isConnected;
          return;
        }

        void (async () => {
          try {
            const currentSettings = latestSettings.current;

            // Fetch remote first to check for newer data
            const remoteSettings = await fetchRemoteSettings(
              currentSettings.githubSettings.gistId,
              currentSettings.githubSettings.githubKey,
              currentSettings.githubSettings.gistFileName,
            );

            const preferRemote = remoteSettings && shouldPreferRemote(currentSettings, remoteSettings);

            if (preferRemote) {
              // Remote has newer data -- pull it (supersedes any pending push)
              await applyRemoteSettings(remoteSettings);
              pendingRemoteSync.current = false;
              console.log('Settings refreshed from remote after reconnection');
            } else if (pendingRemoteSync.current) {
              // Local is newer and we have a pending push -- retry it
              const success = await updateRemoteSettings(currentSettings);
              if (success) {
                pendingRemoteSync.current = false;
                console.log('Pending remote sync completed after reconnection');
              }
            }
          } catch (error) {
            console.error('Error syncing settings after reconnection:', error);
          }
        })();
      }

      wasConnected = isConnected;
    });

    return () => {
      unsubscribe();
    };
  }, [settings.githubSettings.gistId]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = {
      ...latestSettings.current,
      ...newSettings,
      lastUpdateTime: new Date(),
    };
    setSettings(updatedSettings);
    latestSettings.current = updatedSettings;
    hasPendingEdits.current = true;
  };

  const shouldPreferRemote = (local: Settings, remote: Settings): boolean => {
    const localIsDefault = local.synagogueSettings.name === defaultName || !local.synagogueSettings.name;
    const remoteHasName = remote.synagogueSettings?.name && remote.synagogueSettings.name !== defaultName;

    if (localIsDefault && remoteHasName) return true;

    return new Date(remote.lastUpdateTime) > new Date(local.lastUpdateTime);
  };

  const applyRemoteSettings = async (remoteSettings: Settings) => {
    // Backup existing settings JSON before remote overwrite
    await backupCurrentLocalSettings();

    const githubKey = await getSecureGithubKey();
    const settingsWithKey = { ...remoteSettings };
    if (settingsWithKey.githubSettings) {
      settingsWithKey.githubSettings.githubKey = githubKey;
    }

    setSettings(settingsWithKey);
    latestSettings.current = settingsWithKey;

    // Store without githubKey in AsyncStorage
    const settingsWithoutKey: any = { ...settingsWithKey };
    if (settingsWithoutKey.githubSettings) {
      const { githubKey: _, ...rest } = settingsWithoutKey.githubSettings;
      settingsWithoutKey.githubSettings = rest;
    }
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutKey));
  };

  const saveSettings = async () => {
    try {
      const current = latestSettings.current;

      // Backup existing settings JSON before saving new changes
      await backupCurrentLocalSettings();

      // Store githubKey in encrypted storage
      if (current.githubSettings?.githubKey) {
        await setSecureGithubKey(current.githubSettings.githubKey);
      }

      // Remove githubKey before storing in AsyncStorage
      const settingsWithoutKey: any = { ...current };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...rest } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = rest;
      }

      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutKey));
      hasPendingEdits.current = false;

      // Sync with remote gist
      if (current.githubSettings.gistId) {
        const remoteSettings = await fetchRemoteSettings(
          current.githubSettings.gistId,
          current.githubSettings.githubKey,
          current.githubSettings.gistFileName,
        );

        if (remoteSettings && shouldPreferRemote(current, remoteSettings)) {
          // Remote is preferred -- pull it
          await applyRemoteSettings(remoteSettings);
          pendingRemoteSync.current = false;
        } else {
          // Local is preferred -- push it
          const success = await updateRemoteSettings(current);
          pendingRemoteSync.current = !success;
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      // Backup existing settings JSON before reset
      await backupCurrentLocalSettings();

      const githubKey = await getSecureGithubKey();
      const freshDefaults: Settings = {
        ...defaultSettings,
        lastUpdateTime: new Date(),
      };
      if (freshDefaults.githubSettings) {
        freshDefaults.githubSettings.githubKey = githubKey;
      }

      setSettings(freshDefaults);
      latestSettings.current = freshDefaults;
      hasPendingEdits.current = false;

      const settingsWithoutKey: any = { ...freshDefaults };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...rest } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = rest;
      }

      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutKey));
    } catch (error) {
      console.error('Error resetting settings to defaults:', error);
      throw error;
    }
  };

  const revertToPreviousSettings = async (): Promise<boolean> => {
    try {
      const backupString = await AsyncStorage.getItem(BACKUP_SETTINGS_STORAGE_KEY);
      if (!backupString) return false;

      const parsedBackup = JSON.parse(backupString);
      const resolvedBackup = mergeSettings(parsedBackup, defaultSettings);

      const githubKey = await getSecureGithubKey();
      if (resolvedBackup.githubSettings) {
        resolvedBackup.githubSettings.githubKey = githubKey;
      }

      setSettings(resolvedBackup);
      latestSettings.current = resolvedBackup;
      hasPendingEdits.current = false;

      const settingsWithoutKey: any = { ...resolvedBackup };
      if (settingsWithoutKey.githubSettings) {
        const { githubKey: _, ...rest } = settingsWithoutKey.githubSettings;
        settingsWithoutKey.githubSettings = rest;
      }

      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithoutKey));
      return true;
    } catch (error) {
      console.error('Error reverting to previous settings:', error);
      return false;
    }
  };

  const hasBackupSettings = async (): Promise<boolean> => {
    try {
      const backup = await AsyncStorage.getItem(BACKUP_SETTINGS_STORAGE_KEY);
      if (!backup) return false;
      JSON.parse(backup);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        resetToDefaults,
        revertToPreviousSettings,
        hasBackupSettings,
        isLoading,
      }}
    >
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
