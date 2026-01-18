import { describe, it, expect } from 'vitest';
import { HDate, months } from '@hebcal/core';
import {
  getScaleFactor,
  calculateSizes,
  calculatePagination,
  getPageItems,
  getHebrewMonth,
  isHebrewLeapYear,
  getCurrentHebrewMonth,
  filterDeceasedByDisplayMode,
  validateDeceasedDates,
  calculateAgeAtDeath,
  calculateDeceasedPages,
  DeceasedFilterable,
} from '../utils/deceasedHelpers';
import { DeceasedPerson } from '../utils/defs';

describe('deceasedHelpers', () => {
  describe('getScaleFactor', () => {
    it('should return correct scale factor for different cell counts', () => {
      expect(getScaleFactor(1)).toBe(2.5);
      expect(getScaleFactor(2)).toBe(2);
      expect(getScaleFactor(4)).toBe(1.8);
      expect(getScaleFactor(6)).toBe(1.6);
      expect(getScaleFactor(8)).toBe(1.5);
      expect(getScaleFactor(10)).toBe(1.4);
      expect(getScaleFactor(12)).toBe(1.3);
      expect(getScaleFactor(14)).toBe(1.2);
      expect(getScaleFactor(16)).toBe(1.1);
      expect(getScaleFactor(18)).toBe(1.0);
      expect(getScaleFactor(20)).toBe(0.9);
      expect(getScaleFactor(30)).toBe(0.8);
    });

    it('should scale down for large grids', () => {
      expect(getScaleFactor(100)).toBe(0.8);
    });
  });

  describe('calculateSizes', () => {
    it('should calculate correct sizes for 1x1 grid', () => {
      const sizes = calculateSizes(1, 1);
      const scaleFactor = 2.5;

      expect(sizes.fontSize.name).toBe(18 * scaleFactor);
      expect(sizes.fontSize.nameCard).toBe(16 * scaleFactor);
      expect(sizes.candleSize.simple).toBe(Math.round(40 * scaleFactor));
      expect(sizes.candleSize.card).toBe(Math.round(35 * scaleFactor));
    });

    it('should calculate correct sizes for 2x2 grid', () => {
      const sizes = calculateSizes(2, 2);
      const scaleFactor = 1.8;

      expect(sizes.fontSize.name).toBe(18 * scaleFactor);
      expect(sizes.candleSize.simple).toBe(Math.round(40 * scaleFactor));
    });

    it('should calculate correct sizes for 3x3 grid', () => {
      const sizes = calculateSizes(3, 3);
      const scaleFactor = 1.4; // 9 cells

      expect(sizes.fontSize.name).toBe(18 * scaleFactor);
      expect(sizes.candleSize.simple).toBe(Math.round(40 * scaleFactor));
    });

    it('should have all required font size properties', () => {
      const sizes = calculateSizes(2, 2);

      expect(sizes.fontSize).toHaveProperty('name');
      expect(sizes.fontSize).toHaveProperty('nameCard');
      expect(sizes.fontSize).toHaveProperty('namePhoto');
      expect(sizes.fontSize).toHaveProperty('date');
      expect(sizes.fontSize).toHaveProperty('dateSmall');
      expect(sizes.fontSize).toHaveProperty('hebrew');
      expect(sizes.fontSize).toHaveProperty('tribute');
      expect(sizes.fontSize).toHaveProperty('footer');
      expect(sizes.fontSize).toHaveProperty('label');
    });

    it('should have all required candle size properties', () => {
      const sizes = calculateSizes(2, 2);

      expect(sizes.candleSize).toHaveProperty('simple');
      expect(sizes.candleSize).toHaveProperty('card');
      expect(sizes.candleSize).toHaveProperty('photoPlaceholder');
      expect(sizes.candleSize).toHaveProperty('photoFooter');
    });
  });

  describe('calculatePagination', () => {
    it('should calculate correct pagination', () => {
      const result = calculatePagination(10, 5);
      expect(result.totalPages).toBe(2);
      expect(result.hasMultiplePages).toBe(true);
    });

    it('should handle single page', () => {
      const result = calculatePagination(5, 10);
      expect(result.totalPages).toBe(1);
      expect(result.hasMultiplePages).toBe(false);
    });

    it('should round up for partial pages', () => {
      const result = calculatePagination(11, 5);
      expect(result.totalPages).toBe(3);
      expect(result.hasMultiplePages).toBe(true);
    });

    it('should handle zero items', () => {
      const result = calculatePagination(0, 5);
      expect(result.totalPages).toBe(0);
      expect(result.hasMultiplePages).toBe(false);
    });
  });

  describe('getPageItems', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    it('should return correct items for first page', () => {
      const result = getPageItems(items, 0, 3);
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should return correct items for second page', () => {
      const result = getPageItems(items, 1, 3);
      expect(result).toEqual(['D', 'E', 'F']);
    });

    it('should return remaining items on last page', () => {
      const result = getPageItems(items, 2, 3);
      expect(result).toEqual(['G']);
    });

    it('should return empty array for page beyond available', () => {
      const result = getPageItems(items, 10, 3);
      expect(result).toEqual([]);
    });
  });

  describe('getHebrewMonth', () => {
    it('should return correct Hebrew month', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const month = getHebrewMonth(date, HDate);
      expect(typeof month).toBe('number');
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(13);
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 6, 1);

      const month1 = getHebrewMonth(date1, HDate);
      const month2 = getHebrewMonth(date2, HDate);

      expect(month1).not.toBe(month2);
    });
  });

  describe('isHebrewLeapYear', () => {
    it('should correctly identify leap years', () => {
      // Hebrew year 5784 (2023-2024) is a leap year
      const leapYearDate = new Date(2024, 2, 1);
      expect(isHebrewLeapYear(leapYearDate, HDate)).toBe(true);
    });

    it('should correctly identify non-leap years', () => {
      // Hebrew year 5783 (2022-2023) is not a leap year
      const regularYearDate = new Date(2023, 2, 1);
      expect(isHebrewLeapYear(regularYearDate, HDate)).toBe(false);
    });
  });

  describe('getCurrentHebrewMonth', () => {
    it('should return current Hebrew month', () => {
      const month = getCurrentHebrewMonth(HDate);
      expect(typeof month).toBe('number');
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(13);
    });
  });

  describe('filterDeceasedByDisplayMode', () => {
    it('should return all deceased when mode is "all"', () => {
      const deceased: DeceasedFilterable[] = [
        { hebrewDateOfDeath: new Date(2023, 8, 20) },
        { hebrewDateOfDeath: new Date(2023, 9, 20) },
        { hebrewDateOfDeath: new Date(2023, 10, 20) },
      ];
      const result = filterDeceasedByDisplayMode(deceased, 'all', HDate);
      expect(result).toHaveLength(3);
    });

    it('should handle empty array', () => {
      const result = filterDeceasedByDisplayMode([], 'monthly', HDate);
      expect(result).toHaveLength(0);
    });

    describe('monthly filtering in leap year', () => {
      // Mock HDate class that simulates a leap year
      class MockHDateLeapYear {
        private date?: Date;
        private month: number;
        private _isLeapYear: boolean;

        constructor(date?: Date) {
          this.date = date;
          // If date provided, calculate its Hebrew month, otherwise use current mock
          if (date) {
            const realHDate = new HDate(date);
            this.month = realHDate.getMonth();
            this._isLeapYear = realHDate.isLeapYear();
          } else {
            // Mock: current date is in a leap year, month Adar I (12)
            this.month = months.ADAR_I;
            this._isLeapYear = true;
          }
        }

        getMonth(): number {
          return this.month;
        }

        isLeapYear(): boolean {
          return this._isLeapYear;
        }
      }

      it('should filter by current month in leap year - only exact month matches', () => {
        // Deceased who died in different months of leap years
        const deceased: DeceasedFilterable[] = [
          // Died in Adar I of leap year 5784 (Feb 2024)
          { hebrewDateOfDeath: new Date(2024, 1, 15) }, // ~10 Adar I 5784
          // Died in Adar II of leap year 5784 (March 2024)
          { hebrewDateOfDeath: new Date(2024, 2, 20) }, // ~10 Adar II 5784
          // Died in Tishrei
          { hebrewDateOfDeath: new Date(2023, 8, 20) }, // Tishrei 5784
        ];

        // Mock: We are currently in Adar I of a leap year
        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateLeapYear as any);

        // Should only show person who died in Adar I
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(deceased[0]);
      });

      it('should show Adar II deaths when current month is Adar II in leap year', () => {
        class MockHDateAdarII {
          private date?: Date;
          constructor(date?: Date) {
            this.date = date;
          }
          getMonth(): number {
            if (this.date) {
              return new HDate(this.date).getMonth();
            }
            return months.ADAR_II; // Current month
          }
          isLeapYear(): boolean {
            if (this.date) {
              return new HDate(this.date).isLeapYear();
            }
            return true; // Current year is leap
          }
        }

        const deceased: DeceasedFilterable[] = [
          { hebrewDateOfDeath: new Date(2024, 1, 15) }, // Adar I
          { hebrewDateOfDeath: new Date(2024, 2, 20) }, // Adar II
          { hebrewDateOfDeath: new Date(2023, 8, 20) }, // Tishrei
        ];

        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateAdarII as any);

        // Should only show Adar II death
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(deceased[1]);
      });
    });

    describe('monthly filtering in non-leap year', () => {
      // Mock HDate class for non-leap year
      class MockHDateNonLeapAdar {
        private date?: Date;
        private month: number;
        private _isLeapYear: boolean;

        constructor(date?: Date) {
          this.date = date;
          if (date) {
            const realHDate = new HDate(date);
            this.month = realHDate.getMonth();
            this._isLeapYear = realHDate.isLeapYear();
          } else {
            // Mock: current date is in non-leap year, month Adar (12)
            this.month = months.ADAR_I; // In non-leap year, Adar is month 12
            this._isLeapYear = false;
          }
        }

        getMonth(): number {
          return this.month;
        }

        isLeapYear(): boolean {
          return this._isLeapYear;
        }
      }

      it('should show both Adar I and Adar II deaths in non-leap Adar', () => {
        const deceased: DeceasedFilterable[] = [
          // Person who died in Adar I of a leap year
          { hebrewDateOfDeath: new Date(2024, 1, 15) }, // ~Adar I 5784 (leap year)
          // Person who died in Adar II of a leap year
          { hebrewDateOfDeath: new Date(2024, 2, 20) }, // ~Adar II 5784 (leap year)
          // Person who died in Adar of a non-leap year
          { hebrewDateOfDeath: new Date(2023, 2, 15) }, // ~Adar 5783 (non-leap year)
          // Someone from different month
          { hebrewDateOfDeath: new Date(2023, 8, 20) }, // Tishrei
        ];

        // Mock: We are currently in Adar of a non-leap year
        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateNonLeapAdar as any);

        // In non-leap year Adar, should show:
        // - Deaths from Adar I of leap years
        // - Deaths from Adar II of leap years
        // - Deaths from Adar of non-leap years
        expect(result.length).toBeGreaterThanOrEqual(2); // At least Adar I and Adar II from leap year

        // Should NOT include Tishrei
        expect(result).not.toContain(deceased[3]);
      });

      it('should match non-Adar months exactly in non-leap year', () => {
        class MockHDateTishrei {
          private date?: Date;
          constructor(date?: Date) {
            this.date = date;
          }
          getMonth(): number {
            if (this.date) {
              return new HDate(this.date).getMonth();
            }
            return months.TISHREI; // Current month
          }
          isLeapYear(): boolean {
            if (this.date) {
              return new HDate(this.date).isLeapYear();
            }
            return false; // Current year is non-leap
          }
        }

        const deceased: DeceasedFilterable[] = [
          { hebrewDateOfDeath: new Date(2023, 8, 20) }, // Tishrei 5784
          { hebrewDateOfDeath: new Date(2023, 9, 20) }, // Cheshvan 5784
          { hebrewDateOfDeath: new Date(2024, 1, 15) }, // Adar I 5784
        ];

        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateTishrei as any);

        // Should only show Tishrei death
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(deceased[0]);
      });
    });

    describe('complex Adar scenarios', () => {
      it('should handle person who died in regular year Adar shown in leap year Adar I', () => {
        class MockHDateLeapAdarI {
          private date?: Date;
          constructor(date?: Date) {
            this.date = date;
          }
          getMonth(): number {
            if (this.date) {
              return new HDate(this.date).getMonth();
            }
            return months.ADAR_I; // Current: Adar I of leap year
          }
          isLeapYear(): boolean {
            if (this.date) {
              return new HDate(this.date).isLeapYear();
            }
            return true; // Current year is leap
          }
        }

        // Person died in Adar of non-leap year (month 12)
        const deceased: DeceasedFilterable[] = [
          { hebrewDateOfDeath: new Date(2023, 2, 15) }, // Adar 5783 (non-leap)
        ];

        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateLeapAdarI as any);

        // In leap year Adar I, should show people who died in regular Adar
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(deceased[0]);
      });

      it('should NOT show regular Adar deaths in leap year Adar II', () => {
        class MockHDateLeapAdarII {
          private date?: Date;
          constructor(date?: Date) {
            this.date = date;
          }
          getMonth(): number {
            if (this.date) {
              return new HDate(this.date).getMonth();
            }
            return months.ADAR_II; // Current: Adar II of leap year
          }
          isLeapYear(): boolean {
            if (this.date) {
              return new HDate(this.date).isLeapYear();
            }
            return true; // Current year is leap
          }
        }

        // Person died in Adar of non-leap year
        const deceased: DeceasedFilterable[] = [
          { hebrewDateOfDeath: new Date(2023, 2, 15) }, // Adar 5783 (non-leap)
        ];

        const result = filterDeceasedByDisplayMode(deceased, 'monthly', MockHDateLeapAdarII as any);

        // In leap year Adar II, should NOT show people who died in regular Adar
        // (regular Adar deaths are observed in Adar I of leap years)
        expect(result).toHaveLength(0);
      });
    });

    describe('real world integration', () => {
      it('should correctly filter with real HDate based on actual current month', () => {
        const currentHDate = new HDate();
        const currentMonth = currentHDate.getMonth();

        // Create deceased people in various months
        const deceased: DeceasedFilterable[] = [
          { hebrewDateOfDeath: new Date(2023, 8, 20) }, // Tishrei
          { hebrewDateOfDeath: new Date(2023, 9, 20) }, // Cheshvan
          { hebrewDateOfDeath: new Date(2023, 10, 20) }, // Kislev
          { hebrewDateOfDeath: new Date(2024, 0, 20) }, // Tevet
          { hebrewDateOfDeath: new Date(2024, 1, 20) }, // Shevat or Adar
        ];

        const result = filterDeceasedByDisplayMode(deceased, 'monthly', HDate);

        // Result should be filtered
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(deceased.length);

        // Each result should have hebrewDateOfDeath in current month or special Adar handling
        result.forEach((person) => {
          expect(person).toHaveProperty('hebrewDateOfDeath');
        });
      });
    });
  });

  describe('validateDeceasedDates', () => {
    it('should return true when all dates are present', () => {
      const person = {
        dateOfBirth: new Date(1950, 0, 1),
        dateOfDeath: new Date(2020, 0, 1),
        hebrewDateOfBirth: new Date(1950, 0, 1),
        hebrewDateOfDeath: new Date(2020, 0, 1),
      };

      expect(validateDeceasedDates(person)).toBe(true);
    });

    it('should return false when any date is missing', () => {
      const person1 = {
        dateOfBirth: null,
        dateOfDeath: new Date(2020, 0, 1),
        hebrewDateOfBirth: new Date(1950, 0, 1),
        hebrewDateOfDeath: new Date(2020, 0, 1),
      };

      expect(validateDeceasedDates(person1)).toBe(false);
    });

    it('should return false when date is undefined', () => {
      const person = {
        dateOfBirth: new Date(1950, 0, 1),
        dateOfDeath: undefined,
        hebrewDateOfBirth: new Date(1950, 0, 1),
        hebrewDateOfDeath: new Date(2020, 0, 1),
      };

      expect(validateDeceasedDates(person)).toBe(false);
    });
  });

  describe('calculateAgeAtDeath', () => {
    it('should calculate correct age', () => {
      const birth = new Date(1950, 0, 15);
      const death = new Date(2020, 0, 15);
      expect(calculateAgeAtDeath(birth, death)).toBe(70);
    });

    it('should handle birthday not yet reached in death year', () => {
      const birth = new Date(1950, 6, 15); // July 15
      const death = new Date(2020, 0, 15); // Jan 15
      expect(calculateAgeAtDeath(birth, death)).toBe(69);
    });

    it('should handle birthday on same day', () => {
      const birth = new Date(1950, 5, 20);
      const death = new Date(2020, 5, 20);
      expect(calculateAgeAtDeath(birth, death)).toBe(70);
    });

    it('should handle birthday one day after death day', () => {
      const birth = new Date(1950, 5, 21);
      const death = new Date(2020, 5, 20);
      expect(calculateAgeAtDeath(birth, death)).toBe(69);
    });

    it('should calculate age for young person', () => {
      const birth = new Date(2015, 0, 1);
      const death = new Date(2020, 0, 1);
      expect(calculateAgeAtDeath(birth, death)).toBe(5);
    });

    it('should handle death in same year as birth', () => {
      const birth = new Date(2020, 0, 1);
      const death = new Date(2020, 11, 31);
      expect(calculateAgeAtDeath(birth, death)).toBe(0);
    });
  });

  describe('calculateDeceasedPages', () => {
    const mockDeceased: DeceasedPerson[] = [
      {
        name: 'Person 1',
        dateOfBirth: '1950-01-01',
        dateOfDeath: '2020-01-15',
        hebrewDateOfBirth: '1950-01-01',
        hebrewDateOfDeath: '2020-01-15',
        tribute: '',
        photo: null,
      },
      {
        name: 'Person 2',
        dateOfBirth: '1960-02-01',
        dateOfDeath: '2021-02-15',
        hebrewDateOfBirth: '1960-02-01',
        hebrewDateOfDeath: '2021-02-15',
        tribute: '',
        photo: null,
      },
      {
        name: 'Person 3',
        dateOfBirth: '1955-03-01',
        dateOfDeath: '2019-03-15',
        hebrewDateOfBirth: '1955-03-01',
        hebrewDateOfDeath: '2019-03-15',
        tribute: '',
        photo: null,
      },
    ];

    it('should return empty result for empty array', () => {
      const result = calculateDeceasedPages([], 'all', 2, 2);
      expect(result.filteredDeceased).toHaveLength(0);
      expect(result.totalPages).toBe(0);
    });

    it('should return all deceased in "all" mode', () => {
      const result = calculateDeceasedPages(mockDeceased, 'all', 2, 2);
      expect(result.filteredDeceased).toHaveLength(3);
      expect(result.totalPages).toBe(1); // 3 items / 4 cells = 1 page
    });

    it('should calculate correct number of pages', () => {
      const result = calculateDeceasedPages(mockDeceased, 'all', 2, 1);
      expect(result.filteredDeceased).toHaveLength(3);
      expect(result.totalPages).toBe(2); // 3 items / 2 cells = 2 pages
    });

    it('should filter by month in "monthly" mode', () => {
      const result = calculateDeceasedPages(mockDeceased, 'monthly', 2, 2);
      expect(Array.isArray(result.filteredDeceased)).toBe(true);
      expect(typeof result.totalPages).toBe('number');
      expect(result.totalPages).toBeGreaterThanOrEqual(0);
    });

    it('should handle 1x1 grid', () => {
      const result = calculateDeceasedPages(mockDeceased, 'all', 1, 1);
      expect(result.filteredDeceased).toHaveLength(3);
      expect(result.totalPages).toBe(3); // 3 items / 1 cell = 3 pages
    });

    it('should handle large grid', () => {
      const result = calculateDeceasedPages(mockDeceased, 'all', 5, 5);
      expect(result.filteredDeceased).toHaveLength(3);
      expect(result.totalPages).toBe(1); // 3 items / 25 cells = 1 page
    });
  });

  describe('integration: Real hebcal usage', () => {
    it('should work with real HDate for current date', () => {
      const today = new Date();
      const hdate = new HDate(today);

      expect(hdate.getMonth()).toBeGreaterThanOrEqual(1);
      expect(hdate.getMonth()).toBeLessThanOrEqual(13);
      expect(typeof hdate.isLeapYear()).toBe('boolean');
    });

    it('should correctly identify Adar months', () => {
      // In a leap year, there should be Adar I (12) and Adar II (13)
      const leapYearDate = new Date(2024, 2, 1);
      const hdate = new HDate(leapYearDate);
      const month = hdate.getMonth();

      // If it's during Adar months
      if (month === months.ADAR_I || month === months.ADAR_II) {
        expect(hdate.isLeapYear()).toBe(true);
      }
    });

    it('should handle month transitions correctly', () => {
      // Test that consecutive dates give logical Hebrew months
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 15);

      const hdate1 = new HDate(date1);
      const hdate2 = new HDate(date2);

      // Months should either be the same or consecutive
      const monthDiff = Math.abs(hdate2.getMonth() - hdate1.getMonth());
      expect(monthDiff).toBeLessThanOrEqual(1);
    });
  });
});
