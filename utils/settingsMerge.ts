import { cities } from '@assets/data';
import { Settings } from '@utils/defs';

export const defaultName = 'בית כנסת לדוגמא';

export const SETTINGS_STORAGE_KEY = 'settings';
export const BACKUP_SETTINGS_STORAGE_KEY = 'settings_backup';

export const defaultSettings: Settings = {
  lastUpdateTime: new Date(),
  githubSettings: {
    gistId: '',
    gistFileName: 'synagogue-settings.json',
    githubKey: '',
  },
  synagogueSettings: {
    name: defaultName,
    language: 'he',
    nusach: 'ashkenaz',
    backgroundSettings: {
      mode: 'gradient',
      imageUrl: '',
      solidColor: '#E3F2FD',
      gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
      gradientStart: { x: 1, y: 1 },
      gradientEnd: { x: 0, y: 0 },
    },
    footerSettings: {
      enable: false,
      text: '',
    },
  },
  zmanimSettings: {
    enable: true,
    screenDisplayTime: 10,
    city: cities[0]?.hebrew_name || '',
    latitude: 31.7667,
    longitude: 35.2333,
    elevation: 0,
    olson: 'Asia/Jerusalem',
    il: true,
    purimSettings: {
      regular: true,
      shushan: false,
    },
  },
  messagesSettings: {
    enable: true,
    screenDisplayTime: 10,
    messages: [
      {
        id: 'msg_default_1',
        text: 'מזל טוב למשפחת כהן לרגל הולדת הבן 👶 יהי רצון שיגדל לתורה, לחופה ולמעשים טובים.',
        enabled: true,
      },
      {
        id: 'msg_default_2',
        text: 'אנו שמחים לברך את המתפללים והאורחים החדשים שהצטרפו אלינו היום. תרגישו בבית',
        enabled: true,
      },
      {
        id: 'msg_default_3',
        text: 'החל מהשבוע: שיעור בגמרא עם הרב לוי כל יום שלישי בשעה 20:30 בבית הכנסת.',
        enabled: true,
      },
    ],
  },
  classesSettings: {
    enable: true,
    screenDisplayTime: 10,
    classes: [
      {
        id: 'class_1768698520454_52xjbtgq6',
        day: [0, 1, 2, 3, 4, 6],
        start: '22:00',
        end: '21:00',
        tutor: 'משה כהן',
        subject: 'דף יומי',
      },
      {
        id: 'class_1768767659451_j99pmr5ea',
        day: [5],
        start: '12:00',
        end: '13:00',
        tutor: 'משה כהן',
        subject: 'דף יומי',
      },
      {
        id: 'class_1768767679349_gyuwn19ix',
        day: [0, 3],
        start: '21:00',
        end: '21:00',
        tutor: 'הרב יפרח',
        subject: 'מסילת ישרים',
      },
    ],
  },
  deceasedSettings: {
    enable: true,
    screenDisplayTime: 10,
    deceased: [],
    imgbbApiKey: '',
    displaySettings: {
      tableRows: 2,
      tableColumns: 3,
      displayMode: 'all',
      defaultTemplate: 'simple',
    },
  },
  scheduleSettings: {
    enable: true,
    screenDisplayTime: 10,
    columns: [
      {
        id: '1768569282274',
        title: 'שבת',
        prayers: [
          {
            id: '1768569315318',
            name: 'מנחה ערב שבת',
            time: "10 דק' אחרי כניסת שבת",
          },
          {
            id: '1768569329105',
            name: 'שחרית',
            time: '8:30',
          },
          {
            id: '1768569339611',
            name: 'מנחה שבת',
            time: '16:00',
          },
        ],
      },
      {
        id: '1768768271286',
        title: 'ימי חול',
        prayers: [
          {
            id: '1768768280476',
            name: 'שחרית',
            time: '6:00',
          },
          {
            id: '1768768287501',
            name: 'שחרית',
            time: '7:00',
          },
          {
            id: '1768768296689',
            name: 'מנחה',
            time: '20 דק לפני שקיעה',
          },
          {
            id: '1768768306304',
            name: 'ערבית',
            time: 'סמוך למנחה',
          },
          {
            id: '1768768313552',
            name: 'ערבית',
            time: '20:00',
          },
        ],
      },
    ],
  },
  dailyHalakhaSettings: {
    enable: true,
    screenDisplayTime: 10,
    selectedBooks: ['פניני הלכה, זמנים'],
    showRelatedHolidaysHalachot: false,
    halakhaItemsPerDay: 3,
  },
};

/**
 * Deep merge and sanitize loaded settings with default settings.
 * Ensures types, boundaries, and safe fallbacks for corrupted or missing values.
 */
export const mergeSettings = (loaded: any, defaults: Settings = defaultSettings): Settings => {
  if (!loaded || typeof loaded !== 'object') {
    return { ...defaults };
  }

  const merged: Settings = { ...defaults };

  // lastUpdateTime
  if (loaded.lastUpdateTime) {
    const d = new Date(loaded.lastUpdateTime);
    merged.lastUpdateTime = !isNaN(d.getTime()) ? d : defaults.lastUpdateTime;
  }

  // githubSettings
  if (loaded.githubSettings && typeof loaded.githubSettings === 'object') {
    merged.githubSettings = {
      gistId:
        typeof loaded.githubSettings.gistId === 'string'
          ? loaded.githubSettings.gistId
          : defaults.githubSettings.gistId,
      gistFileName:
        typeof loaded.githubSettings.gistFileName === 'string' && loaded.githubSettings.gistFileName.trim() !== ''
          ? loaded.githubSettings.gistFileName
          : defaults.githubSettings.gistFileName,
      githubKey:
        typeof loaded.githubSettings.githubKey === 'string'
          ? loaded.githubSettings.githubKey
          : defaults.githubSettings.githubKey,
    };
  }

  // synagogueSettings
  if (loaded.synagogueSettings && typeof loaded.synagogueSettings === 'object') {
    const s = loaded.synagogueSettings;
    const bg = s.backgroundSettings;
    const footer = s.footerSettings;

    merged.synagogueSettings = {
      name: typeof s.name === 'string' && s.name.trim() !== '' ? s.name : defaults.synagogueSettings.name,
      language: s.language === 'en' || s.language === 'he' ? s.language : defaults.synagogueSettings.language,
      nusach: s.nusach ? s.nusach : defaults.synagogueSettings.nusach,
      backgroundSettings: {
        mode: ['solid', 'gradient', 'image'].includes(bg?.mode)
          ? bg.mode
          : defaults.synagogueSettings.backgroundSettings.mode,
        imageUrl:
          typeof bg?.imageUrl === 'string' ? bg.imageUrl : defaults.synagogueSettings.backgroundSettings.imageUrl,
        solidColor:
          typeof bg?.solidColor === 'string' ? bg.solidColor : defaults.synagogueSettings.backgroundSettings.solidColor,
        gradientColors:
          Array.isArray(bg?.gradientColors) && bg.gradientColors.length > 0
            ? bg.gradientColors
            : defaults.synagogueSettings.backgroundSettings.gradientColors,
        gradientStart:
          bg?.gradientStart && typeof bg.gradientStart.x === 'number' && typeof bg.gradientStart.y === 'number'
            ? bg.gradientStart
            : defaults.synagogueSettings.backgroundSettings.gradientStart,
        gradientEnd:
          bg?.gradientEnd && typeof bg.gradientEnd.x === 'number' && typeof bg.gradientEnd.y === 'number'
            ? bg.gradientEnd
            : defaults.synagogueSettings.backgroundSettings.gradientEnd,
      },
      footerSettings: {
        enable: typeof footer?.enable === 'boolean' ? footer.enable : defaults.synagogueSettings.footerSettings.enable,
        text: typeof footer?.text === 'string' ? footer.text : defaults.synagogueSettings.footerSettings.text,
      },
    };
  }

  // zmanimSettings
  if (loaded.zmanimSettings && typeof loaded.zmanimSettings === 'object') {
    const z = loaded.zmanimSettings;
    const purim = z.purimSettings;

    const isValidLat = typeof z.latitude === 'number' && !isNaN(z.latitude) && z.latitude >= -90 && z.latitude <= 90;
    const isValidLng =
      typeof z.longitude === 'number' && !isNaN(z.longitude) && z.longitude >= -180 && z.longitude <= 180;
    const isValidElev = typeof z.elevation === 'number' && !isNaN(z.elevation);
    const isValidDisplayTime =
      typeof z.screenDisplayTime === 'number' && !isNaN(z.screenDisplayTime) && z.screenDisplayTime > 0;

    merged.zmanimSettings = {
      enable: typeof z.enable === 'boolean' ? z.enable : defaults.zmanimSettings.enable,
      screenDisplayTime: isValidDisplayTime ? z.screenDisplayTime : defaults.zmanimSettings.screenDisplayTime,
      city: typeof z.city === 'string' ? z.city : defaults.zmanimSettings.city,
      latitude: isValidLat ? z.latitude : defaults.zmanimSettings.latitude,
      longitude: isValidLng ? z.longitude : defaults.zmanimSettings.longitude,
      elevation: isValidElev ? z.elevation : defaults.zmanimSettings.elevation,
      olson: typeof z.olson === 'string' && z.olson.trim() !== '' ? z.olson : defaults.zmanimSettings.olson,
      il: typeof z.il === 'boolean' ? z.il : defaults.zmanimSettings.il,
      purimSettings: {
        regular: typeof purim?.regular === 'boolean' ? purim.regular : defaults.zmanimSettings.purimSettings.regular,
        shushan: typeof purim?.shushan === 'boolean' ? purim.shushan : defaults.zmanimSettings.purimSettings.shushan,
      },
    };
  }

  // messagesSettings
  if (loaded.messagesSettings && typeof loaded.messagesSettings === 'object') {
    const m = loaded.messagesSettings;
    const isValidDisplayTime =
      typeof m.screenDisplayTime === 'number' && !isNaN(m.screenDisplayTime) && m.screenDisplayTime > 0;
    merged.messagesSettings = {
      enable: typeof m.enable === 'boolean' ? m.enable : defaults.messagesSettings.enable,
      screenDisplayTime: isValidDisplayTime ? m.screenDisplayTime : defaults.messagesSettings.screenDisplayTime,
      messages: Array.isArray(m.messages) ? m.messages : defaults.messagesSettings.messages,
    };
  }

  // classesSettings
  if (loaded.classesSettings && typeof loaded.classesSettings === 'object') {
    const c = loaded.classesSettings;
    const isValidDisplayTime =
      typeof c.screenDisplayTime === 'number' && !isNaN(c.screenDisplayTime) && c.screenDisplayTime > 0;
    const rawClasses = Array.isArray(c.classes) ? c.classes : defaults.classesSettings.classes;
    const normalizedClasses = rawClasses.map((cls: any) => ({
      ...cls,
      location:
        cls?.location && typeof cls.location === 'string' && cls.location.trim() !== ''
          ? cls.location.trim()
          : undefined,
    }));
    merged.classesSettings = {
      enable: typeof c.enable === 'boolean' ? c.enable : defaults.classesSettings.enable,
      screenDisplayTime: isValidDisplayTime ? c.screenDisplayTime : defaults.classesSettings.screenDisplayTime,
      classes: normalizedClasses,
    };
  }

  // deceasedSettings
  if (loaded.deceasedSettings && typeof loaded.deceasedSettings === 'object') {
    const d = loaded.deceasedSettings;
    const isValidDisplayTime =
      typeof d.screenDisplayTime === 'number' && !isNaN(d.screenDisplayTime) && d.screenDisplayTime > 0;
    merged.deceasedSettings = {
      enable: typeof d.enable === 'boolean' ? d.enable : defaults.deceasedSettings.enable,
      screenDisplayTime: isValidDisplayTime ? d.screenDisplayTime : defaults.deceasedSettings.screenDisplayTime,
      deceased: Array.isArray(d.deceased) ? d.deceased : defaults.deceasedSettings.deceased,
      imgbbApiKey: typeof d.imgbbApiKey === 'string' ? d.imgbbApiKey : defaults.deceasedSettings.imgbbApiKey,
      displaySettings: {
        ...defaults.deceasedSettings.displaySettings,
        ...(d.displaySettings && typeof d.displaySettings === 'object' ? d.displaySettings : {}),
      },
    };
  }

  // scheduleSettings
  if (loaded.scheduleSettings && typeof loaded.scheduleSettings === 'object') {
    const s = loaded.scheduleSettings;
    const isValidDisplayTime =
      typeof s.screenDisplayTime === 'number' && !isNaN(s.screenDisplayTime) && s.screenDisplayTime > 0;
    const rawColumns = Array.isArray(s.columns) ? s.columns : defaults.scheduleSettings.columns;
    const normalizedColumns = rawColumns.map((column: any) => ({
      ...column,
      prayers: Array.isArray(column?.prayers)
        ? column.prayers.map((prayer: any) => ({
            ...prayer,
            timeType: prayer?.timeType || 'time',
            offsetMinutes:
              prayer?.offsetMinutes !== undefined && !isNaN(Number(prayer.offsetMinutes))
                ? Number(prayer.offsetMinutes)
                : undefined,
          }))
        : [],
    }));
    merged.scheduleSettings = {
      enable: typeof s.enable === 'boolean' ? s.enable : defaults.scheduleSettings.enable,
      screenDisplayTime: isValidDisplayTime ? s.screenDisplayTime : defaults.scheduleSettings.screenDisplayTime,
      columns: normalizedColumns,
    };
  }

  // dailyHalakhaSettings
  if (loaded.dailyHalakhaSettings && typeof loaded.dailyHalakhaSettings === 'object') {
    const dh = loaded.dailyHalakhaSettings;
    const isValidDisplayTime =
      typeof dh.screenDisplayTime === 'number' && !isNaN(dh.screenDisplayTime) && dh.screenDisplayTime > 0;
    merged.dailyHalakhaSettings = {
      enable: typeof dh.enable === 'boolean' ? dh.enable : defaults.dailyHalakhaSettings.enable,
      screenDisplayTime: isValidDisplayTime ? dh.screenDisplayTime : defaults.dailyHalakhaSettings.screenDisplayTime,
      selectedBooks: Array.isArray(dh.selectedBooks) ? dh.selectedBooks : defaults.dailyHalakhaSettings.selectedBooks,
      showRelatedHolidaysHalachot:
        typeof dh.showRelatedHolidaysHalachot === 'boolean'
          ? dh.showRelatedHolidaysHalachot
          : defaults.dailyHalakhaSettings.showRelatedHolidaysHalachot,
      halakhaItemsPerDay:
        typeof dh.halakhaItemsPerDay === 'number' && !isNaN(dh.halakhaItemsPerDay) && dh.halakhaItemsPerDay > 0
          ? dh.halakhaItemsPerDay
          : defaults.dailyHalakhaSettings.halakhaItemsPerDay,
    };
  }

  return merged;
};
