/**
 * Helper functions for the Classes component
 * Extracted for better testability
 */

import { Shiur } from './defs';

// Day of week definitions
export const daysOfWeek = [
  { number: 0, key: 'sunday' },
  { number: 1, key: 'monday' },
  { number: 2, key: 'tuesday' },
  { number: 3, key: 'wednesday' },
  { number: 4, key: 'thursday' },
  { number: 5, key: 'friday' },
  { number: 6, key: 'saturday' },
];

/**
 * Get translated day names for given day numbers
 * @param dayNumbers - Array of day numbers (0-6)
 * @param translator - Translation function (t from i18next)
 * @returns Comma-separated string of translated day names
 */
export function getDayNames(dayNumbers: number[], translator: (key: string) => string): string {
  return dayNumbers
    .map((num) => {
      const day = daysOfWeek.find((d) => d.number === num);
      return day ? translator(day.key) : '';
    })
    .filter((name) => name !== '')
    .join(', ');
}

/**
 * Calculate the number of sub-pages needed for classes
 * @param classesCount - Total number of classes
 * @param classesPerPage - Number of classes per page
 * @returns Number of pages needed
 */
export function calculateSubPages(classesCount: number, classesPerPage: number): number {
  if (!classesCount || classesCount === 0) return 0;
  return Math.ceil(classesCount / classesPerPage);
}

/**
 * Get classes for the current page
 * @param classes - Array of all classes (Shiur objects)
 * @param currentPage - Current page index (0-based)
 * @param classesPerPage - Number of classes per page
 * @returns Array of classes for the current page
 */
export function getCurrentPageClasses(classes: Shiur[], currentPage: number, classesPerPage: number): Shiur[] {
  const startIndex = currentPage * classesPerPage;
  return classes.slice(startIndex, startIndex + classesPerPage);
}

/**
 * Format time range for display
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns Formatted time range string
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

/**
 * Validate day numbers are within valid range
 * @param dayNumbers - Array of day numbers to validate
 * @returns True if all day numbers are valid (0-6)
 */
export function validateDayNumbers(dayNumbers: number[]): boolean {
  return dayNumbers.every((num) => num >= 0 && num <= 6);
}

/**
 * Sort classes by start time
 * @param classes - Array of classes to sort
 * @returns Sorted array of classes
 */
export function sortClassesByTime(classes: Shiur[]): Shiur[] {
  return [...classes].sort((a, b) => {
    const timeA = a.start.replace(':', '');
    const timeB = b.start.replace(':', '');
    return parseInt(timeA, 10) - parseInt(timeB, 10);
  });
}

/**
 * Filter classes by day
 * @param classes - Array of all classes
 * @param dayNumber - Day number to filter by (0-6)
 * @returns Array of classes that occur on the specified day
 */
export function filterClassesByDay(classes: Shiur[], dayNumber: number): Shiur[] {
  return classes.filter((shiur) => shiur.day.includes(dayNumber));
}

/**
 * Check if a class occurs today
 * @param shiur - The class to check
 * @param currentDayOfWeek - Current day of week (0-6)
 * @returns True if the class occurs today
 */
export function isClassToday(shiur: Shiur, currentDayOfWeek: number): boolean {
  return shiur.day.includes(currentDayOfWeek);
}

export function getDayMonthYearFromString(dateString: string): { day: number; month: number; year: number } {
  // dateString is in the format of YYYY-MM-DD
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    if (!dayStr || !monthStr || !yearStr) {
      return { day: 0, month: 0, year: 0 };
    }
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return { day: 0, month: 0, year: 0 };
    }
    return { day, month, year };
  } catch (error) {
    console.error('Error getting Hebrew day, month, and year from string:', error);
    return { day: 0, month: 0, year: 0 };
  }
}
