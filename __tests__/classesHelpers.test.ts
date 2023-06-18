/**
 * Unit tests for utils/classesHelpers.ts
 * Tests helper functions for the Classes component
 */

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
} from '../utils/classesHelpers';
import { Shiur } from '../utils/defs';

describe('classesHelpers', () => {
  // Mock translator function
  const mockTranslator = (key: string): string => {
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

  const hebrewTranslator = (key: string): string => {
    const translations: Record<string, string> = {
      sunday: 'ראשון',
      monday: 'שני',
      tuesday: 'שלישי',
      wednesday: 'רביעי',
      thursday: 'חמישי',
      friday: 'שישי',
      saturday: 'שבת',
    };
    return translations[key] || key;
  };

  // Sample classes for testing
  const sampleClasses: Shiur[] = [
    {
      id: '1',
      day: [0, 2, 4], // Sunday, Tuesday, Thursday
      start: '08:00',
      end: '09:00',
      tutor: 'Rabbi Cohen',
      subject: 'Gemara',
    },
    {
      id: '2',
      day: [1, 3], // Monday, Wednesday
      start: '10:00',
      end: '11:00',
      tutor: 'Rabbi Levi',
      subject: 'Halacha',
    },
    {
      id: '3',
      day: [5], // Friday
      start: '07:00',
      end: '08:00',
      tutor: 'Rabbi David',
      subject: 'Parsha',
    },
    {
      id: '4',
      day: [6], // Saturday
      start: '16:00',
      end: '17:00',
      tutor: 'Rabbi Moshe',
      subject: 'Mishna',
    },
  ];

  describe('daysOfWeek', () => {
    it('should have 7 days', () => {
      expect(daysOfWeek).toHaveLength(7);
    });

    it('should have Sunday as day 0', () => {
      const sunday = daysOfWeek.find((d) => d.number === 0);
      expect(sunday?.key).toBe('sunday');
    });

    it('should have Saturday as day 6', () => {
      const saturday = daysOfWeek.find((d) => d.number === 6);
      expect(saturday?.key).toBe('saturday');
    });

    it('should have consecutive day numbers 0-6', () => {
      const numbers = daysOfWeek.map((d) => d.number).sort((a, b) => a - b);
      expect(numbers).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('getDayNames', () => {
    it('should return single day name for one day', () => {
      const result = getDayNames([0], mockTranslator);
      expect(result).toBe('Sunday');
    });

    it('should return comma-separated names for multiple days', () => {
      const result = getDayNames([0, 2, 4], mockTranslator);
      expect(result).toBe('Sunday, Tuesday, Thursday');
    });

    it('should work with Hebrew translator', () => {
      const result = getDayNames([0, 6], hebrewTranslator);
      expect(result).toBe('ראשון, שבת');
    });

    it('should return empty string for empty array', () => {
      const result = getDayNames([], mockTranslator);
      expect(result).toBe('');
    });

    it('should filter out invalid day numbers', () => {
      const result = getDayNames([0, 10, 2], mockTranslator);
      expect(result).toBe('Sunday, Tuesday');
    });

    it('should handle all days of the week', () => {
      const result = getDayNames([0, 1, 2, 3, 4, 5, 6], mockTranslator);
      expect(result).toBe('Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday');
    });
  });

  describe('calculateSubPages', () => {
    it('should return 0 for empty classes', () => {
      expect(calculateSubPages(0, 3)).toBe(0);
    });

    it('should return 1 for classes less than or equal to per page', () => {
      expect(calculateSubPages(3, 3)).toBe(1);
      expect(calculateSubPages(2, 3)).toBe(1);
    });

    it('should calculate correct pages for exact division', () => {
      expect(calculateSubPages(6, 3)).toBe(2);
      expect(calculateSubPages(9, 3)).toBe(3);
    });

    it('should round up for partial pages', () => {
      expect(calculateSubPages(4, 3)).toBe(2);
      expect(calculateSubPages(7, 3)).toBe(3);
    });

    it('should handle single class per page', () => {
      expect(calculateSubPages(5, 1)).toBe(5);
    });
  });

  describe('getCurrentPageClasses', () => {
    it('should return first page classes correctly', () => {
      const result = getCurrentPageClasses(sampleClasses, 0, 2);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return second page classes correctly', () => {
      const result = getCurrentPageClasses(sampleClasses, 1, 2);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('4');
    });

    it('should return remaining classes on last page', () => {
      const result = getCurrentPageClasses(sampleClasses, 1, 3);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('should return empty array for page beyond range', () => {
      const result = getCurrentPageClasses(sampleClasses, 5, 3);
      expect(result).toHaveLength(0);
    });

    it('should return all classes if classesPerPage exceeds total', () => {
      const result = getCurrentPageClasses(sampleClasses, 0, 10);
      expect(result).toHaveLength(4);
    });
  });

  describe('formatTimeRange', () => {
    it('should format time range correctly', () => {
      expect(formatTimeRange('08:00', '09:00')).toBe('08:00-09:00');
    });

    it('should handle different time formats', () => {
      expect(formatTimeRange('8:00', '9:30')).toBe('8:00-9:30');
    });

    it('should handle PM times', () => {
      expect(formatTimeRange('14:00', '15:30')).toBe('14:00-15:30');
    });
  });

  describe('validateDayNumbers', () => {
    it('should return true for valid day numbers', () => {
      expect(validateDayNumbers([0, 1, 2, 3, 4, 5, 6])).toBe(true);
    });

    it('should return true for single valid day', () => {
      expect(validateDayNumbers([3])).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(validateDayNumbers([])).toBe(true);
    });

    it('should return false for negative day numbers', () => {
      expect(validateDayNumbers([-1, 0, 1])).toBe(false);
    });

    it('should return false for day numbers > 6', () => {
      expect(validateDayNumbers([0, 7])).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(validateDayNumbers([0, 10, 2])).toBe(false);
    });
  });

  describe('sortClassesByTime', () => {
    it('should sort classes by start time', () => {
      const unsorted: Shiur[] = [
        { id: '1', day: [0], start: '10:00', end: '11:00', tutor: 'A', subject: 'X' },
        { id: '2', day: [0], start: '08:00', end: '09:00', tutor: 'B', subject: 'Y' },
        { id: '3', day: [0], start: '14:00', end: '15:00', tutor: 'C', subject: 'Z' },
      ];

      const sorted = sortClassesByTime(unsorted);

      expect(sorted[0].start).toBe('08:00');
      expect(sorted[1].start).toBe('10:00');
      expect(sorted[2].start).toBe('14:00');
    });

    it('should not modify original array', () => {
      const original: Shiur[] = [
        { id: '1', day: [0], start: '10:00', end: '11:00', tutor: 'A', subject: 'X' },
        { id: '2', day: [0], start: '08:00', end: '09:00', tutor: 'B', subject: 'Y' },
      ];

      sortClassesByTime(original);

      expect(original[0].start).toBe('10:00');
    });

    it('should handle empty array', () => {
      const result = sortClassesByTime([]);
      expect(result).toEqual([]);
    });

    it('should handle single class', () => {
      const single: Shiur[] = [{ id: '1', day: [0], start: '10:00', end: '11:00', tutor: 'A', subject: 'X' }];

      const result = sortClassesByTime(single);
      expect(result).toHaveLength(1);
      expect(result[0].start).toBe('10:00');
    });
  });

  describe('filterClassesByDay', () => {
    it('should return classes for Sunday (0)', () => {
      const result = filterClassesByDay(sampleClasses, 0);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return classes for Saturday (6)', () => {
      const result = filterClassesByDay(sampleClasses, 6);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('should return multiple classes for days with multiple classes', () => {
      // Add another class for Sunday
      const classesWithDuplicateDay = [
        ...sampleClasses,
        { id: '5', day: [0], start: '12:00', end: '13:00', tutor: 'Rabbi Test', subject: 'Test' },
      ];

      const result = filterClassesByDay(classesWithDuplicateDay, 0);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for day with no classes', () => {
      // Create classes that don't include day 3
      const classes: Shiur[] = [{ id: '1', day: [0, 1], start: '08:00', end: '09:00', tutor: 'A', subject: 'X' }];

      const result = filterClassesByDay(classes, 3);
      expect(result).toHaveLength(0);
    });

    it('should handle empty classes array', () => {
      const result = filterClassesByDay([], 0);
      expect(result).toHaveLength(0);
    });
  });

  describe('isClassToday', () => {
    const testClass: Shiur = {
      id: '1',
      day: [0, 2, 4], // Sunday, Tuesday, Thursday
      start: '08:00',
      end: '09:00',
      tutor: 'Rabbi Cohen',
      subject: 'Gemara',
    };

    it('should return true if class is on given day', () => {
      expect(isClassToday(testClass, 0)).toBe(true);
      expect(isClassToday(testClass, 2)).toBe(true);
      expect(isClassToday(testClass, 4)).toBe(true);
    });

    it('should return false if class is not on given day', () => {
      expect(isClassToday(testClass, 1)).toBe(false);
      expect(isClassToday(testClass, 3)).toBe(false);
      expect(isClassToday(testClass, 5)).toBe(false);
      expect(isClassToday(testClass, 6)).toBe(false);
    });

    it('should work for class with single day', () => {
      const singleDayClass: Shiur = {
        id: '2',
        day: [6], // Saturday only
        start: '16:00',
        end: '17:00',
        tutor: 'Rabbi Moshe',
        subject: 'Mishna',
      };

      expect(isClassToday(singleDayClass, 6)).toBe(true);
      expect(isClassToday(singleDayClass, 0)).toBe(false);
    });

    it('should work for class on all days', () => {
      const dailyClass: Shiur = {
        id: '3',
        day: [0, 1, 2, 3, 4, 5, 6],
        start: '06:00',
        end: '07:00',
        tutor: 'Rabbi Daily',
        subject: 'Daf Yomi',
      };

      for (let i = 0; i <= 6; i++) {
        expect(isClassToday(dailyClass, i)).toBe(true);
      }
    });
  });
});
