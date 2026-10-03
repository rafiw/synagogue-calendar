import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SETTINGS_STORAGE_KEY, BACKUP_SETTINGS_STORAGE_KEY } from '@context/settingsContext';
import { isChunkLoadError, CHUNK_RELOAD_KEY, CHUNK_RELOAD_COOLDOWN_MS } from '@utils/lazyWithRetry';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasBackup: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      hasBackup: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidMount() {
    this.checkBackup();
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
    this.checkBackup();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && isChunkLoadError(error)) {
      try {
        const lastReload = window.sessionStorage?.getItem(CHUNK_RELOAD_KEY);
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > CHUNK_RELOAD_COOLDOWN_MS) {
          window.sessionStorage?.setItem(CHUNK_RELOAD_KEY, String(now));
          console.warn('[ErrorBoundary] Stale chunk detected after deployment. Auto-reloading application...', error);
          this.handleReload();
        }
      } catch {
        // Fall back to rendering UI
      }
    }
  }

  checkBackup = () => {
    AsyncStorage.getItem(BACKUP_SETTINGS_STORAGE_KEY)
      .then((backup) => {
        if (backup) {
          try {
            JSON.parse(backup);
            this.setState({ hasBackup: true });
          } catch {
            this.setState({ hasBackup: false });
          }
        } else {
          this.setState({ hasBackup: false });
        }
      })
      .catch(() => {
        this.setState({ hasBackup: false });
      });
  };

  handleRevertSettings = async () => {
    try {
      const backup = await AsyncStorage.getItem(BACKUP_SETTINGS_STORAGE_KEY);
      if (backup) {
        JSON.parse(backup);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, backup);
        if (this.props.onReset) {
          this.props.onReset();
        }
        this.handleReload();
        return;
      }
    } catch (e) {
      console.error('Failed to revert settings from ErrorBoundary:', e);
    }
    this.handleReload();
  };

  handleResetSettings = async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      if (this.props.onReset) {
        this.props.onReset();
      }
      this.handleReload();
    } catch (e) {
      console.error('Failed to reset settings from ErrorBoundary:', e);
      this.handleReload();
    }
  };

  handleReload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = window.location.origin + window.location.pathname;
    } else {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  handleGoToSettings = () => {
    this.setState({ hasError: false, error: null, errorInfo: null }, () => {
      try {
        router.push('/settings');
      } catch (e) {
        console.error('Navigation to settings failed from ErrorBoundary:', e);
        this.handleReload();
      }
    });
  };

  render() {
    if (this.state.hasError) {
      const isChunk = isChunkLoadError(this.state.error);

      if (isChunk) {
        return (
          <View className="flex-1 bg-gray-100 justify-center items-center p-6">
            <View className="max-w-md w-full bg-white rounded-2xl border border-blue-200 p-6 shadow-xl">
              <View className="items-center mb-4">
                <Text className="text-2xl font-bold text-blue-600 mb-2">Application Updated</Text>
                <Text className="text-gray-600 text-center text-sm">
                  A new version of the synagogue calendar is available. Please reload the page to load the latest
                  components.
                </Text>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  onPress={this.handleReload}
                  className="w-full bg-blue-600 py-3 rounded-xl items-center shadow-sm"
                >
                  <Text className="text-white font-semibold">Reload Application</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }

      return (
        <View className="flex-1 bg-gray-100 justify-center items-center p-6">
          <View className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-red-200">
            <View className="items-center mb-4">
              <Text className="text-2xl font-bold text-red-600 mb-2">
                {this.props.fallbackTitle || 'Something went wrong'}
              </Text>
              <Text className="text-gray-600 text-center text-sm">
                The application encountered an unexpected error. You can try reloading, reverting to previous working
                settings, navigating to settings, or resetting settings to defaults.
              </Text>
            </View>

            {this.state.error && (
              <ScrollView className="max-h-32 bg-red-50 p-3 rounded-lg mb-6 border border-red-100">
                <Text className="text-xs text-red-800 font-mono">
                  {this.state.error.name}: {this.state.error.message}
                </Text>
              </ScrollView>
            )}

            <View className="gap-3">
              <TouchableOpacity
                onPress={this.handleReload}
                className="w-full bg-blue-600 py-3 rounded-xl items-center shadow-sm"
              >
                <Text className="text-white font-semibold">Try Again / Reload</Text>
              </TouchableOpacity>

              {this.state.hasBackup && (
                <TouchableOpacity
                  onPress={() => {
                    void this.handleRevertSettings();
                  }}
                  className="w-full bg-amber-600 py-3 rounded-xl items-center shadow-sm"
                >
                  <Text className="text-white font-semibold">Revert to Previous Settings</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={this.handleGoToSettings}
                className="w-full bg-gray-800 py-3 rounded-xl items-center shadow-sm"
              >
                <Text className="text-white font-semibold">Open Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  void this.handleResetSettings();
                }}
                className="w-full bg-red-100 py-3 rounded-xl items-center border border-red-300"
              >
                <Text className="text-red-700 font-semibold">Reset Settings to Defaults</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
