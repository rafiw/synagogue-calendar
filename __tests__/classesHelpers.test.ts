import { describe, it, expect } from 'vitest';
import {
  daysOfWeek,
  getDayNames,
  calculateSubPages,
  getCurrentPageClasses,
  formatTimeRange,
  validateDayNumbers,
  sortClassesByTime,
  filterClassesByDay,
  isClassToday,
  getDayMonthYearFromString,
} from '../utils/classesHelpers';
import { Shiur } from '../utils/defs';

describe('classesHelpers', () => {
  describe('daysOfWeek', () => {
    it('should have 7 days of the week', () => {
      expect(daysOfWeek).toHaveLength(7);
    });

    it('should have correct day numbers', () => {
      expect(daysOfWeek[0].number).toBe(0);
      expect(daysOfWeek[6].number).toBe(6);
    });

    it('should have correct day keys', () => {
      expect(daysOfWeek[0].key).toBe('sunday');
      expect(daysOfWeek[6].key).toBe('saturday');
    });
  });

  describe('getDayNames', () => {
    const mockTranslator = (key: string) => {
      const translations: Record<string, string> = {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
      };
      return translations[key] || key;
    };

    it('should skip invalid day numbers', () => {
      const result = getDayNames([0, 99, 1], mockTranslator);
      expect(result).toBe('Sunday, Monday');
    });

    it('should handle single day', () => {
      const result = getDayNames([3], mockTranslator);
      expect(result).toBe('Wednesday');
    });

    it('should handle all days', () => {
      const result = getDayNames([0, 1, 2, 3, 4, 5, 6], mockTranslator);
      expect(result).toBe('Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday');
    });
  });

  describe('calculateSubPages', () => {
    it('should return 0 for 0 classes', () => {
      expect(calculateSubPages(0, 5)).toBe(0);
    });

    it('should return correct number of pages', () => {
      expect(calculateSubPages(10, 3)).toBe(4); // 10 / 3 = 3.33 -> 4 pages
      expect(calculateSubPages(9, 3)).toBe(3); // 9 / 3 = 3 pages
      expect(calculateSubPages(1, 5)).toBe(1); // 1 / 5 = 1 page
    });

    it('should handle edge cases', () => {
      expect(calculateSubPages(5, 5)).toBe(1); // Exactly one page
      expect(calculateSubPages(6, 5)).toBe(2); // Just over one page
    });
  });

  describe('getCurrentPageClasses', () => {
    const mockClasses: Shiur[] = [
      { name: 'Class 1', start: '08:00', end: '09:00', day: [0], description: '' },
      { name: 'Class 2', start: '09:00', end: '10:00', day: [1], description: '' },
      { name: 'Class 3', start: '10:00', end: '11:00', day: [2], description: '' },
      { name: 'Class 4', start: '11:00', end: '12:00', day: [3], description: '' },
      { name: 'Class 5', start: '12:00', end: '13:00', day: [4], description: '' },
    ];

    it('should return correct classes for first page', () => {
      const result = getCurrentPageClasses(mockClasses, 0, 2);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Class 1');
      expect(result[1].name).toBe('Class 2');
    });

    it('should return correct classes for second page', () => {
      const result = getCurrentPageClasses(mockClasses, 1, 2);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Class 3');
      expect(result[1].name).toBe('Class 4');
    });

    it('should return remaining classes on last page', () => {
      const result = getCurrentPageClasses(mockClasses, 2, 2);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Class 5');
    });

    it('should return empty array for page beyond available', () => {
      const result = getCurrentPageClasses(mockClasses, 10, 2);
      expect(result).toHaveLength(0);
    });
  });

  describe('formatTimeRange', () => {
    it('should format time range correctly', () => {
      expect(formatTimeRange('08:00', '09:00')).toBe('08:00-09:00');
      expect(formatTimeRange('14:30', '15:45')).toBe('14:30-15:45');
    });

    it('should handle same start and end time', () => {
      expect(formatTimeRange('10:00', '10:00')).toBe('10:00-10:00');
    });
  });

  describe('validateDayNumbers', () => {
    it('should return true for valid day numbers', () => {
      expect(validateDayNumbers([0, 1, 2, 3, 4, 5, 6])).toBe(true);
      expect(validateDayNumbers([0])).toBe(true);
      expect(validateDayNumbers([6])).toBe(true);
    });

    it('should return false for invalid day numbers', () => {
      expect(validateDayNumbers([-1])).toBe(false);
      expect(validateDayNumbers([7])).toBe(false);
      expect(validateDayNumbers([0, 1, 2, 7])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(validateDayNumbers([])).toBe(true);
    });
  });

  describe('sortClassesByTime', () => {
    it('should sort classes by start time', () => {
      const classes: Shiur[] = [
        { name: 'Late', start: '14:00', end: '15:00', day: [0], description: '' },
        { name: 'Early', start: '08:00', end: '09:00', day: [0], description: '' },
        { name: 'Mid', start: '11:00', end: '12:00', day: [0], description: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(sorted[0].name).toBe('Early');
      expect(sorted[1].name).toBe('Mid');
      expect(sorted[2].name).toBe('Late');
    });

    it('should not mutate original array', () => {
      const classes: Shiur[] = [
        { name: 'Late', start: '14:00', end: '15:00', day: [0], description: '' },
        { name: 'Early', start: '08:00', end: '09:00', day: [0], description: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(classes[0].name).toBe('Late'); // Original unchanged
      expect(sorted[0].name).toBe('Early'); // Sorted version
    });

    it('should handle times with single digit hours', () => {
      const classes: Shiur[] = [
        { name: 'Nine', start: '9:00', end: '10:00', day: [0], description: '' },
        { name: 'Ten', start: '10:00', end: '11:00', day: [0], description: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(sorted[0].name).toBe('Nine');
      expect(sorted[1].name).toBe('Ten');
    });
  });

  describe('filterClassesByDay', () => {
    const classes: Shiur[] = [
      { name: 'Sunday Class', start: '08:00', end: '09:00', day: [0], description: '' },
      { name: 'Monday Class', start: '09:00', end: '10:00', day: [1], description: '' },
      { name: 'Multiple Days', start: '10:00', end: '11:00', day: [0, 1, 2], description: '' },
      { name: 'Tuesday Class', start: '11:00', end: '12:00', day: [2], description: '' },
    ];

    it('should filter classes by day', () => {
      const sunday = filterClassesByDay(classes, 0);
      expect(sunday).toHaveLength(2);
      expect(sunday[0].name).toBe('Sunday Class');
      expect(sunday[1].name).toBe('Multiple Days');
    });

    it('should return empty array for day with no classes', () => {
      const friday = filterClassesByDay(classes, 5);
      expect(friday).toHaveLength(0);
    });

    it('should handle classes with multiple days', () => {
      const tuesday = filterClassesByDay(classes, 2);
      expect(tuesday).toHaveLength(2);
      expect(tuesday.map((c) => c.name)).toContain('Multiple Days');
      expect(tuesday.map((c) => c.name)).toContain('Tuesday Class');
    });
  });

  describe('isClassToday', () => {
    it('should return true if class is today', () => {
      const shiur: Shiur = {
        name: 'Test',
        start: '08:00',
        end: '09:00',
        day: [0, 1, 2],
        description: '',
      };

      expect(isClassToday(shiur, 0)).toBe(true);
      expect(isClassToday(shiur, 1)).toBe(true);
      expect(isClassToday(shiur, 2)).toBe(true);
    });

    it('should return false if class is not today', () => {
      const shiur: Shiur = {
        name: 'Test',
        start: '08:00',
        end: '09:00',
        day: [0, 1, 2],
        description: '',
      };

      expect(isClassToday(shiur, 3)).toBe(false);
      expect(isClassToday(shiur, 6)).toBe(false);
    });
  });

  describe('getDayMonthYearFromString', () => {
    it('should parse valid date string', () => {
      const result = getDayMonthYearFromString('2024-03-15');
      expect(result.day).toBe(15);
      expect(result.month).toBe(3);
      expect(result.year).toBe(2024);
    });

    it('should handle single digit values', () => {
      const result = getDayMonthYearFromString('2024-01-05');
      expect(result.day).toBe(5);
      expect(result.month).toBe(1);
      expect(result.year).toBe(2024);
    });

    it('should return zeros for invalid date string', () => {
      const result = getDayMonthYearFromString('invalid-date');
      expect(result.day).toBe(0);
      expect(result.month).toBe(0);
      expect(result.year).toBe(0);
    });

    it('should return zeros for empty string', () => {
      const result = getDayMonthYearFromString('');
      expect(result.day).toBe(0);
      expect(result.month).toBe(0);
      expect(result.year).toBe(0);
    });

    it('should handle leap year dates', () => {
      const result = getDayMonthYearFromString('2024-02-29');
      expect(result.day).toBe(29);
      expect(result.month).toBe(2);
      expect(result.year).toBe(2024);
    });
  });
});
