import { ScreenConfig, Location, ZmanimConfig } from './defs';

export const DEFAULT_PAGE_DISPLAY_TIME = 30; // seconds
export const REMOTE_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const DEFAULT_LOCATION: Location = {
  city: 'Jerusalem',
  latitude: 31.7667,
  longitude: 35.2333,
  olson: 'Asia/Jerusalem',
  isIsrael: true,
};

export const DEFAULT_SCREEN_CONFIG: ScreenConfig[] = [
  {
    id: 1,
    name: 'zmanim',
    enabled: true,
    displayTime: DEFAULT_PAGE_DISPLAY_TIME,
  },
  {
    id: 2,
    name: 'classes',
    enabled: true,
    displayTime: DEFAULT_PAGE_DISPLAY_TIME,
  },
  {
    id: 3,
    name: 'deceased',
    enabled: true,
    displayTime: DEFAULT_PAGE_DISPLAY_TIME,
  },
  {
    id: 4,
    name: 'messages',
    enabled: true,
    displayTime: DEFAULT_PAGE_DISPLAY_TIME,
  },
  {
    id: 5,
    name: 'schedule',
    enabled: true,
    displayTime: DEFAULT_PAGE_DISPLAY_TIME,
  },
];

export const DEFAULT_ZMANIM_CONFIG: ZmanimConfig = {
  showSunrise: true,
  showSunset: true,
  showChatzot: true,
  showCandleLighting: true,
  showHavdala: true,
};

export const STORAGE_KEYS = {
  SETTINGS: 'synagogue-calendar-settings',
  GITHUB_TOKEN: 'github-token',
} as const;

export const ERROR_MESSAGES = {
  SETTINGS_LOAD_ERROR: 'Failed to load settings',
  REMOTE_UPDATE_ERROR: 'Failed to update remote settings',
  NETWORK_ERROR: 'Network connection error',
  NO_SCREENS_ENABLED: 'No screens are currently enabled',
} as const;
