import {
  HDate,
  Location,
  Zmanim,
  OmerEvent,
  Event,
  MevarchimChodeshEvent,
  HebrewCalendar,
  CalOptions,
  HolidayEvent,
  CandleLightingEvent,
  HavdalahEvent,
  HebrewDateEvent,
  MoladEvent,
  ParshaEvent,
  months,
  TachanunResult,
  getHolidaysOnDate,
  flags,
  ChanukahEvent,
  RoshChodeshEvent,
} from '@hebcal/core';
import { Nusach, PurimSettings } from './defs';
import { getLeyningOnDate, Leyning } from '@hebcal/leyning';

export enum HallelType {
  NO_HALLEL = 0,
  HALF_HALLEL = 1,
  WHOLE_HALLEL = 2,
}

export enum FastDayType {
  NOT_FAST = 0,
  MINOR_FAST = 1,
  MAJOR_FAST = 2,
}

export class ZmanimWrapper {
  private now: Date;
  private hdate: HDate;
  private il: boolean;
  private location: Location;
  private nusach: Nusach;
  private zmanim: Zmanim;
  private language: string;
  private purimSettings: PurimSettings;

  constructor(
    nusach: Nusach,
    latitude: number,
    longitude: number,
    tzid: string,
    language: string,
    purimSettings: PurimSettings,
    elevation?: number,
  ) {
    this.now = new Date();
    const DEBUG = false;
    // for debugging purposes, set the date to other date than today
    if (DEBUG) {
      this.now.setDate(this.now.getDate() + 236);
      this.now.setHours(8);
    }
    this.nusach = nusach;
    // Create a location object based on provided latitude, longitude, and timezone
    this.il = tzid?.toLowerCase().includes('jerusalem');
    this.location = new Location(latitude, longitude, this.il, tzid, undefined, undefined, undefined, elevation);
    this.hdate = Zmanim.makeSunsetAwareHDate(this.location, this.now, false);
    // this.hdate = new HDate(now);

    // Create a Zmanim object based on today's Hebrew date and the location
    this.zmanim = new Zmanim(this.location, this.hdate, false);

    this.language = language;
    this.purimSettings = purimSettings;
  }

  private getEvents(days: number = 7): Event[] {
    let end = this.hdate;
    if (days !== 0) {
      end = end.add(days, 'd');
    }

    const options: CalOptions = {
      location: this.location,
      year: this.hdate.getFullYear(),
      isHebrewYear: false,
      start: this.hdate,
      end: end,
      candlelighting: true,
      il: this.il,
      sedrot: true,
      noMinorFast: false,
      noModern: false,
      noRoshChodesh: false,
      shabbatMevarchim: true,
      noSpecialShabbat: false,
      noHolidays: false,
      omer: true,
      molad: true,
      locale: this.language,
      addHebrewDates: true,
      dailyLearning: {
        dafYomi: true,
        mishnaYomi: true,
        nachYomi: true,
        tanakhYomi: true,
        psalms: true,
        rambam1: true,
        yerushalmi: 1, // 1 for Vilna edition, 2 for Schottenstein edition
        chofetzChaim: true,
        shemiratHaLashon: true,
        pirkeiAvotSummer: true,
      },
    };
    return HebrewCalendar.calendar(options);
  }
  getSunrise(): string {
    const sunrise = this.zmanim.sunrise();
    return `${sunrise.getHours()}:${sunrise.getMinutes().toString().padStart(2, '0')}`;
  }

  getSunset(): string {
    const sunset = this.zmanim.sunset();
    return `${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2, '0')}`;
  }

  getMinorFastEnd(): string {
    const sunset = this.zmanim.sunset();
    sunset.setMinutes(sunset.getMinutes() + 24);
    return `${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2, '0')}`;
  }

  getMajorFastEnd(): string {
    const sunset = new Date(this.zmanim.sunset());
    sunset.setMinutes(sunset.getMinutes() + 30);
    return `${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2, '0')}`;
  }

  getMisheyakir(): string {
    const misheyakir = this.zmanim.misheyakir();
    return `${misheyakir.getHours()}:${misheyakir.getMinutes().toString().padStart(2, '0')}`;
  }

  getAlotHaShachar(): string {
    const alotHaShachar = this.zmanim.alotHaShachar();
    return `${alotHaShachar.getHours()}:${alotHaShachar.getMinutes().toString().padStart(2, '0')}`;
  }

  getChatzot(): string {
    const value = this.zmanim.chatzot();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getMinchaGdola(): string {
    const value = this.zmanim.minchaGedola();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getMinchaKtana(): string {
    const value = this.zmanim.minchaKetana();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getNetz(): string {
    const value = this.zmanim.neitzHaChama();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getPlag(): string {
    const value = this.zmanim.plagHaMincha();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getSofZmanShma(): string {
    const value = this.zmanim.sofZmanShma();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getsofZmanShmaMGA(): string {
    const value = this.zmanim.sofZmanShmaMGA();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getsofZmanTfilla(): string {
    const value = this.zmanim.sofZmanTfilla();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getsofZmanTfillaMGA(): string {
    const value = this.zmanim.sofZmanTfillaMGA();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  gettzeit(): string {
    const value = this.zmanim.tzeit();
    return `${value.getHours()}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  getParsha(): string {
    const sedra = HebrewCalendar.getSedra(this.hdate.getFullYear(), this.il);
    const sedraResult = sedra.lookup(this.hdate);
    // create event so we can render it
    const event = new ParshaEvent(sedraResult);
    return event.render(this.language);
  }

  getHftara(): string {
    const reading = getLeyningOnDate(this.hdate, this.il, false, this.language) as Leyning | undefined;
    if (this.nusach === 'sephardic' && reading?.sephardic) {
      return reading.sephardic;
    }
    return reading?.haftara || '';
  }

  getHftaraReason(): string {
    const reading = getLeyningOnDate(this.hdate, this.il, false, this.language) as Leyning | undefined;
    return reading?.reason?.[0] || '';
  }

  getHallel(): HallelType {
    const hallelValue = HebrewCalendar.hallel(this.hdate, this.il);
    switch (hallelValue) {
      case 2:
        return HallelType.WHOLE_HALLEL;
      case 1:
        return HallelType.HALF_HALLEL;
      default:
        return HallelType.NO_HALLEL;
    }
  }

  getTachanun(): TachanunResult {
    return HebrewCalendar.tachanun(this.hdate, this.il);
  }

  getCandleLighting(): string {
    const events = this.getEvents();
    for (const ev of events) {
      if (ev instanceof CandleLightingEvent) {
        return ev.eventTimeStr;
      }
    }
    return '';
  }

  getHavdala(): string {
    const events = this.getEvents();
    for (const ev of events) {
      const hd = ev.getDate();
      if (ev instanceof HavdalahEvent) {
        return ev.eventTimeStr;
      }
    }
    return '';
  }

  getHavdalaRT(): string {
    const events = this.getEvents();
    for (const ev of events) {
      if (ev instanceof HavdalahEvent) {
        // if we have a havdala event, return the sunset + 72 minutes
        const sunset = this.zmanim.sunset();
        sunset.setMinutes(sunset.getMinutes() + 72);
        return `${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2, '0')}`;
      }
    }
    return '';
  }

  getHebrewDate(): string {
    const events = this.getEvents();
    for (const ev of events) {
      if (ev instanceof HebrewDateEvent) {
        return ev.render(this.language);
      }
    }
    return '';
  }

  getHoliday(): string[] {
    const ignoreHolidays = [
      'Chag HaBanot',
      'Ben-Gurion Day',
      'Hebrew Language Day',
      'Herzl Day',
      'Jabotinsky Day',
      'Yom HaAliyah School Observance',
      'Leil Selichot', // taken care of by isSlichotTonight
    ];
    const events = this.getEvents(0);
    const holidays = [];
    for (const ev of events) {
      if (ev instanceof HolidayEvent) {
        if (ignoreHolidays.includes(ev.getDesc())) {
          continue;
        }
        holidays.push(ev.render(this.language));
      }
    }
    return holidays;
  }

  isHolidayCandleLighting(): boolean {
    const events = this.getEvents(0);
    for (const ev of events) {
      if (ev instanceof HolidayEvent) {
        if (ev.getFlags() & flags.LIGHT_CANDLES) {
          return true;
        }
      }
    }
    return false;
  }

  getMevarchimChodesh(): string {
    const events = this.getEvents(1);
    for (const ev of events) {
      if (ev instanceof MevarchimChodeshEvent) {
        return ev.render(this.language);
      }
    }
    return '';
  }

  getMolad(): string {
    const events = this.getEvents(1);
    for (const ev of events) {
      if (ev instanceof MoladEvent) {
        return ev.render(this.language);
      }
    }
    return '';
  }

  /**
   * Check if the current Hebrew date falls within a date range
   * Handles ranges that span across the year boundary (e.g., Tishrei to Nisan)
   */
  private isNowBetweenHebrewRange(
    startDay: number,
    startMonth: number,
    startHour: number,
    endDay: number,
    endMonth: number,
    endHour?: number,
  ): boolean {
    const today = this.hdate;
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const hourNow = this.now.getHours();
    const sunsetHour = this.zmanim.sunset().getHours();

    if (todayMonth === startMonth) {
      // verify we are in the day light and not at night before
      return todayDay > startDay || (todayDay === startDay && hourNow <= sunsetHour && startHour <= hourNow);
    }
    if (todayMonth === endMonth) {
      return todayDay < endDay || (todayDay === endDay && (endHour ? endHour <= hourNow : true));
    }
    return todayMonth > startMonth && todayMonth < endMonth;
  }

  /** Morid Hatal is from 15 Nisan to 22 Tishrei till Mosaf */
  isMoridHatal(): boolean {
    return this.isNowBetweenHebrewRange(15, months.NISAN, 10, 22, months.TISHREI, 10);
  }

  /** Veten Bracha is from 15 Nisan to 6 Cheshvan*/
  isVetenBracha(): boolean {
    return this.isNowBetweenHebrewRange(15, months.NISAN, 10, 6, months.CHESHVAN, 0);
  }

  haveYaaleVeyavo(): boolean {
    // Set of holidays with yaale veyavo
    const holidaysWithYaaleVeyavo = new Set([
      'Pesach I',
      'Pesach II',
      "Pesach II (CH''M)",
      "Pesach III (CH''M)",
      "Pesach IV (CH''M)",
      "Pesach V (CH''M)",
      "Pesach VI (CH''M)",
      'Pesach VII',
      'Pesach VIII',
      'Shavuot',
      'Shavuot I',
      'Shavuot II',
      'Shmini Atzeret',
      'Simchat Torah',
      'Sukkot I',
      'Sukkot II',
      "Sukkot III (CH''M)",
      "Sukkot II (CH''M)",
      "Sukkot IV (CH''M)",
      'Sukkot VII (Hoshana Raba)',
      "Sukkot VI (CH''M)",
      "Sukkot V (CH''M)",
      'Yom Kippur',
    ]);
    // Rosh Chodesh except for Tishrei
    const holidays = getHolidaysOnDate(this.hdate, this.il);
    if (!holidays) {
      return false;
    }
    // filter holidays without yaale veyavo
    // remove Erev holidays
    for (const holiday of holidays) {
      // check if is RoshChodesh
      if (holiday instanceof RoshChodeshEvent) {
        return true;
      }
      // if erev skip
      if (holiday.getFlags() & flags.EREV) {
        continue;
      }
      const desc = holiday.getDesc();
      if (holidaysWithYaaleVeyavo.has(desc)) {
        return true;
      }
    }
    return false;
  }

  haveAlHanisim(): boolean {
    const holidays = getHolidaysOnDate(this.hdate, this.il);
    if (!holidays) {
      return false;
    }
    // check if type is ChanukahEvent
    for (const holiday of holidays) {
      if (holiday instanceof ChanukahEvent) {
        return true;
      }
      const desc = holiday.getDesc();
      if (desc === 'Purim' && this.purimSettings.regular) {
        return true;
      }
      if (desc === 'Purim' && this.purimSettings.regular) {
        return true;
      }
      if (desc === 'Shushan Purim' && this.purimSettings.shushan) {
        return true;
      }
    }
    return false;
  }

  isFastDay(): FastDayType {
    const holidays = getHolidaysOnDate(this.hdate, this.il);
    if (!holidays) {
      return FastDayType.NOT_FAST;
    }
    for (const holiday of holidays) {
      if (holiday.getFlags() & flags.MAJOR_FAST) {
        return FastDayType.MAJOR_FAST;
      }
      // don't consider Yom Kippur Katan as a fast day
      if (holiday.getFlags() & flags.MINOR_FAST && !(holiday.getFlags() & flags.YOM_KIPPUR_KATAN)) {
        return FastDayType.MINOR_FAST;
      }
    }
    return FastDayType.NOT_FAST;
  }

  getOmer(): string {
    const events = this.getEvents(0);
    for (const ev of events) {
      if (ev instanceof OmerEvent) {
        // return String(ev.getWeeks() * 7 + ev.getDaysWithinWeeks());
        return ev.getTodayIs(this.language);
      }
    }
    return '';
  }

  isSlichotTonight(): boolean {
    const month = this.hdate.getMonth();
    const day = this.hdate.getDate();
    const hour = this.now.getHours();

    if (month !== months.ELUL && month !== months.TISHREI) {
      return false;
    }
    if (month === months.TISHREI) {
      if (day <= 8 && day >= 2) {
        return true;
      }
      // return hour before 9:00
      if (hour < 9) {
        return true;
      }
      return false;
    }
    if (month === months.ELUL && day === 29) {
      if (hour < 9) {
        return true;
      }
      return false;
    }
    if (this.nusach === 'ashkenaz') {
      const year = this.hdate.getFullYear() + 1;
      const slichotStart = new HDate(HDate.dayOnOrBefore(6, new HDate(1, months.TISHREI, year).abs() - 4));
      return this.hdate.abs() >= slichotStart.abs() && this.hdate.abs() <= slichotStart.abs() + 11;
    }
    return month === months.ELUL && day >= 2;
  }

  getDOE(): number {
    return this.hdate.getDay();
  }

  greg(): Date {
    return this.hdate.greg();
  }
}
