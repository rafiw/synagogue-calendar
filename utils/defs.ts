import { JSX } from 'react';

export interface Shiur {
  id: string;
  day: number[];
  start: string;
  end: string;
  tutor: string;
  subject: string;
}

export interface DeceasedPerson {
  id: string;
  name: string;
  isMale: boolean;
  dateOfBirth?: string; // Format: YYYY-MM-DD
  hebrewDateOfBirth?: string; // Format: כ״ט אדר א׳ תש״ח
  dateOfDeath?: string; // Format: YYYY-MM-DD
  hebrewDateOfDeath?: string; // Format: DD/MM/YYYY
  template: 'simple' | 'card' | 'photo';
  photo?: string; // Optional photo URL
  tribute?: string; // Optional memorial text
}

export interface DeceasedSettings {
  tableRows: number;
  tableColumns: number;
  displayMode: 'all' | 'monthly';
  defaultTemplate: 'simple' | 'card' | 'photo';
  imgbbApiKey: string;
}

export interface Prayer {
  id: string;
  name: string;
  time: string;
}

export interface ScheduleColumn {
  id: string;
  title: string;
  prayers: Prayer[];
}

export interface ScheduleSettings {
  columns: ScheduleColumn[];
}

export interface Screen {
  id: number;
  name: string;
  content: () => JSX.Element | null;
  presentTime: number;
}

export type Language = 'he' | 'en';

export interface PurimSettings {
  regular: boolean;
  shushan: boolean;
}

export type Nusach = 'ashkenaz' | 'sephardic';

export type BackgroundMode = 'image' | 'solid' | 'gradient';

export interface BackgroundSettings {
  mode: BackgroundMode;
  imageUrl: string;
  solidColor: string;
  gradientColors: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  customImageUri?: string;
}

export interface Settings {
  name: string;
  gistId: string;
  gistFileName: string;
  githubKey: string;
  lastUpdateTime: Date;
  language: Language;
  nusach: Nusach;
  city: string;
  latitude: number;
  longitude: number;
  elevation: number;
  olson: string;
  il: boolean;
  background: string; // Kept for backwards compatibility
  backgroundSettings?: BackgroundSettings;
  purimSettings: PurimSettings;
  enableZmanim: boolean;
  enableClasses: boolean;
  enableDeceased: boolean;
  enableMessages: boolean;
  enableSchedule: boolean;
  messages: string[];
  classes: Shiur[];
  deceased: DeceasedPerson[];
  deceasedSettings: DeceasedSettings;
  scheduleSettings: ScheduleSettings;
}

export interface City {
  hebrew_name: string;
  english_name: string;
  latitude: number;
  longitude: number;
  olson: string;
  il: boolean;
}
