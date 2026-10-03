import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

export interface BuildInfo {
  version: string;
  buildTime?: string;
  timestamp?: number;
  commit?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  currentBuildTime?: string;
  remoteVersion?: string;
  remoteBuildTime?: string;
  error?: string;
}

// In-memory cache of current build info captured on startup
let cachedCurrentBuildInfo: BuildInfo | null = null;

/**
 * Returns the base URL for fetching version assets on the web.
 * Handles subpaths like https://rafiw.github.io/synagogue-calendar/ cleanly,
 * and ensures sub-routes like /settings or /settings/general never corrupt the root base URL.
 */
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined' || !window.location) return './';

  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';

  // 1. Check for injected <meta name="base-url">
  if (typeof document !== 'undefined') {
    const metaBase = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
    if (metaBase) {
      const normalized = metaBase.endsWith('/') ? metaBase : `${metaBase}/`;
      const fullPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
      return origin ? `${origin}${fullPath}` : fullPath;
    }

    // 2. Derive root base path from loaded bundle script tags (<script src=".../_expo/...">)
    const scripts = document.querySelectorAll('script[src*="_expo/"]');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src');
      if (src) {
        const expoIdx = src.indexOf('_expo/');
        if (expoIdx !== -1) {
          const basePath = src.substring(0, expoIdx);
          const normalized = basePath.endsWith('/') ? basePath : `${basePath}/`;
          const fullPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
          return origin ? `${origin}${fullPath}` : fullPath;
        }
      }
    }
  }

  // 3. Check pathname for known repository subpath
  const pathname = window.location.pathname || '/';
  if (pathname.includes('/synagogue-calendar')) {
    return origin ? `${origin}/synagogue-calendar/` : '/synagogue-calendar/';
  }

  // 4. Strip any sub-routes (e.g. /settings, /settings/general)
  const cleanPath = pathname.split('/settings')[0];
  const dirPath = cleanPath.endsWith('/') ? cleanPath : cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);
  const normalizedDir = dirPath ? (dirPath.startsWith('/') ? dirPath : `/${dirPath}`) : '/';
  const fullPath = normalizedDir.endsWith('/') ? normalizedDir : `${normalizedDir}/`;
  return origin ? `${origin}${fullPath}` : fullPath;
};

/**
 * Read the build info for the currently running app instance.
 */
export const getCurrentBuildInfo = (): BuildInfo => {
  if (cachedCurrentBuildInfo) {
    return cachedCurrentBuildInfo;
  }

  const defaultInfo: BuildInfo = {
    version: '1.0.0',
    buildTime: undefined,
    timestamp: undefined,
  };

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const versionMeta = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
    const commitMeta = document.querySelector('meta[name="git-commit"]')?.getAttribute('content');
    const buildTimeMeta = document.querySelector('meta[name="build-time"]')?.getAttribute('content');
    const timestampMeta = document.querySelector('meta[name="build-timestamp"]')?.getAttribute('content');

    const timestamp = timestampMeta ? parseInt(timestampMeta, 10) : undefined;

    cachedCurrentBuildInfo = {
      version: versionMeta || (commitMeta ? `#${commitMeta}` : defaultInfo.version),
      commit: commitMeta || undefined,
      buildTime: buildTimeMeta || undefined,
      timestamp: !isNaN(Number(timestamp)) ? timestamp : undefined,
    };
    return cachedCurrentBuildInfo;
  }

  // On Native
  if (Updates.manifest) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manifest = Updates.manifest as any;
    defaultInfo.version = manifest.version || manifest.runtimeVersion || '1.0.0';
    if (manifest.createdAt) {
      defaultInfo.buildTime = manifest.createdAt;
      defaultInfo.timestamp = new Date(manifest.createdAt).getTime();
    }
  }

  cachedCurrentBuildInfo = defaultInfo;
  return cachedCurrentBuildInfo;
};

/**
 * Allows explicitly setting or mocking current build info (helpful for testing and initial bootstrap).
 */
export const setCurrentBuildInfo = (info: BuildInfo | null): void => {
  cachedCurrentBuildInfo = info;
};

/**
 * Fetches remote build info from server (web only).
 */
export const fetchRemoteBuildInfoWeb = async (): Promise<BuildInfo | null> => {
  const baseUrl = getBaseUrl();

  // 1. First attempt: fetch version.json
  try {
    const versionUrl = `${baseUrl}version.json?_t=${Date.now()}`;
    const response = await fetch(versionUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return {
          version: typeof data.version === 'string' ? data.version : '1.0.0',
          buildTime: typeof data.buildTime === 'string' ? data.buildTime : undefined,
          timestamp: typeof data.timestamp === 'number' ? data.timestamp : undefined,
          commit: typeof data.commit === 'string' ? data.commit : undefined,
        };
      }
    }
  } catch {
    // Fall back to index.html check
  }

  // 2. Second attempt: fetch index.html and look for meta tags or script hashes
  try {
    const htmlUrl = `${baseUrl}index.html?_t=${Date.now()}`;
    const response = await fetch(htmlUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (response.ok) {
      const html = await response.text();

      // Check build-time and commit meta tags
      const buildTimeMatch = html.match(/<meta\s+name=["']build-time["']\s+content=["']([^"']+)["']/i);
      const versionMatch = html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
      const commitMatch = html.match(/<meta\s+name=["']git-commit["']\s+content=["']([^"']+)["']/i);
      const timestampMatch = html.match(/<meta\s+name=["']build-timestamp["']\s+content=["']([^"']+)["']/i);

      if (buildTimeMatch || versionMatch || commitMatch) {
        const commit = commitMatch ? commitMatch[1] : undefined;
        return {
          version: versionMatch ? versionMatch[1] : commit ? `#${commit}` : '1.0.0',
          commit,
          buildTime: buildTimeMatch ? buildTimeMatch[1] : undefined,
          timestamp: timestampMatch ? parseInt(timestampMatch[1], 10) : undefined,
        };
      }

      // Check script bundle hash
      const scriptMatch = html.match(/entry-([a-f0-9]+)\.js/i);
      if (scriptMatch) {
        return {
          version: '1.0.0',
          commit: scriptMatch[1],
        };
      }
    }
  } catch {
    // Both failed
  }

  return null;
};

/**
 * Checks if a new update is available.
 */
export const checkForUpdate = async (): Promise<UpdateCheckResult> => {
  const current = getCurrentBuildInfo();

  if (Platform.OS === 'web') {
    try {
      const remote = await fetchRemoteBuildInfoWeb();
      if (!remote) {
        return {
          hasUpdate: false,
          currentVersion: current.version,
          currentBuildTime: current.buildTime,
          error: 'Could not fetch remote version info',
        };
      }

      // If current has no build time recorded yet, record the first fetched as baseline
      if (!current.buildTime && remote.buildTime) {
        setCurrentBuildInfo({
          ...current,
          buildTime: remote.buildTime,
          timestamp: remote.timestamp,
          version: remote.version || current.version,
        });
        return {
          hasUpdate: false,
          currentVersion: remote.version || current.version,
          currentBuildTime: remote.buildTime,
        };
      }

      // Check for differences
      let hasUpdate = false;

      if (remote.buildTime && current.buildTime && remote.buildTime !== current.buildTime) {
        hasUpdate = true;
      } else if (remote.timestamp && current.timestamp && remote.timestamp > current.timestamp) {
        hasUpdate = true;
      } else if (remote.version && current.version && remote.version !== current.version) {
        hasUpdate = true;
      } else if (remote.commit && current.commit && remote.commit !== current.commit) {
        hasUpdate = true;
      }

      return {
        hasUpdate,
        currentVersion: current.version,
        currentBuildTime: current.buildTime,
        remoteVersion: remote.version,
        remoteBuildTime: remote.buildTime,
      };
    } catch (err) {
      return {
        hasUpdate: false,
        currentVersion: current.version,
        currentBuildTime: current.buildTime,
        error: err instanceof Error ? err.message : 'Unknown update check error',
      };
    }
  }

  // Native (Android / iOS / EAS)
  try {
    if (!__DEV__ && Updates.isEnabled) {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        return {
          hasUpdate: true,
          currentVersion: current.version,
          currentBuildTime: current.buildTime,
        };
      }
    }
    return {
      hasUpdate: false,
      currentVersion: current.version,
      currentBuildTime: current.buildTime,
    };
  } catch (err) {
    return {
      hasUpdate: false,
      currentVersion: current.version,
      currentBuildTime: current.buildTime,
      error: err instanceof Error ? err.message : 'Unknown native update error',
    };
  }
};

let isApplyingUpdate = false;
const RELOAD_THROTTLE_MS = 60 * 1000; // 60 seconds loop guard

/**
 * Applies the downloaded/available update.
 * On web: clears caches, updates service worker, and reloads with cache-busting version param.
 * Includes loop protection against rapid reloading.
 * On native: reloads using expo-updates.
 */
export const applyUpdate = async (targetVersion?: string): Promise<void> => {
  if (isApplyingUpdate) return;
  isApplyingUpdate = true;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      // Loop protection: check if we recently reloaded for this exact version
      try {
        const lastReloadKey = 'synagogue_last_update_reload';
        const lastReloadRaw = window.sessionStorage?.getItem(lastReloadKey);
        if (lastReloadRaw) {
          const parsed = JSON.parse(lastReloadRaw);
          const timeSince = Date.now() - (parsed.time || 0);
          if (timeSince < RELOAD_THROTTLE_MS && parsed.version === targetVersion) {
            console.warn(
              `[AutoUpdate] Update reload already attempted within ${Math.round(timeSince / 1000)}s for version ${targetVersion}. Skipping duplicate reload.`,
            );
            isApplyingUpdate = false;
            return;
          }
        }
        window.sessionStorage?.setItem(lastReloadKey, JSON.stringify({ time: Date.now(), version: targetVersion }));
      } catch {
        // Ignore storage errors
      }

      // Clear any cache storages
      if (typeof caches !== 'undefined' && caches.keys) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // Ignore
        }
      }

      // Update service worker registrations if any
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.update();
          }
        } catch {
          // Ignore
        }
      }

      // Reload with cache busting query param to avoid loading stale index.html
      try {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('_v', targetVersion || String(Date.now()));
        window.location.replace(currentUrl.toString());
      } catch {
        window.location.reload();
      }
    }
    return;
  }

  // Native
  try {
    if (!__DEV__ && Updates.isEnabled) {
      await Updates.reloadAsync();
    }
  } catch (err) {
    console.error('Failed to reload native update:', err);
  } finally {
    isApplyingUpdate = false;
  }
};
