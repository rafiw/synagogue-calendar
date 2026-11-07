import { Prayer, ScheduleColumn, Settings } from './defs';
import { ZmanimWrapper } from './zmanim_wrapper';

export interface ScheduleSubPageInfo {
  shouldPaginate: boolean;
  totalPages: number;
  columnsWithPrayers: ScheduleColumn[];
}

/**
 * Determines whether the prayer schedule needs to display one column per sub-page
 * (when there are more than 2 columns with prayers, or in portrait mode with more than 1 column
 * or many prayers, or when any column has more than 6 prayers).
 */
export function calculateScheduleSubPages(
  columns: ScheduleColumn[] | undefined,
  isPortrait: boolean = false,
): ScheduleSubPageInfo {
  const validColumns = Array.isArray(columns)
    ? columns.filter((col) => Array.isArray(col?.prayers) && col.prayers.length > 0)
    : [];
  if (validColumns.length <= 1) {
    return {
      shouldPaginate: false,
      totalPages: 1,
      columnsWithPrayers: validColumns,
    };
  }

  const totalPrayers = validColumns.reduce((sum, col) => sum + col.prayers.length, 0);
  const maxPrayersInColumn = Math.max(...validColumns.map((col) => col.prayers.length));

  // Paginate one column at a time when:
  // - More than 2 columns exist
  // - Any column has more than 6 prayers (or total prayers across columns > 10)
  // - In portrait/vertical view and stacked columns have more than 6 total prayers
  const shouldPaginate =
    validColumns.length > 2 || maxPrayersInColumn > 6 || totalPrayers > 10 || (isPortrait && totalPrayers > 6);

  return {
    shouldPaginate,
    totalPages: shouldPaginate ? validColumns.length : 1,
    columnsWithPrayers: validColumns,
  };
}

/**
 * Calculate the display time for a prayer based on its time type and offset
 * @param prayer - The prayer object
 * @param settings - The settings object containing zmanim configuration
 * @returns The calculated time string in HH:MM format
 */
export function getPrayerDisplayTime(prayer: Prayer, settings: Settings): string {
  const timeType = prayer.timeType || 'time';

  // If it's a direct time entry, return it as-is
  if (timeType === 'time') {
    return prayer.time || '';
  }

  // For sunrise/sunset offsets, we need to calculate the time
  try {
    const zmanim = new ZmanimWrapper(
      settings.synagogueSettings.nusach,
      settings.zmanimSettings.latitude,
      settings.zmanimSettings.longitude,
      settings.zmanimSettings.olson,
      settings.synagogueSettings.language,
      settings.zmanimSettings.purimSettings,
      settings.zmanimSettings.elevation,
    );
    const locale = settings.synagogueSettings.language === 'he' ? 'he-IL' : 'en-US';
    const timeStr = timeType === 'sunrise_offset' ? zmanim.getSunrise() : zmanim.getSunset();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const baseTime = new Date(2026, 1, 1, hours || 0, (minutes || 0) + (prayer.offsetMinutes || 0));
    return baseTime.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });
  } catch {
    return prayer.time || '';
  }
}
