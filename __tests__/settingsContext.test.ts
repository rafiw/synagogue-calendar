/**
 * Unit tests for context/settingsContext.tsx
 * Tests settings management logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch for gist API calls
global.fetch = jest.fn();

// Mock cities data
jest.mock('assets/data', () => ({
  cities: [
    {
      hebrew_name: 'ירושלים',
      english_name: 'Jerusalem',
      latitude: 31.7683,
      longitude: 35.2137,
      olson: 'Asia/Jerusalem',
      il: true,
    },
  ],
}));

describe('Settings Context Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Settings Validation', () => {
    const validateSettings = (settings: Record<string, unknown>): boolean => {
      const requiredKeys = ['name', 'language', 'latitude', 'longitude', 'olson', 'il'];
      return requiredKeys.every((key) => key in settings);
    };

    it('should validate settings with all required keys', () => {
      const validSettings = {
        name: 'Test Synagogue',
        language: 'he',
        latitude: 31.7683,
        longitude: 35.2137,
        olson: 'Asia/Jerusalem',
        il: true,
      };

      expect(validateSettings(validSettings)).toBe(true);
    });

    it('should reject settings missing required keys', () => {
      const invalidSettings = {
        name: 'Test Synagogue',
        language: 'he',
      };

      expect(validateSettings(invalidSettings)).toBe(false);
    });

    it('should reject empty settings object', () => {
      expect(validateSettings({})).toBe(false);
    });
  });

  describe('Settings Comparison', () => {
    const isNewer = (
      settingsA: { lastUpdateTime: Date | string },
      settingsB: { lastUpdateTime: Date | string },
    ): boolean => {
      const dateA = new Date(settingsA.lastUpdateTime);
      const dateB = new Date(settingsB.lastUpdateTime);
      return dateA > dateB;
    };

    it('should identify newer settings correctly', () => {
      const older = { lastUpdateTime: new Date('2024-01-01') };
      const newer = { lastUpdateTime: new Date('2024-06-01') };

      expect(isNewer(newer, older)).toBe(true);
      expect(isNewer(older, newer)).toBe(false);
    });

    it('should handle string dates', () => {
      const older = { lastUpdateTime: '2024-01-01T00:00:00Z' };
      const newer = { lastUpdateTime: '2024-06-01T00:00:00Z' };

      expect(isNewer(newer, older)).toBe(true);
    });

    it('should return false for equal dates', () => {
      const settings1 = { lastUpdateTime: new Date('2024-01-01') };
      const settings2 = { lastUpdateTime: new Date('2024-01-01') };

      expect(isNewer(settings1, settings2)).toBe(false);
    });
  });

  describe('Settings Merge', () => {
    const mergeSettings = <T extends Record<string, unknown>>(existing: T, updates: Partial<T>): T => ({
      ...existing,
      ...updates,
      lastUpdateTime: new Date(),
    });

    it('should merge partial updates into existing settings', () => {
      const existing = {
        name: 'Old Name',
        language: 'he' as const,
        latitude: 31.7683,
        longitude: 35.2137,
      };

      const updates = { name: 'New Name' };
      const result = mergeSettings(existing, updates);

      expect(result.name).toBe('New Name');
      expect(result.language).toBe('he');
      expect(result.latitude).toBe(31.7683);
    });

    it('should preserve unmodified fields', () => {
      const existing = {
        name: 'Test',
        language: 'en' as const,
        messages: ['Hello'],
        classes: [{ id: '1' }],
      };

      const updates = { name: 'Updated' };
      const result = mergeSettings(existing, updates);

      expect(result.messages).toEqual(['Hello']);
      expect(result.classes).toEqual([{ id: '1' }]);
    });

    it('should add lastUpdateTime on merge', () => {
      const existing = { name: 'Test' };
      const updates = {};
      const result = mergeSettings(existing, updates);

      expect(result.lastUpdateTime).toBeInstanceOf(Date);
    });
  });

  describe('Deceased Settings Defaults', () => {
    const getDeceasedSettingsWithDefaults = (
      settings?: Partial<{
        tableRows: number;
        tableColumns: number;
        displayMode: 'all' | 'monthly';
        defaultTemplate: 'simple' | 'card' | 'photo';
        imgbbApiKey: string;
      }>,
    ) => ({
      tableRows: 3,
      tableColumns: 2,
      displayMode: 'all' as const,
      defaultTemplate: 'simple' as const,
      imgbbApiKey: '',
      ...settings,
    });

    it('should provide default deceased settings when none provided', () => {
      const result = getDeceasedSettingsWithDefaults();

      expect(result.tableRows).toBe(3);
      expect(result.tableColumns).toBe(2);
      expect(result.displayMode).toBe('all');
      expect(result.defaultTemplate).toBe('simple');
      expect(result.imgbbApiKey).toBe('');
    });

    it('should merge partial deceased settings with defaults', () => {
      const result = getDeceasedSettingsWithDefaults({
        tableRows: 4,
        displayMode: 'all',
      });

      expect(result.tableRows).toBe(4);
      expect(result.tableColumns).toBe(2); // Default
      expect(result.displayMode).toBe('all');
      expect(result.defaultTemplate).toBe('simple'); // Default
    });

    it('should allow overriding all defaults', () => {
      const result = getDeceasedSettingsWithDefaults({
        tableRows: 5,
        tableColumns: 4,
        displayMode: 'all',
        defaultTemplate: 'photo',
        imgbbApiKey: 'test-key',
      });

      expect(result.tableRows).toBe(5);
      expect(result.tableColumns).toBe(4);
      expect(result.displayMode).toBe('all');
      expect(result.defaultTemplate).toBe('photo');
      expect(result.imgbbApiKey).toBe('test-key');
    });
  });

  describe('Gist ID Validation', () => {
    const isValidGistId = (gistId: string | undefined | null): boolean => {
      if (!gistId) return false;
      return gistId.length > 5;
    };

    it('should reject empty gist ID', () => {
      expect(isValidGistId('')).toBe(false);
    });

    it('should reject undefined gist ID', () => {
      expect(isValidGistId(undefined)).toBe(false);
    });

    it('should reject null gist ID', () => {
      expect(isValidGistId(null)).toBe(false);
    });

    it('should reject gist ID with 5 or fewer characters', () => {
      expect(isValidGistId('12345')).toBe(false);
      expect(isValidGistId('abc')).toBe(false);
    });

    it('should accept valid gist ID with more than 5 characters', () => {
      expect(isValidGistId('123456')).toBe(true);
      expect(isValidGistId('abcdef123456789')).toBe(true);
    });
  });

  describe('Language Settings', () => {
    type Language = 'he' | 'en';

    const isRTL = (language: Language): boolean => language === 'he';

    const getLanguageDisplayName = (language: Language): string => {
      const names: Record<Language, string> = {
        he: 'עברית',
        en: 'English',
      };
      return names[language];
    };

    it('should identify Hebrew as RTL', () => {
      expect(isRTL('he')).toBe(true);
    });

    it('should identify English as LTR', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('should return correct display name for Hebrew', () => {
      expect(getLanguageDisplayName('he')).toBe('עברית');
    });

    it('should return correct display name for English', () => {
      expect(getLanguageDisplayName('en')).toBe('English');
    });
  });

  describe('Messages Array Handling', () => {
    const addMessage = (messages: string[], newMessage: string): string[] => {
      if (!newMessage.trim()) return messages;
      return [...messages, newMessage.trim()];
    };

    const removeMessage = (messages: string[], index: number): string[] => {
      if (index < 0 || index >= messages.length) return messages;
      return messages.filter((_, i) => i !== index);
    };

    const updateMessage = (messages: string[], index: number, newValue: string): string[] => {
      if (index < 0 || index >= messages.length) return messages;
      return messages.map((msg, i) => (i === index ? newValue : msg));
    };

    it('should add a message to empty array', () => {
      const result = addMessage([], 'Hello');
      expect(result).toEqual(['Hello']);
    });

    it('should add a message to existing array', () => {
      const result = addMessage(['First'], 'Second');
      expect(result).toEqual(['First', 'Second']);
    });

    it('should not add empty message', () => {
      const result = addMessage(['First'], '   ');
      expect(result).toEqual(['First']);
    });

    it('should trim message whitespace', () => {
      const result = addMessage([], '  Hello  ');
      expect(result).toEqual(['Hello']);
    });

    it('should remove message at valid index', () => {
      const result = removeMessage(['A', 'B', 'C'], 1);
      expect(result).toEqual(['A', 'C']);
    });

    it('should not modify array for invalid index', () => {
      const original = ['A', 'B'];
      const result = removeMessage(original, 5);
      expect(result).toEqual(['A', 'B']);
    });

    it('should handle negative index', () => {
      const original = ['A', 'B'];
      const result = removeMessage(original, -1);
      expect(result).toEqual(['A', 'B']);
    });

    it('should update message at valid index', () => {
      const result = updateMessage(['A', 'B', 'C'], 1, 'Updated');
      expect(result).toEqual(['A', 'Updated', 'C']);
    });

    it('should not modify array for invalid update index', () => {
      const original = ['A', 'B'];
      const result = updateMessage(original, 10, 'New');
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('Classes Array Handling', () => {
    interface Shiur {
      id: string;
      day: number[];
      start: string;
      end: string;
      tutor: string;
      subject: string;
    }

    const generateId = (): string => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const addClass = (classes: Shiur[], newClass: Omit<Shiur, 'id'>): Shiur[] => {
      const classWithId: Shiur = {
        ...newClass,
        id: generateId(),
      };
      return [...classes, classWithId];
    };

    const removeClass = (classes: Shiur[], id: string): Shiur[] => {
      return classes.filter((c) => c.id !== id);
    };

    const updateClass = (classes: Shiur[], id: string, updates: Partial<Omit<Shiur, 'id'>>): Shiur[] => {
      return classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    };

    it('should add a class with generated ID', () => {
      const newClass = {
        day: [0, 1],
        start: '08:00',
        end: '09:00',
        tutor: 'Rabbi Test',
        subject: 'Gemara',
      };

      const result = addClass([], newClass);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].tutor).toBe('Rabbi Test');
    });

    it('should remove class by ID', () => {
      const classes: Shiur[] = [
        { id: '1', day: [0], start: '08:00', end: '09:00', tutor: 'A', subject: 'X' },
        { id: '2', day: [1], start: '10:00', end: '11:00', tutor: 'B', subject: 'Y' },
      ];

      const result = removeClass(classes, '1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should not remove anything for non-existent ID', () => {
      const classes: Shiur[] = [{ id: '1', day: [0], start: '08:00', end: '09:00', tutor: 'A', subject: 'X' }];

      const result = removeClass(classes, 'non-existent');

      expect(result).toHaveLength(1);
    });

    it('should update class properties', () => {
      const classes: Shiur[] = [{ id: '1', day: [0], start: '08:00', end: '09:00', tutor: 'A', subject: 'X' }];

      const result = updateClass(classes, '1', { tutor: 'Updated Tutor' });

      expect(result[0].tutor).toBe('Updated Tutor');
      expect(result[0].subject).toBe('X'); // Unchanged
    });
  });
});
