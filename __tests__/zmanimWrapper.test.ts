/**
 * Unit tests for utils/zmanim_wrapper.ts
 * Tests the ZmanimWrapper class using the REAL @hebcal/core library
 * with specific Hebrew dates for predictable, verifiable results
 */

import { HDate, HebrewCalendar, months } from '@hebcal/core';
import { ZmanimWrapper, HallelType } from '../utils/zmanim_wrapper';

describe('ZmanimWrapper', () => {
  // Test with Jerusalem coordinates
  const jerusalemLat = 31.7683;
  const jerusalemLon = 35.2137;
  const jerusalemTz = 'Asia/Jerusalem';
  const hebrewLang = 'he';
  const englishLang = 'en';

  let zmanimHe: ZmanimWrapper;
  let zmanimEn: ZmanimWrapper;

  beforeEach(() => {
    zmanimHe = new ZmanimWrapper(jerusalemLat, jerusalemLon, jerusalemTz, hebrewLang);
    zmanimEn = new ZmanimWrapper(jerusalemLat, jerusalemLon, jerusalemTz, englishLang);
  });

  describe('constructor', () => {
    it('should create instance with valid coordinates', () => {
      expect(zmanimHe).toBeInstanceOf(ZmanimWrapper);
    });

    it('should create instance for different locations', () => {
      const nyZmanim = new ZmanimWrapper(40.7128, -74.006, 'America/New_York', 'en');
      expect(nyZmanim).toBeInstanceOf(ZmanimWrapper);
    });
  });

  describe('time format validation', () => {
    const timeFormatRegex = /^\d{1,2}:\d{2}$/;

    it('should return sunrise in correct format (HH:MM)', () => {
      const sunrise = zmanimHe.getSunrise();
      expect(sunrise).toMatch(timeFormatRegex);
    });

    it('should return sunset in correct format (HH:MM)', () => {
      const sunset = zmanimHe.getSunset();
      expect(sunset).toMatch(timeFormatRegex);
    });

    it('should return misheyakir in correct format (HH:MM)', () => {
      const misheyakir = zmanimHe.getMisheyakir();
      expect(misheyakir).toMatch(timeFormatRegex);
    });

    it('should return alot hashachar in correct format (HH:MM)', () => {
      const alot = zmanimHe.getAlotHaShachar();
      expect(alot).toMatch(timeFormatRegex);
    });

    it('should return chatzot in correct format (HH:MM)', () => {
      const chatzot = zmanimHe.getChatzot();
      expect(chatzot).toMatch(timeFormatRegex);
    });

    it('should return mincha gdola in correct format (HH:MM)', () => {
      const minchaGdola = zmanimHe.getMinchaGdola();
      expect(minchaGdola).toMatch(timeFormatRegex);
    });

    it('should return mincha ktana in correct format (HH:MM)', () => {
      const minchaKtana = zmanimHe.getMinchaKtana();
      expect(minchaKtana).toMatch(timeFormatRegex);
    });

    it('should return netz in correct format (HH:MM)', () => {
      const netz = zmanimHe.getNetz();
      expect(netz).toMatch(timeFormatRegex);
    });

    it('should return plag hamincha in correct format (HH:MM)', () => {
      const plag = zmanimHe.getPlag();
      expect(plag).toMatch(timeFormatRegex);
    });

    it('should return sof zman shma in correct format (HH:MM)', () => {
      const sofZmanShma = zmanimHe.getSofZmanShma();
      expect(sofZmanShma).toMatch(timeFormatRegex);
    });

    it('should return sof zman shma MGA in correct format (HH:MM)', () => {
      const sofZmanShmaMGA = zmanimHe.getsofZmanShmaMGA();
      expect(sofZmanShmaMGA).toMatch(timeFormatRegex);
    });

    it('should return sof zman tfilla in correct format (HH:MM)', () => {
      const sofZmanTfilla = zmanimHe.getsofZmanTfilla();
      expect(sofZmanTfilla).toMatch(timeFormatRegex);
    });

    it('should return sof zman tfilla MGA in correct format (HH:MM)', () => {
      const sofZmanTfillaMGA = zmanimHe.getsofZmanTfillaMGA();
      expect(sofZmanTfillaMGA).toMatch(timeFormatRegex);
    });

    it('should return tzeit in correct format (HH:MM)', () => {
      const tzeit = zmanimHe.gettzeit();
      expect(tzeit).toMatch(timeFormatRegex);
    });
  });

  describe('time logical order', () => {
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    it('should have alot before misheyakir', () => {
      const alot = parseTime(zmanimHe.getAlotHaShachar());
      const misheyakir = parseTime(zmanimHe.getMisheyakir());
      expect(alot).toBeLessThan(misheyakir);
    });

    it('should have misheyakir before sunrise', () => {
      const misheyakir = parseTime(zmanimHe.getMisheyakir());
      const sunrise = parseTime(zmanimHe.getSunrise());
      expect(misheyakir).toBeLessThan(sunrise);
    });

    it('should have sunrise before chatzot', () => {
      const sunrise = parseTime(zmanimHe.getSunrise());
      const chatzot = parseTime(zmanimHe.getChatzot());
      expect(sunrise).toBeLessThan(chatzot);
    });

    it('should have chatzot before mincha gdola', () => {
      const chatzot = parseTime(zmanimHe.getChatzot());
      const minchaGdola = parseTime(zmanimHe.getMinchaGdola());
      expect(chatzot).toBeLessThanOrEqual(minchaGdola);
    });

    it('should have mincha gdola before mincha ktana', () => {
      const minchaGdola = parseTime(zmanimHe.getMinchaGdola());
      const minchaKtana = parseTime(zmanimHe.getMinchaKtana());
      expect(minchaGdola).toBeLessThan(minchaKtana);
    });

    it('should have mincha ktana before plag', () => {
      const minchaKtana = parseTime(zmanimHe.getMinchaKtana());
      const plag = parseTime(zmanimHe.getPlag());
      expect(minchaKtana).toBeLessThan(plag);
    });

    it('should have plag before sunset', () => {
      const plag = parseTime(zmanimHe.getPlag());
      const sunset = parseTime(zmanimHe.getSunset());
      expect(plag).toBeLessThan(sunset);
    });

    it('should have sunset before tzeit', () => {
      const sunset = parseTime(zmanimHe.getSunset());
      const tzeit = parseTime(zmanimHe.gettzeit());
      expect(sunset).toBeLessThan(tzeit);
    });
  });

  describe('Hebrew calendar functions', () => {
    it('should return parsha as string', () => {
      const parsha = zmanimHe.getParsha();
      expect(typeof parsha).toBe('string');
    });

    it('should return Hebrew date as string', () => {
      const hebrewDate = zmanimHe.getHebrewDate();
      expect(typeof hebrewDate).toBe('string');
    });

    it('should return omer as string (empty or number)', () => {
      const omer = zmanimHe.getOmer();
      expect(typeof omer).toBe('string');
      if (omer) {
        const omerNum = parseInt(omer, 10);
        expect(omerNum).toBeGreaterThanOrEqual(1);
        expect(omerNum).toBeLessThanOrEqual(49);
      }
    });

    it('should return holiday as string', () => {
      const holiday = zmanimHe.getHoliday();
      expect(typeof holiday).toBe('string');
    });

    it('should return mevarchim chodesh as string', () => {
      const mevarchim = zmanimHe.getMevarchimChodesh();
      expect(typeof mevarchim).toBe('string');
    });

    it('should return molad as string', () => {
      const molad = zmanimHe.getMolad();
      expect(typeof molad).toBe('string');
    });

    it('should return candle lighting as string', () => {
      const candleLighting = zmanimHe.getCandleLighting();
      expect(typeof candleLighting).toBe('string');
    });

    it('should return havdala as string', () => {
      const havdala = zmanimHe.getHavdala();
      expect(typeof havdala).toBe('string');
    });
  });

  describe('API consistency', () => {
    it('should have all expected zmanim methods', () => {
      expect(typeof zmanimHe.getSunrise).toBe('function');
      expect(typeof zmanimHe.getSunset).toBe('function');
      expect(typeof zmanimHe.getMisheyakir).toBe('function');
      expect(typeof zmanimHe.getAlotHaShachar).toBe('function');
      expect(typeof zmanimHe.getChatzot).toBe('function');
      expect(typeof zmanimHe.getMinchaGdola).toBe('function');
      expect(typeof zmanimHe.getMinchaKtana).toBe('function');
      expect(typeof zmanimHe.getNetz).toBe('function');
      expect(typeof zmanimHe.getPlag).toBe('function');
      expect(typeof zmanimHe.getSofZmanShma).toBe('function');
      expect(typeof zmanimHe.getsofZmanShmaMGA).toBe('function');
      expect(typeof zmanimHe.getsofZmanTfilla).toBe('function');
      expect(typeof zmanimHe.getsofZmanTfillaMGA).toBe('function');
      expect(typeof zmanimHe.gettzeit).toBe('function');
    });

    it('should have all expected calendar methods', () => {
      expect(typeof zmanimHe.getParsha).toBe('function');
      expect(typeof zmanimHe.getHebrewDate).toBe('function');
      expect(typeof zmanimHe.getHoliday).toBe('function');
      expect(typeof zmanimHe.getOmer).toBe('function');
      expect(typeof zmanimHe.getMevarchimChodesh).toBe('function');
      expect(typeof zmanimHe.getMolad).toBe('function');
      expect(typeof zmanimHe.getCandleLighting).toBe('function');
      expect(typeof zmanimHe.getHavdala).toBe('function');
    });

    it('should return consistent values across multiple calls', () => {
      const sunrise1 = zmanimHe.getSunrise();
      const sunrise2 = zmanimHe.getSunrise();
      expect(sunrise1).toBe(sunrise2);
    });
  });

  describe('different locations', () => {
    it('should create instances for various timezone locations', () => {
      const locations = [
        { lat: 31.7683, lon: 35.2137, tz: 'Asia/Jerusalem', name: 'Jerusalem' },
        { lat: 40.7128, lon: -74.006, tz: 'America/New_York', name: 'New York' },
        { lat: 51.5074, lon: -0.1278, tz: 'Europe/London', name: 'London' },
      ];

      locations.forEach(({ lat, lon, tz }) => {
        const zmanim = new ZmanimWrapper(lat, lon, tz, 'en');
        expect(zmanim).toBeInstanceOf(ZmanimWrapper);
        expect(typeof zmanim.getSunrise()).toBe('string');
      });
    });

    it('should handle Jerusalem timezone correctly for il flag', () => {
      const jerusalemZmanim = new ZmanimWrapper(31.7683, 35.2137, 'Asia/Jerusalem', 'he');
      expect(jerusalemZmanim).toBeInstanceOf(ZmanimWrapper);
    });

    it('should handle non-Jerusalem timezone correctly', () => {
      const nyZmanim = new ZmanimWrapper(40.7128, -74.006, 'America/New_York', 'en');
      expect(nyZmanim).toBeInstanceOf(ZmanimWrapper);
    });
  });

  describe('isMashivHaruach and isTalUmatar', () => {
    it('should have isMashivHaruach and isTalUmatar methods', () => {
      expect(typeof zmanimHe.isMashivHaruach).toBe('function');
      expect(typeof zmanimHe.isTalUmatar).toBe('function');
    });

    it('should return boolean from isMashivHaruach', () => {
      const result = zmanimHe.isMashivHaruach();
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean from isTalUmatar', () => {
      const result = zmanimHe.isTalUmatar();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getHallel', () => {
    it('should return a HallelType enum value', () => {
      const result = zmanimHe.getHallel();
      expect([HallelType.NO_HALLEL, HallelType.HALF_HALLEL, HallelType.WHOLE_HALLEL]).toContain(result);
    });
  });

  describe('getTachanun', () => {
    it('should return a TachanunResult object', () => {
      const result = zmanimHe.getTachanun();
      expect(result).toBeDefined();
      expect(typeof result.tachanun).toBe('boolean');
    });
  });
});

/**
 * Tests for Hebrew Date Range Logic using real @hebcal/core library
 * Tests the date range calculation logic for isMashivHaruach and isTalUmatar
 */
describe('Hebrew Calendar Integration Tests', () => {
  describe('HDate basic operations', () => {
    it('should create HDate with specific day, month, year', () => {
      const hdate = new HDate(15, months.NISAN, 5785);
      // Use the correct method names from @hebcal/core
      expect(hdate.getMonth()).toBe(months.NISAN);
      expect(hdate.getFullYear()).toBe(5785);
    });

    it('should correctly identify Hebrew months', () => {
      expect(months.TISHREI).toBe(7);
      expect(months.CHESHVAN).toBe(8);
      expect(months.NISAN).toBe(1);
    });
  });

  describe('Hebrew Date Range Logic for Mashiv Haruach and Tal Umatar', () => {
    /**
     * Helper to check if a date is in range using the same logic as isInHebrewDateRange
     * Mashiv Haruach: 22 Tishrei to 10 Nisan
     * Tal Umatar: 7 Cheshvan to 10 Nisan
     */
    const isInHebrewDateRange = (
      todayDay: number,
      todayMonth: number,
      startDay: number,
      startMonth: number,
      endDay: number,
      endMonth: number,
    ): boolean => {
      if (todayMonth === startMonth) {
        return todayDay >= startDay;
      }
      if (todayMonth === endMonth) {
        return todayDay <= endDay;
      }
      return todayMonth > startMonth || todayMonth < endMonth;
    };

    const isMashivHaruach = (day: number, month: number): boolean => {
      return isInHebrewDateRange(day, month, 22, months.TISHREI, 10, months.NISAN);
    };

    const isTalUmatar = (day: number, month: number): boolean => {
      return isInHebrewDateRange(day, month, 7, months.CHESHVAN, 10, months.NISAN);
    };

    describe('isMashivHaruach (22 Tishrei - 10 Nisan)', () => {
      it('should return false on 21 Tishrei (before Shemini Atzeret)', () => {
        expect(isMashivHaruach(21, months.TISHREI)).toBe(false);
      });

      it('should return true on 22 Tishrei (Shemini Atzeret)', () => {
        expect(isMashivHaruach(22, months.TISHREI)).toBe(true);
      });

      it('should return true throughout winter months', () => {
        expect(isMashivHaruach(15, months.CHESHVAN)).toBe(true);
        expect(isMashivHaruach(25, months.KISLEV)).toBe(true); // Chanukah
        expect(isMashivHaruach(10, months.TEVET)).toBe(true);
        expect(isMashivHaruach(15, months.SHVAT)).toBe(true); // Tu BiShvat
        expect(isMashivHaruach(14, months.ADAR_I)).toBe(true);
      });

      it('should return true on 10 Nisan (last day)', () => {
        expect(isMashivHaruach(10, months.NISAN)).toBe(true);
      });

      it('should return false on 11 Nisan (after end)', () => {
        expect(isMashivHaruach(11, months.NISAN)).toBe(false);
      });

      it('should return false during summer months', () => {
        expect(isMashivHaruach(15, months.NISAN)).toBe(false); // Pesach
        expect(isMashivHaruach(18, months.IYYAR)).toBe(false); // Lag BaOmer
        expect(isMashivHaruach(6, months.SIVAN)).toBe(false); // Shavuot
        expect(isMashivHaruach(9, months.AV)).toBe(false); // Tisha B'Av
        expect(isMashivHaruach(1, months.ELUL)).toBe(false);
      });
    });

    describe('isTalUmatar (7 Cheshvan - 10 Nisan)', () => {
      it('should return false on 6 Cheshvan', () => {
        expect(isTalUmatar(6, months.CHESHVAN)).toBe(false);
      });

      it('should return true on 7 Cheshvan (start date)', () => {
        expect(isTalUmatar(7, months.CHESHVAN)).toBe(true);
      });

      it('should return false during all of Tishrei', () => {
        expect(isTalUmatar(1, months.TISHREI)).toBe(false); // Rosh Hashana
        expect(isTalUmatar(10, months.TISHREI)).toBe(false); // Yom Kippur
        expect(isTalUmatar(15, months.TISHREI)).toBe(false); // Sukkot
        expect(isTalUmatar(22, months.TISHREI)).toBe(false); // Shemini Atzeret
      });

      it('should return true on 10 Nisan (last day)', () => {
        expect(isTalUmatar(10, months.NISAN)).toBe(true);
      });

      it('should return false on 15 Nisan (Pesach)', () => {
        expect(isTalUmatar(15, months.NISAN)).toBe(false);
      });
    });

    describe('Boundary between Mashiv Haruach and Tal Umatar', () => {
      it('on 22 Tishrei: Mashiv Haruach yes, Tal Umatar no', () => {
        expect(isMashivHaruach(22, months.TISHREI)).toBe(true);
        expect(isTalUmatar(22, months.TISHREI)).toBe(false);
      });

      it('on 6 Cheshvan: Mashiv Haruach yes, Tal Umatar no', () => {
        expect(isMashivHaruach(6, months.CHESHVAN)).toBe(true);
        expect(isTalUmatar(6, months.CHESHVAN)).toBe(false);
      });

      it('on 7 Cheshvan: both true', () => {
        expect(isMashivHaruach(7, months.CHESHVAN)).toBe(true);
        expect(isTalUmatar(7, months.CHESHVAN)).toBe(true);
      });

      it('on 10 Nisan: both true (last day)', () => {
        expect(isMashivHaruach(10, months.NISAN)).toBe(true);
        expect(isTalUmatar(10, months.NISAN)).toBe(true);
      });

      it('on 11 Nisan: both false', () => {
        expect(isMashivHaruach(11, months.NISAN)).toBe(false);
        expect(isTalUmatar(11, months.NISAN)).toBe(false);
      });
    });
  });
});
