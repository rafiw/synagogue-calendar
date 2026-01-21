import { JSX } from 'react';

export interface Class {
  id: string;
  day: number[];
  start: string;
  end: string;
  tutor: string;
  subject: string;
  title?: string;
}

export interface ClassSettings {
  enable: boolean;
  screenDisplayTime: number;
  classes: Class[];
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

export interface DeceasedDisplaySettings {
  tableRows: number;
  tableColumns: number;
  displayMode: 'all' | 'monthly';
  defaultTemplate: 'simple' | 'card' | 'photo';
}

export interface DeceasedSettings {
  enable: boolean;
  screenDisplayTime: number;
  deceased: DeceasedPerson[];
  imgbbApiKey: string;
  displaySettings: DeceasedDisplaySettings;
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
  enable: boolean;
  screenDisplayTime: number;
  columns: ScheduleColumn[];
}

export interface Screen {
  id: number;
  name: string;
  content: () => JSX.Element | null;
  presentTime: number;
}

export interface Message {
  id: string;
  text: string;
  startDate?: string; // Optional ISO date string (YYYY-MM-DD)
  endDate?: string; // Optional ISO date string (YYYY-MM-DD)
  enabled: boolean; // Can be re-enabled after expiring
}

export interface MessageSettings {
  enable: boolean;
  screenDisplayTime: number;
  messages: Message[];
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

export interface ZmanimSettings {
  enable: boolean;
  screenDisplayTime: number;
  city: string;
  latitude: number;
  longitude: number;
  elevation: number;
  olson: string;
  il: boolean;
  purimSettings: PurimSettings;
}

export interface GitHubSettings {
  gistId: string;
  gistFileName: string;
  githubKey: string;
}

export interface SynagogueSettings {
  name: string;
  language: Language;
  nusach: Nusach;
  backgroundSettings: BackgroundSettings;
}

export interface Settings {
  lastUpdateTime: Date;
  githubSettings: GitHubSettings;
  synagogueSettings: SynagogueSettings;
  zmanimSettings: ZmanimSettings;
  messagesSettings: MessageSettings;
  classesSettings: ClassSettings;
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
