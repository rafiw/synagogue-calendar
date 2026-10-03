import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { checkForUpdate, applyUpdate, UpdateCheckResult, getCurrentBuildInfo, BuildInfo } from './updateChecker';

export interface UseAutoUpdateOptions {
  enabled?: boolean;
  intervalMinutes?: number;
  autoCheck?: boolean;
  onUpdateDetected?: (result: UpdateCheckResult) => void;
}

export interface UseAutoUpdateReturn {
  isChecking: boolean;
  hasUpdate: boolean;
  lastChecked: Date | null;
  updateInfo: UpdateCheckResult | null;
  currentBuild: BuildInfo;
  checkNow: () => Promise<UpdateCheckResult>;
  applyUpdateNow: () => Promise<void>;
}

export const useAutoUpdate = (options: UseAutoUpdateOptions = {}): UseAutoUpdateReturn => {
  const { enabled = true, intervalMinutes = 30, autoCheck = true, onUpdateDetected } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [currentBuild, setCurrentBuild] = useState<BuildInfo>(getCurrentBuildInfo());

  const lastCheckedRef = useRef<Date | null>(null);
  const initialCheckDoneRef = useRef(false);
  const onUpdateDetectedRef = useRef(onUpdateDetected);
  onUpdateDetectedRef.current = onUpdateDetected;

  const checkNow = useCallback(async (): Promise<UpdateCheckResult> => {
    setIsChecking(true);
    try {
      const result = await checkForUpdate();
      const now = new Date();
      lastCheckedRef.current = now;
      setLastChecked(now);
      setUpdateInfo(result);
      setCurrentBuild(getCurrentBuildInfo());

      if (result.hasUpdate) {
        setHasUpdate(true);
        if (onUpdateDetectedRef.current) {
          onUpdateDetectedRef.current(result);
        }
      }

      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const applyUpdateNow = useCallback(async (): Promise<void> => {
    await applyUpdate(updateInfo?.remoteVersion || updateInfo?.remoteBuildTime);
  }, [updateInfo]);

  useEffect(() => {
    // In dev mode or if disabled / interval <= 0, do not run automated background polling
    if (!enabled || !autoCheck || intervalMinutes <= 0 || __DEV__) return;

    // Run initial check once on mount (with a 10s delay so startup is fast)
    let initialTimer: ReturnType<typeof setTimeout> | undefined;
    if (!initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      initialTimer = setTimeout(() => {
        void checkNow();
      }, 10000);
    }

    // Periodic interval
    const intervalMs = Math.max(5, intervalMinutes) * 60 * 1000;
    const intervalTimer = setInterval(() => {
      void checkNow();
    }, intervalMs);

    // Web listeners for focus and network reconnect
    let cleanupWebListeners: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        void checkNow();
      };
      const handleFocus = () => {
        // Check on focus if last check was more than 15 minutes ago
        const last = lastCheckedRef.current;
        if (!last || Date.now() - last.getTime() > 15 * 60 * 1000) {
          void checkNow();
        }
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('focus', handleFocus);

      cleanupWebListeners = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('focus', handleFocus);
      };
    }

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      if (cleanupWebListeners) cleanupWebListeners();
    };
  }, [enabled, autoCheck, intervalMinutes, checkNow]);

  return {
    isChecking,
    hasUpdate,
    lastChecked,
    updateInfo,
    currentBuild,
    checkNow,
    applyUpdateNow,
  };
};
