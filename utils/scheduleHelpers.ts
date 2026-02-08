import { Prayer, Settings } from './defs';
import { ZmanimWrapper } from './zmanim_wrapper';

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
  } catch (error) {
    return prayer.time || '';
  }
}
