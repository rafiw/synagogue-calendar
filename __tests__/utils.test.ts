import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHebrewDayName, getSettings, isRTL, isRTL2, getNoScreenText, safeJsonParse } from '../utils/utils';
import { mergeSettings } from '../utils/settingsMerge';
import { isPortraitLayout, getEffectiveDimensions } from '../utils/responsive';
import {
  generateQrMatrix,
  QRErrorCorrectLevel,
  buildCredentialsSetupUrl,
  parseCredentialsFromParams,
} from '../utils/qrcode';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('utils', () => {
  describe('getHebrewDayName', () => {
    it('should return correct Hebrew day names', () => {
      expect(getHebrewDayName(0)).toBe('ראשון');
      expect(getHebrewDayName(1)).toBe('שני');
      expect(getHebrewDayName(2)).toBe('שלישי');
      expect(getHebrewDayName(3)).toBe('רביעי');
      expect(getHebrewDayName(4)).toBe('חמישי');
      expect(getHebrewDayName(5)).toBe('שישי');
      expect(getHebrewDayName(6)).toBe('שבת');
    });

    it('should return empty string for invalid day number', () => {
      expect(getHebrewDayName(7)).toBe('');
      expect(getHebrewDayName(-1)).toBe('');
      expect(getHebrewDayName(99)).toBe('');
    });

    it('should handle boundary values', () => {
      expect(getHebrewDayName(0)).toBeTruthy();
      expect(getHebrewDayName(6)).toBeTruthy();
    });
  });

  describe('getSettings', () => {
    it('should return default settings object', () => {
      const settings = getSettings();
      expect(settings).toHaveProperty('language');
      expect(settings).toHaveProperty('latitude');
      expect(settings).toHaveProperty('longitude');
    });

    it('should return Hebrew as default language', () => {
      const settings = getSettings();
      expect(settings.language).toBe('he');
    });

    it('should return default coordinates', () => {
      const settings = getSettings();
      expect(settings.latitude).toBe('32.1169878');
      expect(settings.longitude).toBe('35.1175534');
    });

    it('should return consistent values', () => {
      const settings1 = getSettings();
      const settings2 = getSettings();
      expect(settings1).toEqual(settings2);
    });
  });

  describe('isRTL', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return true when language is Hebrew', async () => {
      const mockSettings = { language: 'he' };
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockSettings));

      const result = await isRTL();
      expect(result).toBe(true);
    });

    it('should return false when language is English', async () => {
      const mockSettings = { language: 'en' };
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockSettings));

      const result = await isRTL();
      expect(result).toBe(false);
    });

    it('should return true when no settings found (default)', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

      const result = await isRTL();
      expect(result).toBe(true);
    });

    it('should handle invalid JSON gracefully', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue('invalid json');

      const result = await isRTL();
      expect(result).toBe(true);
    });

    it('should call AsyncStorage with correct key', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

      await isRTL();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('settings');
    });
  });

  describe('isRTL2', () => {
    it('should return true for Hebrew', () => {
      expect(isRTL2('he')).toBe(true);
    });

    it('should return false for English', () => {
      expect(isRTL2('en')).toBe(false);
    });

    it('should be consistent', () => {
      expect(isRTL2('he')).toBe(true);
      expect(isRTL2('he')).toBe(true);
      expect(isRTL2('en')).toBe(false);
      expect(isRTL2('en')).toBe(false);
    });
  });

  describe('getNoScreenText', () => {
    it('should return Hebrew text for Hebrew language', () => {
      const text = getNoScreenText('he');
      expect(text).toBe('לא נמצא מסך. אנא בדוק בהגדרות.');
      expect(text).toContain('מסך');
    });

    it('should return English text for English language', () => {
      const text = getNoScreenText('en');
      expect(text).toBe('No screen found. Please check the settings.');
      expect(text).toContain('screen');
    });

    it('should return different text for different languages', () => {
      const heText = getNoScreenText('he');
      const enText = getNoScreenText('en');
      expect(heText).not.toBe(enText);
    });

    it('should always return non-empty string', () => {
      expect(getNoScreenText('he')).toBeTruthy();
      expect(getNoScreenText('en')).toBeTruthy();
    });
  });

  describe('integration tests', () => {
    it('should have consistent RTL behavior between isRTL2 and isRTL', async () => {
      const mockSettings = { language: 'he' };
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockSettings));

      const asyncResult = await isRTL();
      const syncResult = isRTL2('he');

      expect(asyncResult).toBe(syncResult);
    });

    it('should work with default settings', () => {
      const settings = getSettings();
      const isRtl = isRTL2(settings.language as 'he' | 'en');
      expect(isRtl).toBe(true);
    });

    it('should provide appropriate error message based on language', () => {
      const settings = getSettings();
      const message = getNoScreenText(settings.language as 'he' | 'en');
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('safeJsonParse', () => {
    it('should correctly parse valid JSON', () => {
      const data = { hello: 'world', num: 42 };
      expect(safeJsonParse(JSON.stringify(data), null)).toEqual(data);
    });

    it('should return fallback for invalid JSON strings without throwing', () => {
      expect(safeJsonParse('{invalid json', { fallback: true })).toEqual({ fallback: true });
      expect(safeJsonParse('NaN', { fallback: true })).toEqual({ fallback: true });
    });

    it('should return fallback for null or undefined input', () => {
      expect(safeJsonParse(null, 'default')).toBe('default');
      expect(safeJsonParse(undefined, 'default')).toBe('default');
      expect(safeJsonParse('', 'default')).toBe('default');
    });
  });

  describe('mergeSettings', () => {
    it('should gracefully handle null, undefined, or corrupt non-object inputs', () => {
      const result = mergeSettings(null);
      expect(result).toBeDefined();
      expect(result.zmanimSettings.latitude).toBe(31.7667);

      const invalidResult = mergeSettings('not an object');
      expect(invalidResult.zmanimSettings.latitude).toBe(31.7667);
    });

    it('should fall back to default coordinates when latitude/longitude is null, NaN, or out of range', () => {
      const corruptSettings = {
        zmanimSettings: {
          latitude: null,
          longitude: NaN,
        },
      };
      const merged = mergeSettings(corruptSettings);
      expect(merged.zmanimSettings.latitude).toBe(31.7667);
      expect(merged.zmanimSettings.longitude).toBe(35.2333);

      const outOfRange = {
        zmanimSettings: {
          latitude: 150,
          longitude: -300,
        },
      };
      const mergedOutOfRange = mergeSettings(outOfRange);
      expect(mergedOutOfRange.zmanimSettings.latitude).toBe(31.7667);
      expect(mergedOutOfRange.zmanimSettings.longitude).toBe(35.2333);
    });

    it('should preserve valid custom coordinates', () => {
      const custom = {
        zmanimSettings: {
          latitude: 32.0853,
          longitude: 34.7818,
        },
      };
      const merged = mergeSettings(custom);
      expect(merged.zmanimSettings.latitude).toBe(32.0853);
      expect(merged.zmanimSettings.longitude).toBe(34.7818);
    });

    it('should infer candleLightingMins when missing from saved settings (backward compatibility)', () => {
      const jerusalemSaved = {
        zmanimSettings: {
          city: 'Jerusalem',
          latitude: 31.7683,
          longitude: 35.2137,
          olson: 'Asia/Jerusalem',
        },
      };
      expect(mergeSettings(jerusalemSaved).zmanimSettings.candleLightingMins).toBe(40);

      const haifaSaved = {
        zmanimSettings: {
          city: 'חיפה',
          latitude: 32.794,
          longitude: 34.9896,
          olson: 'Asia/Jerusalem',
        },
      };
      expect(mergeSettings(haifaSaved).zmanimSettings.candleLightingMins).toBe(30);

      const telAvivSaved = {
        zmanimSettings: {
          city: 'Tel Aviv',
          latitude: 32.0853,
          longitude: 34.7818,
          olson: 'Asia/Tel_Aviv',
        },
      };
      expect(mergeSettings(telAvivSaved).zmanimSettings.candleLightingMins).toBe(20);

      const diasporaSaved = {
        zmanimSettings: {
          city: 'New York',
          latitude: 40.7128,
          longitude: -74.006,
          olson: 'America/New_York',
        },
      };
      expect(mergeSettings(diasporaSaved).zmanimSettings.candleLightingMins).toBe(18);

      const customMinsSaved = {
        zmanimSettings: {
          city: 'Tel Aviv',
          latitude: 32.0853,
          longitude: 34.7818,
          olson: 'Asia/Jerusalem',
          candleLightingMins: 40,
        },
      };
      expect(mergeSettings(customMinsSaved).zmanimSettings.candleLightingMins).toBe(40);
    });

    it('should preserve or default screenOrientation safely', () => {
      expect(mergeSettings({}).synagogueSettings.screenOrientation).toBe('auto');
      expect(
        mergeSettings({ synagogueSettings: { screenOrientation: 'vertical' } }).synagogueSettings.screenOrientation,
      ).toBe('vertical');
      expect(
        mergeSettings({ synagogueSettings: { screenOrientation: 'horizontal' } }).synagogueSettings.screenOrientation,
      ).toBe('horizontal');
      expect(
        mergeSettings({ synagogueSettings: { screenOrientation: 'invalid' } }).synagogueSettings.screenOrientation,
      ).toBe('auto');
    });

    it('should evaluate isPortraitLayout based on screenOrientation override or dimensions', () => {
      // Forced vertical on wide screen
      expect(isPortraitLayout('vertical', 1920, 1080)).toBe(true);
      // Forced horizontal on narrow/portrait screen
      expect(isPortraitLayout('horizontal', 390, 844)).toBe(false);
      // Automatic mode
      expect(isPortraitLayout('auto', 1920, 1080)).toBe(false);
      expect(isPortraitLayout('auto', 1080, 1920)).toBe(true);
      expect(isPortraitLayout(undefined, 390, 844)).toBe(true);
    });

    it('should compute getEffectiveDimensions with 90deg rotation and swapped dimensions for rotated TV', () => {
      // TV physically rotated 90 degrees (OS reports 1920x1080 landscape, user selected 'vertical')
      const rotatedVertical = getEffectiveDimensions('vertical', 1920, 1080);
      expect(rotatedVertical).toEqual({
        width: 1080,
        height: 1920,
        physicalWidth: 1920,
        physicalHeight: 1080,
        isRotated: true,
        rotationDegrees: '90deg',
      });

      // Normal landscape TV with 'horizontal' or 'auto'
      const normalLandscape = getEffectiveDimensions('horizontal', 1920, 1080);
      expect(normalLandscape).toEqual({
        width: 1920,
        height: 1080,
        physicalWidth: 1920,
        physicalHeight: 1080,
        isRotated: false,
        rotationDegrees: '0deg',
      });

      const autoLandscape = getEffectiveDimensions('auto', 1920, 1080);
      expect(autoLandscape.isRotated).toBe(false);
      expect(autoLandscape.width).toBe(1920);
      expect(autoLandscape.height).toBe(1080);
    });

    it('should defensively guard arrays from non-array corruptions', () => {
      const corruptArrays = {
        classesSettings: {
          classes: 'not an array',
        },
        messagesSettings: {
          messages: null,
        },
        scheduleSettings: {
          columns: {},
        },
      };
      const merged = mergeSettings(corruptArrays);
      expect(Array.isArray(merged.classesSettings.classes)).toBe(true);
      expect(Array.isArray(merged.messagesSettings.messages)).toBe(true);
      expect(Array.isArray(merged.scheduleSettings.columns)).toBe(true);
    });
  });

  describe('settings backup storage', () => {
    it('defines distinct keys for primary and backup settings', async () => {
      const { SETTINGS_STORAGE_KEY, BACKUP_SETTINGS_STORAGE_KEY } = await import('../utils/settingsMerge');
      expect(SETTINGS_STORAGE_KEY).toBe('settings');
      expect(BACKUP_SETTINGS_STORAGE_KEY).toBe('settings_backup');
      expect(SETTINGS_STORAGE_KEY).not.toBe(BACKUP_SETTINGS_STORAGE_KEY);
    });

    it('can restore previous valid settings from backup json', () => {
      const backupJson = {
        synagogueSettings: {
          name: 'בית כנסת קודם',
          language: 'he',
        },
        zmanimSettings: {
          latitude: 31.77,
          longitude: 35.21,
        },
      };

      const restored = mergeSettings(backupJson);
      expect(restored.synagogueSettings.name).toBe('בית כנסת קודם');
      expect(restored.zmanimSettings.latitude).toBe(31.77);
      expect(restored.zmanimSettings.longitude).toBe(35.21);
      // Fallback defaults should be preserved
      expect(restored.messagesSettings.enable).toBe(true);
    });
  });

  describe('QR code and credentials helpers', () => {
    it('generates valid square QR matrices across error correction levels and payload sizes', () => {
      const mShort = generateQrMatrix('abc123', QRErrorCorrectLevel.L);
      expect(mShort.length).toBe(21); // Type 1 = 21x21
      expect(mShort[0]?.length).toBe(21);
      // Top-left finder pattern corner and center should be dark
      expect(mShort[0]?.[0]).toBe(true);
      expect(mShort[3]?.[3]).toBe(true);

      const mMedium = generateQrMatrix(
        'https://rafiw.github.io/synagogue-calendar/settings/general?gistId=1234567890abcdef&githubKey=ghp_testkey123456&imgbbKey=imgbb_987654',
        QRErrorCorrectLevel.M,
      );
      expect(mMedium.length).toBeGreaterThan(21);
      expect(mMedium.length).toBe(mMedium[0]?.length);

      // Large payload (Type >= 7 to cover setupTypeNumber and 16-bit length header)
      const longPayload = 'https://example.com/' + 'a'.repeat(250);
      const mLargeQ = generateQrMatrix(longPayload, QRErrorCorrectLevel.Q);
      expect(mLargeQ.length).toBeGreaterThanOrEqual(45); // Type 7 is 45x45

      const mHigh = generateQrMatrix(' UTF-8 שלום עולם ', QRErrorCorrectLevel.H);
      expect(mHigh.length).toBeGreaterThanOrEqual(21);
    });

    it('builds setup URL with only non-empty credentials', () => {
      const urlAll = buildCredentialsSetupUrl(
        {
          gistId: ' gist123 ',
          githubKey: ' ghp_secret ',
          imgbbApiKey: ' imgbb_key ',
        },
        'https://example.com/settings/general',
      );
      expect(urlAll).toBe(
        'https://example.com/settings/general?gistId=gist123&githubKey=ghp_secret&imgbbKey=imgbb_key',
      );

      const urlEmpty = buildCredentialsSetupUrl({}, 'https://example.com/settings/general');
      expect(urlEmpty).toBe('https://example.com/settings/general');
    });

    it('parses credentials from URL query params', () => {
      expect(parseCredentialsFromParams({})).toBeNull();
      expect(parseCredentialsFromParams({ gistId: '   ' })).toBeNull();

      const parsed = parseCredentialsFromParams({
        gistId: 'my-gist-id',
        githubKey: ['ghp_token', 'ignored'],
        imgbbKey: 'my-imgbb-key',
      });
      expect(parsed).toEqual({
        gistId: 'my-gist-id',
        githubKey: 'ghp_token',
        imgbbApiKey: 'my-imgbb-key',
      });

      // Fallback to raw window.location.search when nested navigator drops params
      const fromRawQuery = parseCredentialsFromParams({}, '?gistId=url_gist&githubKey=url_ghp&imgbbKey=url_imgbb');
      expect(fromRawQuery).toEqual({
        gistId: 'url_gist',
        githubKey: 'url_ghp',
        imgbbApiKey: 'url_imgbb',
      });
    });
  });
});
