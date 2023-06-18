// Manual mock for @hebcal/core module

// Hebrew month constants (matching @hebcal/core)
const months = {
  NISAN: 1,
  IYYAR: 2,
  SIVAN: 3,
  TAMUZ: 4,
  AV: 5,
  ELUL: 6,
  TISHREI: 7,
  CHESHVAN: 8,
  KISLEV: 9,
  TEVET: 10,
  SHVAT: 11,
  ADAR_I: 12,
  ADAR_II: 13,
};

class MockHDate {
  constructor(dayOrDate, month, year) {
    if (typeof dayOrDate === 'number' && month !== undefined && year !== undefined) {
      // Constructor with (day, month, year)
      this._day = dayOrDate;
      this._month = month;
      this._year = year;
      this._date = new Date();
    } else if (dayOrDate instanceof Date) {
      // Constructor with Date object
      this._date = dayOrDate;
      this._day = 1;
      this._month = 5;
      this._year = 5785;
    } else {
      // Default constructor (today)
      this._date = new Date();
      this._day = 1;
      this._month = 5;
      this._year = 5785;
    }
  }
  isLeapYear() {
    return false;
  }
  getMonth() {
    return this._month;
  }
  getDay() {
    return this._day;
  }
  getFullYear() {
    return this._year;
  }
  greg() {
    return this._date;
  }
}

class MockLocation {
  constructor(lat, lon, il, tzid) {
    this.lat = lat;
    this.lon = lon;
    this.il = il;
    this.tzid = tzid;
  }
}

class MockZmanim {
  constructor(location, hdate, useElevation) {
    this.location = location;
    this.hdate = hdate;
  }
  sunrise() {
    return new Date(2024, 0, 1, 6, 30);
  }
  sunset() {
    return new Date(2024, 0, 1, 17, 30);
  }
  misheyakir() {
    return new Date(2024, 0, 1, 5, 45);
  }
  alotHaShachar() {
    return new Date(2024, 0, 1, 5, 15);
  }
  chatzot() {
    return new Date(2024, 0, 1, 12, 0);
  }
  minchaGedola() {
    return new Date(2024, 0, 1, 12, 30);
  }
  minchaKetana() {
    return new Date(2024, 0, 1, 15, 30);
  }
  neitzHaChama() {
    return new Date(2024, 0, 1, 6, 30);
  }
  plagHaMincha() {
    return new Date(2024, 0, 1, 16, 45);
  }
  sofZmanShma() {
    return new Date(2024, 0, 1, 9, 0);
  }
  sofZmanShmaMGA() {
    return new Date(2024, 0, 1, 8, 30);
  }
  sofZmanTfilla() {
    return new Date(2024, 0, 1, 10, 0);
  }
  sofZmanTfillaMGA() {
    return new Date(2024, 0, 1, 9, 30);
  }
  tzeit() {
    return new Date(2024, 0, 1, 18, 0);
  }
}

class MockHebrewCalendar {
  static calendar(options) {
    return [];
  }
  static getSedra(year, il) {
    return {
      lookup: (hdate) => ({
        parsha: ['Bereshit'],
        chag: false,
      }),
    };
  }
  static hallel(hdate, il) {
    return 0; // Default: no hallel
  }
  static tachanun(hdate, il) {
    return { tachanun: true, yepiYepi: false };
  }
}

class MockParshaEvent {
  constructor(parsha) {
    this.parsha = parsha;
  }
  render(lang) {
    return lang === 'he' ? 'בראשית' : 'Bereshit';
  }
}

class MockHebrewDateEvent {
  render(lang) {
    return lang === 'he' ? 'א\' טבת תשפ"ה' : '1 Tevet 5785';
  }
}

module.exports = {
  HDate: MockHDate,
  Location: MockLocation,
  Zmanim: MockZmanim,
  HebrewCalendar: MockHebrewCalendar,
  ParshaEvent: MockParshaEvent,
  OmerEvent: class {},
  MevarchimChodeshEvent: class {},
  Event: class {},
  CalOptions: {},
  HolidayEvent: class {},
  CandleLightingEvent: class {},
  HavdalahEvent: class {},
  HebrewDateEvent: MockHebrewDateEvent,
  MoladEvent: class {},
  months: months,
  TachanunResult: class {
    constructor() {
      this.tachanun = true;
      this.yepiYepi = false;
    }
  },
};
