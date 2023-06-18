/**
 * Unit tests for utils/deceasedHelpers.ts
 * Tests the complex sizing and filtering logic for deceased display
 */

import {
  getScaleFactor,
  calculateSizes,
  calculatePagination,
  getPageItems,
  filterDeceasedByDisplayMode,
  validateDeceasedDates,
  calculateAgeAtDeath,
  DeceasedFilterable,
} from '../utils/deceasedHelpers';

describe('deceasedHelpers', () => {
  describe('getScaleFactor', () => {
    it('should return 2.5 for single cell (1)', () => {
      expect(getScaleFactor(1)).toBe(2.5);
    });

    it('should return 2 for 2 cells', () => {
      expect(getScaleFactor(2)).toBe(2);
    });

    it('should return 1.8 for 3-4 cells', () => {
      expect(getScaleFactor(3)).toBe(1.8);
      expect(getScaleFactor(4)).toBe(1.8);
    });

    it('should return 1.6 for 5-6 cells', () => {
      expect(getScaleFactor(5)).toBe(1.6);
      expect(getScaleFactor(6)).toBe(1.6);
    });

    it('should return 1.5 for 7-8 cells', () => {
      expect(getScaleFactor(7)).toBe(1.5);
      expect(getScaleFactor(8)).toBe(1.5);
    });

    it('should return 1.4 for 9-10 cells', () => {
      expect(getScaleFactor(9)).toBe(1.4);
      expect(getScaleFactor(10)).toBe(1.4);
    });

    it('should return 1.3 for 11-12 cells', () => {
      expect(getScaleFactor(11)).toBe(1.3);
      expect(getScaleFactor(12)).toBe(1.3);
    });

    it('should return 1.2 for 13-14 cells', () => {
      expect(getScaleFactor(13)).toBe(1.2);
      expect(getScaleFactor(14)).toBe(1.2);
    });

    it('should return 1.1 for 15-16 cells', () => {
      expect(getScaleFactor(15)).toBe(1.1);
      expect(getScaleFactor(16)).toBe(1.1);
    });

    it('should return 1.0 for 17-18 cells', () => {
      expect(getScaleFactor(17)).toBe(1.0);
      expect(getScaleFactor(18)).toBe(1.0);
    });

    it('should return 0.9 for 19-20 cells', () => {
      expect(getScaleFactor(19)).toBe(0.9);
      expect(getScaleFactor(20)).toBe(0.9);
    });

    it('should return 0.8 for more than 20 cells', () => {
      expect(getScaleFactor(21)).toBe(0.8);
      expect(getScaleFactor(50)).toBe(0.8);
      expect(getScaleFactor(100)).toBe(0.8);
    });
  });

  describe('calculateSizes', () => {
    it('should calculate correct sizes for 1x1 grid', () => {
      const { fontSize, candleSize } = calculateSizes(1, 1);

      // Scale factor is 2.5 for single cell
      expect(fontSize.name).toBe(18 * 2.5);
      expect(fontSize.nameCard).toBe(16 * 2.5);
      expect(fontSize.namePhoto).toBe(20 * 2.5);
      expect(fontSize.date).toBe(12 * 2.5);
      expect(candleSize.simple).toBe(Math.round(40 * 2.5));
      expect(candleSize.card).toBe(Math.round(35 * 2.5));
    });

    it('should calculate correct sizes for 2x2 grid (4 cells)', () => {
      const { fontSize, candleSize } = calculateSizes(2, 2);

      // Scale factor is 1.8 for 4 cells
      expect(fontSize.name).toBe(18 * 1.8);
      expect(fontSize.date).toBe(12 * 1.8);
      expect(candleSize.simple).toBe(Math.round(40 * 1.8));
    });

    it('should calculate correct sizes for 3x2 grid (6 cells)', () => {
      const { fontSize, candleSize } = calculateSizes(3, 2);

      // Scale factor is 1.6 for 6 cells
      expect(fontSize.name).toBe(18 * 1.6);
      expect(candleSize.simple).toBe(Math.round(40 * 1.6));
    });

    it('should calculate correct sizes for 4x4 grid (16 cells)', () => {
      const { fontSize, candleSize } = calculateSizes(4, 4);

      // Scale factor is 1.1 for 16 cells
      expect(fontSize.name).toBe(18 * 1.1);
      expect(candleSize.simple).toBe(Math.round(40 * 1.1));
    });

    it('should calculate correct sizes for 5x5 grid (25 cells)', () => {
      const { fontSize, candleSize } = calculateSizes(5, 5);

      // Scale factor is 0.8 for 25 cells (>20)
      expect(fontSize.name).toBe(18 * 0.8);
      expect(candleSize.simple).toBe(Math.round(40 * 0.8));
    });

    it('should return all required font size properties', () => {
      const { fontSize } = calculateSizes(2, 2);

      expect(fontSize).toHaveProperty('name');
      expect(fontSize).toHaveProperty('nameCard');
      expect(fontSize).toHaveProperty('namePhoto');
      expect(fontSize).toHaveProperty('date');
      expect(fontSize).toHaveProperty('dateSmall');
      expect(fontSize).toHaveProperty('hebrew');
      expect(fontSize).toHaveProperty('tribute');
      expect(fontSize).toHaveProperty('footer');
      expect(fontSize).toHaveProperty('label');
    });

    it('should return all required candle size properties', () => {
      const { candleSize } = calculateSizes(2, 2);

      expect(candleSize).toHaveProperty('simple');
      expect(candleSize).toHaveProperty('card');
      expect(candleSize).toHaveProperty('photoPlaceholder');
      expect(candleSize).toHaveProperty('photoFooter');
    });

    it('should return positive values for all sizes', () => {
      const { fontSize, candleSize } = calculateSizes(10, 10);

      Object.values(fontSize).forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });

      Object.values(candleSize).forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('calculatePagination', () => {
    it('should return 1 page for items less than or equal to itemsPerPage', () => {
      const result = calculatePagination(5, 6);
      expect(result.totalPages).toBe(1);
      expect(result.hasMultiplePages).toBe(false);
    });

    it('should return correct number of pages when items exceed itemsPerPage', () => {
      const result = calculatePagination(10, 3);
      expect(result.totalPages).toBe(4); // ceil(10/3) = 4
      expect(result.hasMultiplePages).toBe(true);
    });

    it('should handle exact division', () => {
      const result = calculatePagination(12, 4);
      expect(result.totalPages).toBe(3);
      expect(result.hasMultiplePages).toBe(true);
    });

    it('should handle empty items', () => {
      const result = calculatePagination(0, 6);
      expect(result.totalPages).toBe(0);
      expect(result.hasMultiplePages).toBe(false);
    });

    it('should handle single item', () => {
      const result = calculatePagination(1, 6);
      expect(result.totalPages).toBe(1);
      expect(result.hasMultiplePages).toBe(false);
    });
  });

  describe('getPageItems', () => {
    const testItems = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    it('should return first page items correctly', () => {
      const result = getPageItems(testItems, 0, 3);
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should return second page items correctly', () => {
      const result = getPageItems(testItems, 1, 3);
      expect(result).toEqual(['D', 'E', 'F']);
    });

    it('should return last page with remaining items', () => {
      const result = getPageItems(testItems, 3, 3);
      expect(result).toEqual(['J']);
    });

    it('should return empty array for page beyond available items', () => {
      const result = getPageItems(testItems, 5, 3);
      expect(result).toEqual([]);
    });

    it('should return all items if itemsPerPage exceeds total', () => {
      const result = getPageItems(testItems, 0, 20);
      expect(result).toEqual(testItems);
    });

    it('should handle empty array', () => {
      const result = getPageItems([], 0, 3);
      expect(result).toEqual([]);
    });

    it('should work with object arrays', () => {
      const objectItems = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = getPageItems(objectItems, 0, 2);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('filterDeceasedByDisplayMode', () => {
    // Mock HDate class for testing
    const createMockHDateClass = (options: {
      isLeapYear: boolean;
      currentMonth: number;
      getMonthForDate?: (date: Date) => number;
      isLeapYearForDate?: (date: Date) => boolean;
    }) => {
      return class MockHDate {
        private date?: Date;

        constructor(date?: Date) {
          this.date = date;
        }

        isLeapYear(): boolean {
          if (this.date && options.isLeapYearForDate) {
            return options.isLeapYearForDate(this.date);
          }
          return options.isLeapYear;
        }

        getMonth(): number {
          if (this.date && options.getMonthForDate) {
            return options.getMonthForDate(this.date);
          }
          return options.currentMonth;
        }
      };
    };

    const createDeceased = (hebrewDateOfDeath: Date): DeceasedFilterable => ({
      hebrewDateOfDeath,
    });

    it('should return all deceased when displayMode is rotating', () => {
      const deceased = [
        createDeceased(new Date('2024-01-15')),
        createDeceased(new Date('2024-02-15')),
        createDeceased(new Date('2024-03-15')),
      ];

      const MockHDate = createMockHDateClass({ isLeapYear: false, currentMonth: 5 });
      const result = filterDeceasedByDisplayMode(deceased, 'rotating', MockHDate);

      expect(result).toHaveLength(3);
    });

    it('should filter by current month in leap year', () => {
      const deceased = [
        createDeceased(new Date('2024-01-15')),
        createDeceased(new Date('2024-02-15')),
        createDeceased(new Date('2024-03-15')),
      ];

      // Leap year, month 5
      const MockHDate = createMockHDateClass({
        isLeapYear: true,
        currentMonth: 5,
        getMonthForDate: (date: Date) => {
          const month = date.getMonth();
          if (month === 0) return 4; // January -> month 4
          if (month === 1) return 5; // February -> month 5
          if (month === 2) return 6; // March -> month 6
          return month + 4;
        },
      });

      const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDate);

      // Only February (month 5) should match
      expect(result).toHaveLength(1);
    });

    it('should include Adar II deaths in Adar during non-leap year', () => {
      const deceased = [
        createDeceased(new Date('2024-03-01')), // Adar II death
      ];

      // Non-leap year, currently in Adar (month 12)
      const MockHDate = createMockHDateClass({
        isLeapYear: false, // Current year is not a leap year
        currentMonth: 12, // We're in Adar
        getMonthForDate: () => 13, // The death was in Adar II (month 13)
        isLeapYearForDate: () => true, // Death year was a leap year
      });

      const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDate);

      expect(result).toHaveLength(1);
    });

    it('should not include Adar II deaths in non-Adar month', () => {
      const deceased = [
        createDeceased(new Date('2024-03-01')), // Adar II death
      ];

      // Non-leap year, currently in Nisan (month 1)
      const MockHDate = createMockHDateClass({
        isLeapYear: false,
        currentMonth: 1, // We're in Nisan
        getMonthForDate: () => 13, // The death was in Adar II
        isLeapYearForDate: () => true,
      });

      const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDate);

      expect(result).toHaveLength(0);
    });

    it('should handle empty deceased array', () => {
      const MockHDate = createMockHDateClass({ isLeapYear: false, currentMonth: 5 });
      const result = filterDeceasedByDisplayMode([], 'monthly', MockHDate);

      expect(result).toHaveLength(0);
    });

    it('should filter correctly with multiple deceased in same month', () => {
      const deceased = [
        createDeceased(new Date('2024-01-10')),
        createDeceased(new Date('2024-01-20')),
        createDeceased(new Date('2024-02-15')),
      ];

      const MockHDate = createMockHDateClass({
        isLeapYear: true,
        currentMonth: 4,
        getMonthForDate: (date: Date) => (date.getMonth() === 0 ? 4 : 5),
      });

      const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDate);

      // Both January dates should match month 4
      expect(result).toHaveLength(2);
    });
  });

  describe('validateDeceasedDates', () => {
    it('should return true for valid deceased with all dates', () => {
      const person = {
        dateOfBirth: new Date('1950-01-15'),
        dateOfDeath: new Date('2020-03-20'),
        hebrewDateOfBirth: new Date('1950-01-15'),
        hebrewDateOfDeath: new Date('2020-03-20'),
      };

      expect(validateDeceasedDates(person)).toBe(true);
    });

    it('should return false when dateOfBirth is null', () => {
      const person = {
        dateOfBirth: null,
        dateOfDeath: new Date('2020-03-20'),
        hebrewDateOfBirth: new Date('1950-01-15'),
        hebrewDateOfDeath: new Date('2020-03-20'),
      };

      expect(validateDeceasedDates(person)).toBe(false);
    });

    it('should return false when dateOfDeath is null', () => {
      const person = {
        dateOfBirth: new Date('1950-01-15'),
        dateOfDeath: null,
        hebrewDateOfBirth: new Date('1950-01-15'),
        hebrewDateOfDeath: new Date('2020-03-20'),
      };

      expect(validateDeceasedDates(person)).toBe(false);
    });

    it('should return false when hebrewDateOfBirth is undefined', () => {
      const person = {
        dateOfBirth: new Date('1950-01-15'),
        dateOfDeath: new Date('2020-03-20'),
        hebrewDateOfBirth: undefined,
        hebrewDateOfDeath: new Date('2020-03-20'),
      };

      expect(validateDeceasedDates(person)).toBe(false);
    });

    it('should return false when hebrewDateOfDeath is undefined', () => {
      const person = {
        dateOfBirth: new Date('1950-01-15'),
        dateOfDeath: new Date('2020-03-20'),
        hebrewDateOfBirth: new Date('1950-01-15'),
        hebrewDateOfDeath: undefined,
      };

      expect(validateDeceasedDates(person)).toBe(false);
    });

    it('should return false when all dates are missing', () => {
      const person = {};

      expect(validateDeceasedDates(person)).toBe(false);
    });
  });

  describe('calculateAgeAtDeath', () => {
    it('should calculate correct age for simple case', () => {
      const birth = new Date('1950-05-15');
      const death = new Date('2020-05-15');

      expect(calculateAgeAtDeath(birth, death)).toBe(70);
    });

    it('should calculate correct age when birthday not yet reached', () => {
      const birth = new Date('1950-06-15');
      const death = new Date('2020-05-15');

      expect(calculateAgeAtDeath(birth, death)).toBe(69);
    });

    it('should calculate correct age when same birth day/month', () => {
      const birth = new Date('1950-05-15');
      const death = new Date('2020-05-15');

      expect(calculateAgeAtDeath(birth, death)).toBe(70);
    });

    it('should calculate age of 0 for infant death', () => {
      const birth = new Date('2020-01-15');
      const death = new Date('2020-06-15');

      expect(calculateAgeAtDeath(birth, death)).toBe(0);
    });

    it('should handle death on birthday correctly', () => {
      const birth = new Date('1960-03-20');
      const death = new Date('2020-03-20');

      expect(calculateAgeAtDeath(birth, death)).toBe(60);
    });

    it('should handle death day before birthday in same month', () => {
      const birth = new Date('1960-03-20');
      const death = new Date('2020-03-19');

      expect(calculateAgeAtDeath(birth, death)).toBe(59);
    });

    it('should handle leap year birthdays', () => {
      const birth = new Date('1960-02-29');
      const death = new Date('2020-02-28');

      expect(calculateAgeAtDeath(birth, death)).toBe(59);
    });

    it('should calculate correct age for centenarian', () => {
      const birth = new Date('1900-01-01');
      const death = new Date('2005-06-15');

      expect(calculateAgeAtDeath(birth, death)).toBe(105);
    });
  });
});
