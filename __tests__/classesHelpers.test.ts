import { describe, it, expect } from 'vitest';
import {
  daysOfWeek,
  getDayNames,
  calculateSubPages,
  formatTimeRange,
  validateDayNumbers,
  sortClassesByTime,
  filterClassesByDay,
  isClassToday,
  getDayMonthYearFromString,
  isMessageActive,
  isMessageExpired,
  isMessageScheduled,
  filterActiveMessages,
} from '../utils/classesHelpers';
import { Class, Message } from '../utils/defs';

describe('classesHelpers', () => {
  describe('daysOfWeek', () => {
    it('should have 7 days of the week', () => {
      expect(daysOfWeek).toHaveLength(7);
    });

    it('should have correct day numbers', () => {
      expect(daysOfWeek[0]?.number).toBe(0);
      expect(daysOfWeek[6]?.number).toBe(6);
    });

    it('should have correct day keys', () => {
      expect(daysOfWeek[0]?.key).toBe('sunday');
      expect(daysOfWeek[6]?.key).toBe('saturday');
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
      const classes: Class[] = [
        { id: '2', start: '08:00', end: '09:00', day: [0], subject: '', tutor: '' },
        { id: '3', start: '11:00', end: '12:00', day: [0], subject: '', tutor: '' },
        { id: '1', start: '14:00', end: '15:00', day: [0], subject: '', tutor: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(sorted[0]?.id).toBe('2');
      expect(sorted[1]?.id).toBe('3');
      expect(sorted[2]?.id).toBe('1');
    });

    it('should not mutate original array', () => {
      const classes: Class[] = [
        { id: '1', start: '14:00', end: '15:00', day: [0], subject: '', tutor: '' },
        { id: '2', start: '08:00', end: '09:00', day: [0], subject: '', tutor: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(classes[0]?.id).toBe('1'); // Original unchanged
      expect(sorted[0]?.id).toBe('2'); // Sorted version
    });

    it('should handle times with single digit hours', () => {
      const classes: Class[] = [
        { id: '1', start: '9:00', end: '10:00', day: [0], subject: '', tutor: '' },
        { id: '2', start: '10:00', end: '11:00', day: [0], subject: '', tutor: '' },
      ];

      const sorted = sortClassesByTime(classes);
      expect(sorted[0]?.id).toBe('1');
      expect(sorted[1]?.id).toBe('2');
    });
  });

  describe('filterClassesByDay', () => {
    const classes: Class[] = [
      { id: '1', start: '08:00', end: '09:00', day: [0], subject: '', tutor: '' },
      { id: '2', start: '09:00', end: '10:00', day: [1], subject: '', tutor: '' },
      { id: '3', start: '10:00', end: '11:00', day: [0, 1, 2], subject: '', tutor: '' },
      { id: '4', start: '11:00', end: '12:00', day: [2], subject: '', tutor: '' },
    ];

    it('should filter classes by day', () => {
      const sunday = filterClassesByDay(classes, 0);
      expect(sunday).toHaveLength(2);
      expect(sunday[0]?.id).toBe('1');
      expect(sunday[1]?.id).toBe('3');
    });

    it('should return empty array for day with no classes', () => {
      const friday = filterClassesByDay(classes, 5);
      expect(friday).toHaveLength(0);
    });

    it('should handle classes with multiple days', () => {
      const tuesday = filterClassesByDay(classes, 2);
      expect(tuesday).toHaveLength(2);
      expect(tuesday.map((c) => c.id)).toContain('3');
      expect(tuesday.map((c) => c.id)).toContain('4');
    });
  });

  describe('isClassToday', () => {
    it('should return true if class is today', () => {
      const shiur: Class = {
        id: '1',
        start: '08:00',
        end: '09:00',
        day: [0, 1, 2],
        subject: '',
        tutor: '',
      };

      expect(isClassToday(shiur, 0)).toBe(true);
      expect(isClassToday(shiur, 1)).toBe(true);
      expect(isClassToday(shiur, 2)).toBe(true);
    });

    it('should return false if class is not today', () => {
      const shiur: Class = {
        id: '1',
        start: '08:00',
        end: '09:00',
        day: [0, 1, 2],
        subject: '',
        tutor: '',
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

  // ==================== Message Helper Tests ====================

  describe('isMessageActive', () => {
    it('should return false if message is disabled', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: false,
      };
      expect(isMessageActive(message)).toBe(false);
    });

    it('should return true if enabled with no dates', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
      };
      expect(isMessageActive(message)).toBe(true);
    });

    it('should return true if within date range', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(true);
    });

    it('should return false if before start date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-06-01',
      };
      const referenceDate = new Date('2024-05-15');
      expect(isMessageActive(message, referenceDate)).toBe(false);
    });

    it('should return false if after end date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        endDate: '2024-06-01',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(false);
    });

    it('should return true if only start date set and past it', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-01-01',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(true);
    });

    it('should return true if only end date set and before it', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        endDate: '2024-12-31',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(true);
    });

    it('should return true on exact start date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-06-15',
        endDate: '2024-06-20',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(true);
    });

    it('should return true on exact end date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-06-10',
        endDate: '2024-06-15',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageActive(message, referenceDate)).toBe(true);
    });
  });

  describe('isMessageExpired', () => {
    it('should return false if no end date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
      };
      expect(isMessageExpired(message)).toBe(false);
    });

    it('should return false if end date is in the future', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        endDate: '2024-12-31',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageExpired(message, referenceDate)).toBe(false);
    });

    it('should return true if end date is in the past', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        endDate: '2024-01-01',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageExpired(message, referenceDate)).toBe(true);
    });

    it('should return false on exact end date (end of day)', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        endDate: '2024-06-15',
      };
      const referenceDate = new Date('2024-06-15T12:00:00');
      expect(isMessageExpired(message, referenceDate)).toBe(false);
    });
  });

  describe('isMessageScheduled', () => {
    it('should return false if no start date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
      };
      expect(isMessageScheduled(message)).toBe(false);
    });

    it('should return true if start date is in the future', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-12-31',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageScheduled(message, referenceDate)).toBe(true);
    });

    it('should return false if start date is in the past', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-01-01',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageScheduled(message, referenceDate)).toBe(false);
    });

    it('should return false on exact start date', () => {
      const message: Message = {
        id: '1',
        text: 'Test',
        enabled: true,
        startDate: '2024-06-15',
      };
      const referenceDate = new Date('2024-06-15');
      expect(isMessageScheduled(message, referenceDate)).toBe(false);
    });
  });

  describe('filterActiveMessages', () => {
    it('should filter to only active messages', () => {
      const referenceDate = new Date('2024-06-15');
      const messages: Message[] = [
        { id: '1', text: 'Active no dates', enabled: true },
        { id: '2', text: 'Disabled', enabled: false },
        { id: '3', text: 'Active in range', enabled: true, startDate: '2024-01-01', endDate: '2024-12-31' },
        { id: '4', text: 'Expired', enabled: true, endDate: '2024-01-01' },
        { id: '5', text: 'Future', enabled: true, startDate: '2024-12-01' },
      ];

      const active = filterActiveMessages(messages, referenceDate);
      expect(active).toHaveLength(2);
      expect(active.map((m) => m.id)).toContain('1');
      expect(active.map((m) => m.id)).toContain('3');
    });

    it('should return empty array if no active messages', () => {
      const referenceDate = new Date('2024-06-15');
      const messages: Message[] = [
        { id: '1', text: 'Disabled', enabled: false },
        { id: '2', text: 'Expired', enabled: true, endDate: '2024-01-01' },
      ];

      const active = filterActiveMessages(messages, referenceDate);
      expect(active).toHaveLength(0);
    });

    it('should return all messages if all are active', () => {
      const messages: Message[] = [
        { id: '1', text: 'Active 1', enabled: true },
        { id: '2', text: 'Active 2', enabled: true },
      ];

      const active = filterActiveMessages(messages);
      expect(active).toHaveLength(2);
    });
  });
});
