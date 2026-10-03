import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkForUpdate,
  getCurrentBuildInfo,
  setCurrentBuildInfo,
  getBaseUrl,
  BuildInfo,
} from '../utils/updateChecker';
import { mergeSettings, defaultSettings } from '../utils/settingsMerge';

describe('updateChecker', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentBuildInfo(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setCurrentBuildInfo(null);
  });

  describe('buildInfo management', () => {
    it('allows setting and reading current build info', () => {
      const mockBuild: BuildInfo = {
        version: '1.2.3',
        buildTime: '2026-10-02T12:00:00.000Z',
        timestamp: 1727870400000,
        commit: 'abcdef1',
      };

      setCurrentBuildInfo(mockBuild);
      expect(getCurrentBuildInfo()).toEqual(mockBuild);
    });

    it('returns default fallback when no build info is set', () => {
      const build = getCurrentBuildInfo();
      expect(build.version).toBeDefined();
    });
  });

  describe('getBaseUrl', () => {
    it('returns a valid base URL string', () => {
      const url = getBaseUrl();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });

  describe('checkForUpdate (Web)', () => {
    it('detects update when remote buildTime is different', async () => {
      setCurrentBuildInfo({
        version: '1.0.0',
        buildTime: '2026-10-02T10:00:00.000Z',
        timestamp: 1000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0.0',
          buildTime: '2026-10-02T11:00:00.000Z',
          timestamp: 2000,
        }),
      });

      const result = await checkForUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.remoteBuildTime).toBe('2026-10-02T11:00:00.000Z');
    });

    it('detects update when remote version is newer', async () => {
      setCurrentBuildInfo({
        version: '1.0.0',
        buildTime: '2026-10-02T10:00:00.000Z',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.1.0',
          buildTime: '2026-10-02T10:00:00.000Z',
        }),
      });

      const result = await checkForUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.remoteVersion).toBe('1.1.0');
    });

    it('reports no update when remote matches current build', async () => {
      const buildTime = '2026-10-02T10:00:00.000Z';
      setCurrentBuildInfo({
        version: '1.0.0',
        buildTime,
        timestamp: 1000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0.0',
          buildTime,
          timestamp: 1000,
        }),
      });

      const result = await checkForUpdate();
      expect(result.hasUpdate).toBe(false);
      expect(result.currentBuildTime).toBe(buildTime);
    });

    it('falls back to index.html when version.json is not found (404)', async () => {
      setCurrentBuildInfo({
        version: '1.0.0',
        buildTime: '2026-10-02T10:00:00.000Z',
      });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('version.json')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({
          ok: true,
          text: async () =>
            '<html><head><meta name="build-time" content="2026-10-02T14:00:00.000Z"></head><body></body></html>',
        });
      });

      const result = await checkForUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.remoteBuildTime).toBe('2026-10-02T14:00:00.000Z');
    });

    it('handles network failure gracefully without throwing', async () => {
      setCurrentBuildInfo({
        version: '1.0.0',
        buildTime: '2026-10-02T10:00:00.000Z',
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const result = await checkForUpdate();
      expect(result.hasUpdate).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('settingsMerge - autoUpdateSettings', () => {
    it('provides default autoUpdateSettings when missing', () => {
      const merged = mergeSettings({});
      expect(merged.synagogueSettings.autoUpdateSettings).toBeDefined();
      expect(merged.synagogueSettings.autoUpdateSettings?.enable).toBe(true);
      expect(merged.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes).toBe(1440);
    });

    it('preserves valid custom autoUpdateSettings', () => {
      const merged = mergeSettings({
        synagogueSettings: {
          ...defaultSettings.synagogueSettings,
          autoUpdateSettings: {
            enable: true,
            checkIntervalMinutes: 10080, // weekly
          },
        },
      });
      expect(merged.synagogueSettings.autoUpdateSettings?.enable).toBe(true);
      expect(merged.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes).toBe(10080);
    });

    it('enforces minimum 60 minutes interval on invalid/too low non-zero values', () => {
      const merged = mergeSettings({
        synagogueSettings: {
          ...defaultSettings.synagogueSettings,
          autoUpdateSettings: {
            enable: true,
            checkIntervalMinutes: 2, // too low, should upgrade to minimum 60
          },
        },
      });
      expect(merged.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes).toBe(60);
    });

    it("handles 0 minutes as don't check / disabled", () => {
      const merged = mergeSettings({
        synagogueSettings: {
          ...defaultSettings.synagogueSettings,
          autoUpdateSettings: {
            checkIntervalMinutes: 0,
          },
        },
      });
      expect(merged.synagogueSettings.autoUpdateSettings?.enable).toBe(false);
      expect(merged.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes).toBe(0);
    });

    it('maps enable: false to 0 minutes for backward compatibility', () => {
      const merged = mergeSettings({
        synagogueSettings: {
          ...defaultSettings.synagogueSettings,
          autoUpdateSettings: {
            enable: false,
          },
        },
      });
      expect(merged.synagogueSettings.autoUpdateSettings?.enable).toBe(false);
      expect(merged.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes).toBe(0);
    });
  });
});
