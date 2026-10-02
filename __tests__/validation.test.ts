import { describe, it, expect } from 'vitest';
import {
  isValidDateString,
  isDateInFuture,
  isDateAfter,
  isValidDateRange,
  isValidTimeHHMM,
  normalizeTimeHHMM,
  compareTimeStrings,
  validateDeceasedPersonDates,
} from '../utils/validation';

describe('validation utilities', () => {
  describe('isValidDateString', () => {
    it('validates correct Gregorian dates in YYYY-MM-DD format', () => {
      expect(isValidDateString('2026-10-02')).toBe(true);
      expect(isValidDateString('2000-01-01')).toBe(true);
      expect(isValidDateString('1985-12-31')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
      expect(isValidDateString('2000-02-29')).toBe(true); // Century leap year
    });

    it('rejects invalid leap year dates', () => {
      expect(isValidDateString('2023-02-29')).toBe(false);
      expect(isValidDateString('1900-02-29')).toBe(false); // 1900 is not a leap year
      expect(isValidDateString('2100-02-29')).toBe(false); // 2100 is not a leap year
    });

    it('rejects days exceeding month length', () => {
      expect(isValidDateString('2026-04-31')).toBe(false); // April has 30 days
      expect(isValidDateString('2026-06-31')).toBe(false); // June has 30 days
      expect(isValidDateString('2026-09-31')).toBe(false); // Sept has 30 days
      expect(isValidDateString('2026-11-31')).toBe(false); // Nov has 30 days
      expect(isValidDateString('2026-01-32')).toBe(false);
    });

    it('rejects invalid month numbers', () => {
      expect(isValidDateString('2026-00-15')).toBe(false);
      expect(isValidDateString('2026-13-01')).toBe(false);
    });

    it('rejects invalid year ranges', () => {
      expect(isValidDateString('1699-12-31')).toBe(false);
      expect(isValidDateString('2201-01-01')).toBe(false);
    });

    it('rejects malformed date strings, null, undefined', () => {
      expect(isValidDateString('02/10/2026')).toBe(false);
      expect(isValidDateString('2026/10/02')).toBe(false);
      expect(isValidDateString('2026-1-2')).toBe(false);
      expect(isValidDateString('abc')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null)).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    const reference = new Date(2026, 9, 2); // 2026-10-02

    it('identifies future dates correctly', () => {
      expect(isDateInFuture('2026-10-03', reference)).toBe(true);
      expect(isDateInFuture('2027-01-01', reference)).toBe(true);
    });

    it('identifies past or today dates correctly', () => {
      expect(isDateInFuture('2026-10-02', reference)).toBe(false); // Today is not strictly in future
      expect(isDateInFuture('2026-10-01', reference)).toBe(false);
      expect(isDateInFuture('2020-01-01', reference)).toBe(false);
    });

    it('returns false for invalid date strings', () => {
      expect(isDateInFuture('invalid', reference)).toBe(false);
      expect(isDateInFuture(null, reference)).toBe(false);
      expect(isDateInFuture(undefined, reference)).toBe(false);
    });
  });

  describe('isDateAfter', () => {
    it('compares valid dates correctly', () => {
      expect(isDateAfter('2026-10-03', '2026-10-02')).toBe(true);
      expect(isDateAfter('2026-10-02', '2026-10-03')).toBe(false);
      expect(isDateAfter('2026-10-02', '2026-10-02')).toBe(false);
    });

    it('returns false if any date is invalid', () => {
      expect(isDateAfter('invalid', '2026-10-02')).toBe(false);
      expect(isDateAfter('2026-10-02', 'invalid')).toBe(false);
    });
  });

  describe('isValidDateRange', () => {
    it('allows empty or null ranges', () => {
      expect(isValidDateRange('', '')).toEqual({ valid: true });
      expect(isValidDateRange(null, null)).toEqual({ valid: true });
      expect(isValidDateRange(undefined, undefined)).toEqual({ valid: true });
    });

    it('validates single dates', () => {
      expect(isValidDateRange('2026-10-01', '')).toEqual({ valid: true });
      expect(isValidDateRange('', '2026-10-10')).toEqual({ valid: true });
      expect(isValidDateRange('bad-date', '')).toEqual({ valid: false, errorKey: 'invalid_date_format' });
      expect(isValidDateRange('', 'bad-date')).toEqual({ valid: false, errorKey: 'invalid_date_format' });
    });

    it('validates full date range', () => {
      expect(isValidDateRange('2026-10-01', '2026-10-10')).toEqual({ valid: true });
      expect(isValidDateRange('2026-10-10', '2026-10-10')).toEqual({ valid: true });
      expect(isValidDateRange('2026-10-10', '2026-10-01')).toEqual({
        valid: false,
        errorKey: 'end_date_before_start_date',
      });
    });
  });

  describe('isValidTimeHHMM', () => {
    it('validates standard 24-hour HH:MM strings', () => {
      expect(isValidTimeHHMM('00:00')).toBe(true);
      expect(isValidTimeHHMM('08:30')).toBe(true);
      expect(isValidTimeHHMM('8:30')).toBe(true);
      expect(isValidTimeHHMM('12:00')).toBe(true);
      expect(isValidTimeHHMM('23:59')).toBe(true);
    });

    it('rejects invalid hours or minutes', () => {
      expect(isValidTimeHHMM('24:00')).toBe(false);
      expect(isValidTimeHHMM('25:30')).toBe(false);
      expect(isValidTimeHHMM('12:60')).toBe(false);
      expect(isValidTimeHHMM('12:99')).toBe(false);
      expect(isValidTimeHHMM('abc')).toBe(false);
      expect(isValidTimeHHMM('')).toBe(false);
      expect(isValidTimeHHMM(null)).toBe(false);
      expect(isValidTimeHHMM(undefined)).toBe(false);
    });
  });

  describe('normalizeTimeHHMM', () => {
    it('pads single-digit hours to 2 digits', () => {
      expect(normalizeTimeHHMM('9:05')).toBe('09:05');
      expect(normalizeTimeHHMM('0:30')).toBe('00:30');
    });

    it('keeps 2-digit hours intact', () => {
      expect(normalizeTimeHHMM('14:45')).toBe('14:45');
      expect(normalizeTimeHHMM('08:00')).toBe('08:00');
    });

    it('returns null for invalid times', () => {
      expect(normalizeTimeHHMM('25:00')).toBeNull();
      expect(normalizeTimeHHMM('invalid')).toBeNull();
      expect(normalizeTimeHHMM(null)).toBeNull();
    });
  });

  describe('compareTimeStrings', () => {
    it('compares times by minutes correctly', () => {
      expect(compareTimeStrings('08:00', '09:00')).toBeLessThan(0);
      expect(compareTimeStrings('09:00', '08:00')).toBeGreaterThan(0);
      expect(compareTimeStrings('09:00', '09:00')).toBe(0);
      expect(compareTimeStrings('8:30', '08:30')).toBe(0);
    });

    it('handles null or missing times safely', () => {
      expect(compareTimeStrings(null, '09:00')).toBe(0);
      expect(compareTimeStrings('09:00', null)).toBe(0);
    });
  });

  describe('validateDeceasedPersonDates', () => {
    it('passes when no dates are provided', () => {
      const res = validateDeceasedPersonDates('', '');
      expect(res.valid).toBe(true);
      expect(res.dobError).toBeUndefined();
      expect(res.dodError).toBeUndefined();
    });

    it('passes for valid historical birth and death dates', () => {
      const res = validateDeceasedPersonDates('1930-05-15', '2015-11-20');
      expect(res.valid).toBe(true);
    });

    it('fails when date format is invalid', () => {
      const res = validateDeceasedPersonDates('15/05/1930', '2015-11-20');
      expect(res.valid).toBe(false);
      expect(res.dobError).toBe('invalid_date_format');
    });

    it('fails when date is in the future', () => {
      const futureDate = '2199-01-01';
      const res = validateDeceasedPersonDates('1950-01-01', futureDate);
      expect(res.valid).toBe(false);
      expect(res.dodError).toBe('date_cannot_be_in_future');
    });

    it('fails when birth date is after death date', () => {
      const res = validateDeceasedPersonDates('2000-01-01', '1990-01-01');
      expect(res.valid).toBe(false);
      expect(res.dodError).toBe('birth_date_after_death_date');
    });
  });
});
