/**
 * Helper functions for the Deceased component
 * Pure functions extracted for better testability
 */

import { HDate, months } from '@hebcal/core';
import { getDayMonthYearFromString } from './classesHelpers';
import { DeceasedPerson } from './defs';

// Types for dynamic sizing
export interface FontSizes {
  name: number;
  nameCard: number;
  namePhoto: number;
  date: number;
  dateSmall: number;
  hebrew: number;
  tribute: number;
  footer: number;
  label: number;
}

export interface CandleSizes {
  simple: number;
  card: number;
  photoPlaceholder: number;
  photoFooter: number;
}

export interface CalculatedSizes {
  fontSize: FontSizes;
  candleSize: CandleSizes;
}

/**
 * Calculate scale factor based on total number of cells in the grid
 * Larger grids get smaller scale factors to fit more content
 */
export function getScaleFactor(totalCells: number): number {
  if (totalCells === 1) return 2.5;
  if (totalCells <= 2) return 2;
  if (totalCells <= 4) return 1.8;
  if (totalCells <= 6) return 1.6;
  if (totalCells <= 8) return 1.5;
  if (totalCells <= 10) return 1.4;
  if (totalCells <= 12) return 1.3;
  if (totalCells <= 14) return 1.2;
  if (totalCells <= 16) return 1.1;
  if (totalCells <= 18) return 1.0;
  if (totalCells <= 20) return 0.9;
  return 0.8;
}

/**
 * Calculate font and candle sizes based on grid configuration
 * @param gridRows - Number of rows in the grid
 * @param gridCols - Number of columns in the grid
 * @returns Object containing fontSize and candleSize configurations
 */
export function calculateSizes(gridRows: number, gridCols: number): CalculatedSizes {
  const totalCells = gridRows * gridCols;
  const scaleFactor = getScaleFactor(totalCells);

  const fontSize: FontSizes = {
    name: 18 * scaleFactor,
    nameCard: 16 * scaleFactor,
    namePhoto: 20 * scaleFactor,
    date: 12 * scaleFactor,
    dateSmall: 11 * scaleFactor,
    hebrew: 12 * scaleFactor,
    tribute: 11 * scaleFactor,
    footer: 12 * scaleFactor,
    label: 11 * scaleFactor,
  };

  const candleSize: CandleSizes = {
    simple: Math.round(40 * scaleFactor),
    card: Math.round(35 * scaleFactor),
    photoPlaceholder: Math.round(60 * scaleFactor),
    photoFooter: Math.round(30 * scaleFactor),
  };

  return { fontSize, candleSize };
}

/**
 * Calculate pagination info for deceased display
 * @param totalItems - Total number of deceased to display
 * @param itemsPerPage - Number of items per page (grid cells)
 * @returns Object with pagination details
 */
export function calculatePagination(
  totalItems: number,
  itemsPerPage: number,
): {
  totalPages: number;
  hasMultiplePages: boolean;
} {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    totalPages,
    hasMultiplePages: totalPages > 1,
  };
}

/**
 * Get items for a specific page
 * @param items - Full array of items
 * @param currentPage - Current page index (0-based)
 * @param itemsPerPage - Number of items per page
 * @returns Slice of items for the current page
 */
export function getPageItems<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = currentPage * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Interface for a deceased person with minimal required fields for filtering
 */
export interface DeceasedFilterable {
  hebrewDateOfDeath: Date;
}

/**
 * Get Hebrew month from a date using HDate
 * @param date - The date to get Hebrew month from
 * @param HDateClass - The HDate class from @hebcal/core
 * @returns Hebrew month number
 */
export function getHebrewMonth(date: Date, HDateClass: { new (date: Date): { getMonth(): number } }): number {
  const hdate = new HDateClass(date);
  return hdate.getMonth();
}

/**
 * Check if a year is a Hebrew leap year
 * @param date - The date to check
 * @param HDateClass - The HDate class from @hebcal/core
 * @returns True if the year is a leap year
 */
export function isHebrewLeapYear(date: Date, HDateClass: { new (date?: Date): { isLeapYear(): boolean } }): boolean {
  const hdate = new HDateClass(date);
  return hdate.isLeapYear();
}

/**
 * Get current Hebrew month
 * @param HDateClass - The HDate class from @hebcal/core
 * @returns Current Hebrew month number
 */
export function getCurrentHebrewMonth(HDateClass: { new (): { getMonth(): number } }): number {
  const hdate = new HDateClass();
  return hdate.getMonth();
}

/**
 * Filter deceased by display mode
 * Handles monthly filtering with leap year logic for Adar months
 * @param deceased - Array of deceased persons
 * @param displayMode - 'all' or 'monthly'
 * @param HDateClass - The HDate class from @hebcal/core
 * @returns Filtered array of deceased
 */
export function filterDeceasedByDisplayMode<T extends DeceasedFilterable>(
  deceased: T[],
  displayMode: 'all' | 'monthly',
  HDateClass: {
    new (date?: Date): { isLeapYear(): boolean; getMonth(): number };
  },
): T[] {
  if (displayMode !== 'monthly') {
    return deceased;
  }

  const currentHDate = new HDateClass();
  const isCurrentYearLeapYear = currentHDate.isLeapYear();
  const currentHebrewMonth = currentHDate.getMonth();

  if (isCurrentYearLeapYear) {
    // In a leap year, only show those who died in the same month
    return deceased.filter((person) => {
      const deathHDate = new HDateClass(person.hebrewDateOfDeath);
      return deathHDate.getMonth() === currentHebrewMonth;
    });
  } else {
    // In a non-leap year, show those from the current month OR
    // those who died in Adar II of a leap year (show them in Adar)
    // Adar in non-leap year is month 12, Adar I is 12, Adar II is 13
    return deceased.filter((person) => {
      const deathHDate = new HDateClass(person.hebrewDateOfDeath);
      const deathMonth = deathHDate.getMonth();
      const wasLeapYear = deathHDate.isLeapYear();

      // Direct match
      if (deathMonth === currentHebrewMonth) {
        return true;
      }

      // If person died in Adar II (month 13) of a leap year,
      // and we're currently in Adar (month 12) of a non-leap year
      if (wasLeapYear && deathMonth === 13 && currentHebrewMonth === 12) {
        return true;
      }

      return false;
    });
  }
}

/**
 * Validate if a deceased person has all required date fields
 * @param person - The deceased person object
 * @returns True if all date fields are valid
 */
export function validateDeceasedDates(person: {
  dateOfBirth?: Date | null;
  dateOfDeath?: Date | null;
  hebrewDateOfBirth?: Date | null;
  hebrewDateOfDeath?: Date | null;
}): boolean {
  return !!(person.dateOfBirth && person.dateOfDeath && person.hebrewDateOfBirth && person.hebrewDateOfDeath);
}

/**
 * Calculate age at death
 * @param dateOfBirth - Birth date
 * @param dateOfDeath - Death date
 * @returns Age in years
 */
export function calculateAgeAtDeath(dateOfBirth: Date, dateOfDeath: Date): number {
  const birthDate = new Date(dateOfBirth);
  const deathDate = new Date(dateOfDeath);

  let age = deathDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = deathDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Filter deceased people based on display mode and calculate total pages
 * This is used for both display and timing calculations
 * @param deceased - Array of deceased persons
 * @param displayMode - Display mode ('all' or 'monthly')
 * @param tableRows - Number of rows in the display grid
 * @param tableColumns - Number of columns in the display grid
 * @returns Object with filteredDeceased array and totalPages count
 */
export function calculateDeceasedPages(
  deceased: DeceasedPerson[],
  displayMode: 'all' | 'monthly',
  tableRows: number,
  tableColumns: number,
): { filteredDeceased: DeceasedPerson[]; totalPages: number } {
  if (!deceased || deceased.length === 0) {
    return { filteredDeceased: [], totalPages: 0 };
  }

  let filteredDeceased: DeceasedPerson[];

  if (displayMode === 'all') {
    filteredDeceased = deceased;
  } else {
    // Monthly mode: Show only deceased whose yahrzeit is this Hebrew month
    const today = new HDate();
    const currentMonth = today.getMonth();
    const isCurrentYearLeap = today.isLeapYear();

    filteredDeceased = deceased.filter((person) => {
      if (!person.dateOfDeath) return false;

      // Parse the death date
      const { day, month, year } = getDayMonthYearFromString(person.dateOfDeath || '');
      if (day === 0 || month === 0 || year === 0) return false;

      const deathDate = new HDate(new Date(year, month, day));
      const deathMonth = deathDate.getMonth();

      // Simple case: death month matches current month (not Adar related)
      if (deathMonth === currentMonth && deathMonth !== months.ADAR_I && deathMonth !== months.ADAR_II) {
        return true;
      }

      // Complex case: Handle Adar months
      const wasDeathYearLeap = deathDate.isLeapYear();
      if (isCurrentYearLeap) {
        if (wasDeathYearLeap) {
          // Death year was also a leap year
          // Rule: Adar I → Adar I, Adar II → Adar II (exact match)
          return deathMonth === currentMonth;
        } else {
          // Death year was regular (only had Adar = month 12) yahrzeits on Adar I
          return deathMonth === months.ADAR_I && currentMonth === months.ADAR_I;
        }
      } else {
        // CURRENT YEAR IS REGULAR (only has Adar = month 12)
        if (wasDeathYearLeap) {
          // Death year was a leap year, current year is regular, join both Adar months
          return deathMonth === months.ADAR_I || deathMonth === months.ADAR_II;
        } else {
          // Both death and current years are regular
          return deathMonth === currentMonth;
        }
      }
    });
  }

  const cellsPerPage = tableRows * tableColumns || 1;
  const totalPages = Math.ceil(filteredDeceased.length / cellsPerPage);

  return { filteredDeceased, totalPages };
}
