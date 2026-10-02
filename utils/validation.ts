/**
 * Validation utilities for dates, times, and user inputs.
 * Ensures data integrity and prevents corrupt data from entering the application.
 */

/**
 * Validates whether a string is a valid Gregorian calendar date in YYYY-MM-DD format.
 * Checks format, valid month, valid day for that specific month, and leap years.
 */
export function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  const regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const match = trimmed.match(regex);
  if (!match) return false;

  const year = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10);
  const day = parseInt(match[3]!, 10);

  if (year < 1700 || year > 2200) return false;

  // Days in month check
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return day <= daysInMonth[month - 1]!;
}

/**
 * Checks whether a YYYY-MM-DD date is strictly in the future compared to today.
 */
export function isDateInFuture(dateStr: string | null | undefined, referenceDate: Date = new Date()): boolean {
  if (!isValidDateString(dateStr)) return false;
  const [year = 0, month = 1, day = 1] = (dateStr || '').trim().split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return target.getTime() > today.getTime();
}

/**
 * Checks if date1 is chronologically after date2 (both in YYYY-MM-DD format).
 */
export function isDateAfter(dateStr1: string | null | undefined, dateStr2: string | null | undefined): boolean {
  if (!isValidDateString(dateStr1) || !isValidDateString(dateStr2)) return false;
  return dateStr1!.trim() > dateStr2!.trim();
}

/**
 * Validates a start/end date range for messages.
 */
export function isValidDateRange(
  startDate?: string | null,
  endDate?: string | null,
): { valid: boolean; errorKey?: string } {
  if (startDate && startDate.trim() !== '') {
    if (!isValidDateString(startDate)) {
      return { valid: false, errorKey: 'invalid_date_format' };
    }
  }

  if (endDate && endDate.trim() !== '') {
    if (!isValidDateString(endDate)) {
      return { valid: false, errorKey: 'invalid_date_format' };
    }
  }

  if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
    if (startDate.trim() > endDate.trim()) {
      return { valid: false, errorKey: 'end_date_before_start_date' };
    }
  }

  return { valid: true };
}

/**
 * Validates whether a time string is in valid HH:MM format (24-hour time 00:00 - 23:59).
 * Supports single digit hours like 9:30 or 09:30.
 */
export function isValidTimeHHMM(timeStr: string | null | undefined): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const trimmed = timeStr.trim();
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(trimmed);
}

/**
 * Normalizes a valid time string to standard 2-digit HH:MM (e.g. "9:05" -> "09:05").
 * Returns null if the input is not a valid time.
 */
export function normalizeTimeHHMM(timeStr: string | null | undefined): string | null {
  if (!isValidTimeHHMM(timeStr)) return null;
  const [h, m] = timeStr!.trim().split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Compares two HH:MM time strings.
 * Returns negative if time1 < time2, 0 if equal, positive if time1 > time2.
 */
export function compareTimeStrings(time1: string | null | undefined, time2: string | null | undefined): number {
  if (!time1 || !time2) return 0;
  const [h1 = 0, m1 = 0] = time1.split(':').map(Number);
  const [h2 = 0, m2 = 0] = time2.split(':').map(Number);
  return h1 * 60 + m1 - (h2 * 60 + m2);
}

/**
 * Validates deceased person dates (birth and death).
 */
export function validateDeceasedPersonDates(
  dateOfBirth?: string | null,
  dateOfDeath?: string | null,
): { valid: boolean; dobError?: string; dodError?: string } {
  let dobError: string | undefined;
  let dodError: string | undefined;

  const hasDob = Boolean(dateOfBirth && dateOfBirth.trim() !== '');
  const hasDod = Boolean(dateOfDeath && dateOfDeath.trim() !== '');

  if (hasDob) {
    if (!isValidDateString(dateOfBirth)) {
      dobError = 'invalid_date_format';
    } else if (isDateInFuture(dateOfBirth)) {
      dobError = 'date_cannot_be_in_future';
    }
  }

  if (hasDod) {
    if (!isValidDateString(dateOfDeath)) {
      dodError = 'invalid_date_format';
    } else if (isDateInFuture(dateOfDeath)) {
      dodError = 'date_cannot_be_in_future';
    }
  }

  if (hasDob && hasDod && !dobError && !dodError) {
    if (dateOfBirth!.trim() > dateOfDeath!.trim()) {
      dodError = 'birth_date_after_death_date';
    }
  }

  return {
    valid: !dobError && !dodError,
    dobError,
    dodError,
  };
}
