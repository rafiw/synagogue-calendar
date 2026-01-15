import AsyncStorage from '@react-native-async-storage/async-storage';

export const defaultPageDisplayTime = 10;
export function getHebrewDayName(dayNum: number): string {
  const hebrewDays: Map<number, string> = new Map([
    [0, 'ראשון'],
    [1, 'שני'],
    [2, 'שלישי'],
    [3, 'רביעי'],
    [4, 'חמישי'],
    [5, 'שישי'],
    [6, 'שבת'],
  ]);
  return hebrewDays.get(dayNum) || '';
}

export function getSettings() {
  return {
    language: 'he',
    latitude: '32.1169878',
    longitude: '35.1175534',
  };
}

export async function isRTL(): Promise<boolean> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const settings = localSettingsString ? JSON.parse(localSettingsString) : null;
  return settings ? settings.language === 'he' : true;
}

export function isRTL2(language: 'he' | 'en'): boolean {
  return language === 'he';
}

export function getNoScreenText(language: 'he' | 'en') {
  // TODO: find a way to put in index.tsx
  if (language === 'he') return 'לא נמצא מסך. אנא בדוק בהגדרות.';
  return 'No screen found. Please check the settings.';
}
