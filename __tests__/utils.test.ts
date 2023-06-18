/**
 * Unit tests for utils/utils.ts
 * Tests utility functions with various edge cases
 */

// Import only pure functions that don't depend on AsyncStorage or React Native
// We need to mock the modules before importing

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import { getHebrewDayName, getSettings, isRTL2, getNoScreenText } from '../utils/utils';

describe('utils', () => {
  describe('getHebrewDayName', () => {
    it('should return correct Hebrew name for Sunday (0)', () => {
      expect(getHebrewDayName(0)).toBe('ראשון');
    });

    it('should return correct Hebrew name for Monday (1)', () => {
      expect(getHebrewDayName(1)).toBe('שני');
    });

    it('should return correct Hebrew name for Tuesday (2)', () => {
      expect(getHebrewDayName(2)).toBe('שלישי');
    });

    it('should return correct Hebrew name for Wednesday (3)', () => {
      expect(getHebrewDayName(3)).toBe('רביעי');
    });

    it('should return correct Hebrew name for Thursday (4)', () => {
      expect(getHebrewDayName(4)).toBe('חמישי');
    });

    it('should return correct Hebrew name for Friday (5)', () => {
      expect(getHebrewDayName(5)).toBe('שישי');
    });

    it('should return correct Hebrew name for Saturday/Shabbat (6)', () => {
      expect(getHebrewDayName(6)).toBe('שבת');
    });

    it('should return empty string for invalid day number (7)', () => {
      expect(getHebrewDayName(7)).toBe('');
    });

    it('should return empty string for negative day number', () => {
      expect(getHebrewDayName(-1)).toBe('');
    });

    it('should return empty string for large invalid number', () => {
      expect(getHebrewDayName(100)).toBe('');
    });
  });

  describe('getSettings', () => {
    it('should return default settings object', () => {
      const settings = getSettings();
      expect(settings).toEqual({
        language: 'he',
        latitude: '32.1169878',
        longitude: '35.1175534',
      });
    });

    it('should have Hebrew as default language', () => {
      const settings = getSettings();
      expect(settings.language).toBe('he');
    });

    it('should have valid latitude', () => {
      const settings = getSettings();
      const lat = parseFloat(settings.latitude);
      expect(lat).toBeGreaterThan(31);
      expect(lat).toBeLessThan(33);
    });

    it('should have valid longitude', () => {
      const settings = getSettings();
      const lon = parseFloat(settings.longitude);
      expect(lon).toBeGreaterThan(34);
      expect(lon).toBeLessThan(36);
    });
  });

  describe('isRTL2', () => {
    it('should return true for Hebrew language', () => {
      expect(isRTL2('he')).toBe(true);
    });

    it('should return false for English language', () => {
      expect(isRTL2('en')).toBe(false);
    });
  });

  describe('getNoScreenText', () => {
    it('should return Hebrew text for Hebrew language', () => {
      const text = getNoScreenText('he');
      expect(text).toBe('לא נמצא מסך. אנא בדוק בהגדרות.');
    });

    it('should return English text for English language', () => {
      const text = getNoScreenText('en');
      expect(text).toBe('No screen found. Please check the settings.');
    });

    it('should contain settings reference in Hebrew', () => {
      const text = getNoScreenText('he');
      expect(text).toContain('הגדרות');
    });

    it('should contain settings reference in English', () => {
      const text = getNoScreenText('en');
      expect(text).toContain('settings');
    });
  });

  describe('defaultPageDisplayTime', () => {
    it('should be a positive number', () => {
      const { defaultPageDisplayTime } = require('../utils/utils');
      expect(typeof defaultPageDisplayTime).toBe('number');
      expect(defaultPageDisplayTime).toBeGreaterThan(0);
    });

    it('should be 10 seconds', () => {
      const { defaultPageDisplayTime } = require('../utils/utils');
      expect(defaultPageDisplayTime).toBe(10);
    });
  });

  describe('boundary conditions', () => {
    it('should handle getHebrewDayName for all valid days', () => {
      const expectedDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      for (let i = 0; i < 7; i++) {
        expect(getHebrewDayName(i)).toBe(expectedDays[i]);
      }
    });

    it('should handle getHebrewDayName for boundary invalid values', () => {
      expect(getHebrewDayName(-1000)).toBe('');
      expect(getHebrewDayName(1000)).toBe('');
      expect(getHebrewDayName(NaN)).toBe('');
    });
  });
});
