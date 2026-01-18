import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHebrewDayName, getSettings, isRTL, isRTL2, getNoScreenText } from '../utils/utils';
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

      await expect(isRTL()).rejects.toThrow();
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
});
