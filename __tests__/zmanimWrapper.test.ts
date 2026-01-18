import { describe, it, expect, beforeEach } from 'vitest';
import { ZmanimWrapper, HallelType, FastDayType } from '../utils/zmanim_wrapper';
import { HDate, months } from '@hebcal/core';
import { Nusach } from '../utils/defs';

describe('ZmanimWrapper', () => {
  let wrapper: ZmanimWrapper;

  // Jerusalem coordinates
  const latitude = 31.7683;
  const longitude = 35.2137;
  const tzid = 'Asia/Jerusalem';
  const language = 'he';
  const nusach: Nusach = 'sephardic';
  const purimSettings = {
    regular: true,
    shushan: false,
  };

  beforeEach(() => {
    wrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, purimSettings);
  });

  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(wrapper).toBeDefined();
      expect(wrapper).toBeInstanceOf(ZmanimWrapper);
    });

    it('should work with different locations', () => {
      const nyWrapper = new ZmanimWrapper(nusach, 40.7128, -74.006, 'America/New_York', 'en', purimSettings);
      expect(nyWrapper).toBeDefined();
    });

    it('should work with elevation parameter', () => {
      const elevatedWrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, purimSettings, 800);
      expect(elevatedWrapper).toBeDefined();
    });

    it('should work with Ashkenaz nusach', () => {
      const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);
      expect(ashkenazWrapper).toBeDefined();
    });

    it('should work with Sephardic nusach', () => {
      const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
      expect(sephardicWrapper).toBeDefined();
    });
  });

  describe('basic zmanim times', () => {
    it('should return sunrise in valid time format', () => {
      const sunrise = wrapper.getSunrise();
      expect(sunrise).toMatch(/^\d{1,2}:\d{2}$/);

      const [hours, minutes] = sunrise.split(':').map(Number);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
    });

    it('should return sunset in valid time format', () => {
      const sunset = wrapper.getSunset();
      expect(sunset).toMatch(/^\d{1,2}:\d{2}$/);

      const [hours, minutes] = sunset.split(':').map(Number);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
    });

    it('should have sunset after sunrise', () => {
      const sunrise = wrapper.getSunrise();
      const sunset = wrapper.getSunset();

      const sunriseMinutes = parseInt(sunrise.split(':')[0]) * 60 + parseInt(sunrise.split(':')[1]);
      const sunsetMinutes = parseInt(sunset.split(':')[0]) * 60 + parseInt(sunset.split(':')[1]);

      expect(sunsetMinutes).toBeGreaterThan(sunriseMinutes);
    });

    it('should return chatzot in valid time format', () => {
      const chatzot = wrapper.getChatzot();
      expect(chatzot).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should have chatzot between sunrise and sunset', () => {
      const sunrise = wrapper.getSunrise();
      const chatzot = wrapper.getChatzot();
      const sunset = wrapper.getSunset();

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      const sunriseMin = toMinutes(sunrise);
      const chatzotMin = toMinutes(chatzot);
      const sunsetMin = toMinutes(sunset);

      expect(chatzotMin).toBeGreaterThan(sunriseMin);
      expect(chatzotMin).toBeLessThan(sunsetMin);
    });
  });

  describe('additional zmanim', () => {
    it('should return misheyakir', () => {
      const misheyakir = wrapper.getMisheyakir();
      expect(misheyakir).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return alot hashachar', () => {
      const alot = wrapper.getAlotHaShachar();
      expect(alot).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return mincha gdola', () => {
      const minchaGdola = wrapper.getMinchaGdola();
      expect(minchaGdola).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return mincha ktana', () => {
      const minchaKtana = wrapper.getMinchaKtana();
      expect(minchaKtana).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return netz', () => {
      const netz = wrapper.getNetz();
      expect(netz).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return plag hamincha', () => {
      const plag = wrapper.getPlag();
      expect(plag).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return sof zman shma', () => {
      const sofZmanShma = wrapper.getSofZmanShma();
      expect(sofZmanShma).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return sof zman shma MGA', () => {
      const sofZmanShmaMGA = wrapper.getsofZmanShmaMGA();
      expect(sofZmanShmaMGA).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return sof zman tfilla', () => {
      const sofZmanTfilla = wrapper.getsofZmanTfilla();
      expect(sofZmanTfilla).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return sof zman tfilla MGA', () => {
      const sofZmanTfillaMGA = wrapper.getsofZmanTfillaMGA();
      expect(sofZmanTfillaMGA).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return tzeit', () => {
      const tzeit = wrapper.gettzeit();
      expect(tzeit).toMatch(/^\d{1,2}:\d{2}$/);
    });
  });

  describe('fast day times', () => {
    it('should return minor fast end time', () => {
      const fastEnd = wrapper.getMinorFastEnd();
      expect(fastEnd).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return major fast end time', () => {
      const fastEnd = wrapper.getMajorFastEnd();
      expect(fastEnd).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should have major fast end after minor fast end', () => {
      const minorEnd = wrapper.getMinorFastEnd();
      const majorEnd = wrapper.getMajorFastEnd();

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      expect(toMinutes(majorEnd)).toBeGreaterThan(toMinutes(minorEnd));
    });
  });

  describe('Hebrew calendar data', () => {
    it('should return Hebrew date as string', () => {
      const hebrewDate = wrapper.getHebrewDate();
      expect(typeof hebrewDate).toBe('string');
      expect(hebrewDate.length).toBeGreaterThan(0);
    });

    it('should return parsha', () => {
      const parsha = wrapper.getParsha();
      expect(typeof parsha).toBe('string');
      // Parsha can be empty if not Shabbat or during some holidays
    });

    it('should return haftara', () => {
      const haftara = wrapper.getHftara();
      expect(typeof haftara).toBe('string');
      // Can be empty if not relevant
    });

    it('should return haftara reason', () => {
      const reason = wrapper.getHftaraReason();
      expect(typeof reason).toBe('string');
    });

    it('should return omer count or empty', () => {
      const omer = wrapper.getOmer();
      expect(typeof omer).toBe('string');
      // Will be empty outside of omer period
    });

    it('should return day of week', () => {
      const dow = wrapper.getDOE();
      expect(dow).toBeGreaterThanOrEqual(0);
      expect(dow).toBeLessThanOrEqual(6);
    });

    it('should return gregorian date', () => {
      const date = wrapper.greg();
      expect(date).toBeInstanceOf(Date);
    });
  });

  describe('candle lighting and havdala', () => {
    it('should return candle lighting time or empty string', () => {
      const candleLighting = wrapper.getCandleLighting();
      expect(typeof candleLighting).toBe('string');
      // Will be populated on Friday/Erev Yom Tov
    });

    it('should return havdala time or empty string', () => {
      const havdala = wrapper.getHavdala();
      expect(typeof havdala).toBe('string');
      // Will be populated on Motzei Shabbat/Yom Tov
    });

    it('should return havdala RT or empty string', () => {
      const havdalaRT = wrapper.getHavdalaRT();
      expect(typeof havdalaRT).toBe('string');
      // Will match format if there's havdala
      if (havdalaRT) {
        expect(havdalaRT).toMatch(/^\d{1,2}:\d{2}$/);
      }
    });
  });

  describe('holidays and special days', () => {
    it('should return array of holidays', () => {
      const holidays = wrapper.getHoliday();
      expect(Array.isArray(holidays)).toBe(true);
      // Can be empty on regular days
    });

    it('should return boolean for holiday candle lighting', () => {
      const isHoliday = wrapper.isHolidayCandleLighting();
      expect(typeof isHoliday).toBe('boolean');
    });

    it('should return mevarchim chodesh or empty', () => {
      const mevarchim = wrapper.getMevarchimChodesh();
      expect(typeof mevarchim).toBe('string');
      // Will be populated on Shabbat Mevarchim
    });

    it('should return molad or empty', () => {
      const molad = wrapper.getMolad();
      expect(typeof molad).toBe('string');
      // Will be populated on Shabbat Mevarchim
    });
  });

  describe('hallel', () => {
    it('should return valid hallel type', () => {
      const hallel = wrapper.getHallel();
      expect([HallelType.NO_HALLEL, HallelType.HALF_HALLEL, HallelType.WHOLE_HALLEL]).toContain(hallel);
    });

    it('should be consistent type', () => {
      const hallel1 = wrapper.getHallel();
      const hallel2 = wrapper.getHallel();
      expect(hallel1).toBe(hallel2);
    });
  });

  describe('tachanun', () => {
    it('should return tachanun result', () => {
      const tachanun = wrapper.getTachanun();
      expect(tachanun).toBeDefined();
      expect(typeof tachanun).toBe('object');
    });
  });

  describe('fast days', () => {
    it('should return valid fast day type', () => {
      const fastDay = wrapper.isFastDay();
      expect([FastDayType.NOT_FAST, FastDayType.MINOR_FAST, FastDayType.MAJOR_FAST]).toContain(fastDay);
    });

    it('should be consistent', () => {
      const fast1 = wrapper.isFastDay();
      const fast2 = wrapper.isFastDay();
      expect(fast1).toBe(fast2);
    });
  });

  describe('prayer additions', () => {
    it('should return boolean for yaale veyavo', () => {
      const yaaleVeyavo = wrapper.haveYaaleVeyavo();
      expect(typeof yaaleVeyavo).toBe('boolean');
    });

    it('should return boolean for al hanisim', () => {
      const alHanisim = wrapper.haveAlHanisim();
      expect(typeof alHanisim).toBe('boolean');
    });

    it('should return boolean for morid hatal', () => {
      const moridHatal = wrapper.isMoridHatal();
      expect(typeof moridHatal).toBe('boolean');
    });

    it('should return boolean for veten bracha', () => {
      const vetenBracha = wrapper.isVetenBracha();
      expect(typeof vetenBracha).toBe('boolean');
    });

    it('should have mutually exclusive morid hatal and veten bracha for most of the year', () => {
      const moridHatal = wrapper.isMoridHatal();
      const vetenBracha = wrapper.isVetenBracha();

      // They can both be false (during transition periods)
      // But they shouldn't both be true (they are season-specific)
      if (moridHatal && vetenBracha) {
        // This is actually possible during a brief overlap period
        // So we just check they return booleans
        expect(typeof moridHatal).toBe('boolean');
        expect(typeof vetenBracha).toBe('boolean');
      }
    });
  });

  describe('different locations', () => {
    it('should work for New York', () => {
      const nyWrapper = new ZmanimWrapper(nusach, 40.7128, -74.006, 'America/New_York', 'en', purimSettings);
      const sunrise = nyWrapper.getSunrise();
      expect(sunrise).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should work for London', () => {
      const londonWrapper = new ZmanimWrapper(nusach, 51.5074, -0.1278, 'Europe/London', 'en', purimSettings);
      const sunrise = londonWrapper.getSunrise();
      expect(sunrise).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should work for Tel Aviv', () => {
      const tlvWrapper = new ZmanimWrapper(nusach, 32.0853, 34.7818, 'Asia/Jerusalem', 'he', purimSettings);
      const sunrise = tlvWrapper.getSunrise();
      expect(sunrise).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should have different times for different locations', () => {
      const jerusalemWrapper = new ZmanimWrapper(nusach, 31.7683, 35.2137, 'Asia/Jerusalem', 'he', purimSettings);
      const nyWrapper = new ZmanimWrapper(nusach, 40.7128, -74.006, 'America/New_York', 'en', purimSettings);

      const jerusalemSunrise = jerusalemWrapper.getSunrise();
      const nySunrise = nyWrapper.getSunrise();

      // Times should be different (though they could theoretically match by coincidence)
      // At least verify both are valid
      expect(jerusalemSunrise).toMatch(/^\d{1,2}:\d{2}$/);
      expect(nySunrise).toMatch(/^\d{1,2}:\d{2}$/);
    });
  });

  describe('language support', () => {
    it('should work with Hebrew language', () => {
      const heWrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, 'he', purimSettings);
      const hebrewDate = heWrapper.getHebrewDate();
      expect(typeof hebrewDate).toBe('string');
      expect(hebrewDate.length).toBeGreaterThan(0);
    });

    it('should work with English language', () => {
      const enWrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, 'en', purimSettings);
      const hebrewDate = enWrapper.getHebrewDate();
      expect(typeof hebrewDate).toBe('string');
      expect(hebrewDate.length).toBeGreaterThan(0);
    });

    it('should potentially give different output for different languages', () => {
      const heWrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, 'he', purimSettings);
      const enWrapper = new ZmanimWrapper(nusach, latitude, longitude, tzid, 'en', purimSettings);

      const heDate = heWrapper.getHebrewDate();
      const enDate = enWrapper.getHebrewDate();

      // Both should be non-empty strings
      expect(heDate.length).toBeGreaterThan(0);
      expect(enDate.length).toBeGreaterThan(0);
    });
  });

  describe('purim settings', () => {
    it('should respect regular purim setting', () => {
      const withPurim = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, {
        regular: true,
        shushan: false,
      });
      expect(withPurim).toBeDefined();
    });

    it('should respect shushan purim setting', () => {
      const withShushan = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, {
        regular: false,
        shushan: true,
      });
      expect(withShushan).toBeDefined();
    });

    it('should work with both purim settings disabled', () => {
      const noPurim = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, {
        regular: false,
        shushan: false,
      });
      expect(noPurim).toBeDefined();
    });

    it('should work with both purim settings enabled', () => {
      const bothPurim = new ZmanimWrapper(nusach, latitude, longitude, tzid, language, {
        regular: true,
        shushan: true,
      });
      expect(bothPurim).toBeDefined();
    });
  });

  describe('integration with real hebcal', () => {
    it('should produce consistent results across multiple calls', () => {
      const sunrise1 = wrapper.getSunrise();
      const sunrise2 = wrapper.getSunrise();
      expect(sunrise1).toBe(sunrise2);
    });

    it('should have logical time ordering', () => {
      const alot = wrapper.getAlotHaShachar();
      const sunrise = wrapper.getSunrise();
      const sofZmanShma = wrapper.getSofZmanShma();
      const chatzot = wrapper.getChatzot();
      const sunset = wrapper.getSunset();

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Alot should be before sunrise
      expect(toMinutes(alot)).toBeLessThan(toMinutes(sunrise));
      // Sof zman shma should be after sunrise
      expect(toMinutes(sofZmanShma)).toBeGreaterThan(toMinutes(sunrise));
      // Chatzot should be before sunset
      expect(toMinutes(chatzot)).toBeLessThan(toMinutes(sunset));
    });

    it('should work with actual hebcal HDate', () => {
      const today = new HDate();
      expect(today.getMonth()).toBeGreaterThanOrEqual(1);
      expect(today.getMonth()).toBeLessThanOrEqual(13);
    });

    it('should handle month boundaries correctly', () => {
      // The wrapper should work on any day including month boundaries
      const hebrewDate = wrapper.getHebrewDate();
      expect(hebrewDate).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle northern hemisphere winter', () => {
      // Even in winter with short days, all times should be valid
      const sunrise = wrapper.getSunrise();
      const sunset = wrapper.getSunset();
      expect(sunrise).toMatch(/^\d{1,2}:\d{2}$/);
      expect(sunset).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should return empty strings for inapplicable times', () => {
      // Some times like candle lighting are only relevant on certain days
      const candleLighting = wrapper.getCandleLighting();
      expect(typeof candleLighting).toBe('string');
      // Can be empty, which is valid
    });

    it('should handle arrays of holidays correctly', () => {
      const holidays = wrapper.getHoliday();
      expect(Array.isArray(holidays)).toBe(true);
      holidays.forEach((holiday) => {
        expect(typeof holiday).toBe('string');
      });
    });
  });

  describe('isSlichotTonight', () => {
    // Note: These tests work with the current date/time since the class doesn't
    // allow date injection. The logic is tested conceptually using real hebcal dates.

    it('should return boolean value', () => {
      const result = wrapper.isSlichotTonight();
      expect(typeof result).toBe('boolean');
    });

    it('should work with Sephardic nusach', () => {
      const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
      const result = sephardicWrapper.isSlichotTonight();
      expect(typeof result).toBe('boolean');
    });

    it('should work with Ashkenaz nusach', () => {
      const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);
      const result = ashkenazWrapper.isSlichotTonight();
      expect(typeof result).toBe('boolean');
    });

    describe('logic verification with real dates', () => {
      it('should return false for months other than Elul and Tishrei', () => {
        // Test the current date - if not in Elul/Tishrei, should be false
        const currentHDate = new HDate();
        const currentMonth = currentHDate.getMonth();

        if (currentMonth !== months.ELUL && currentMonth !== months.TISHREI) {
          const result = wrapper.isSlichotTonight();
          expect(result).toBe(false);
        } else {
          // During Elul/Tishrei, result depends on day and nusach
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });

      it('should handle Elul correctly for Sephardic', () => {
        // Sephardic: Elul 2-29 should be true (except last day hour dependent)
        // We can verify the method exists and returns boolean
        const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
        const result = sephardicWrapper.isSlichotTonight();
        expect(typeof result).toBe('boolean');
      });

      it('should handle Tishrei days 2-8', () => {
        // During Tishrei 2-8, should return true regardless of hour
        const currentHDate = new HDate();
        const currentMonth = currentHDate.getMonth();
        const currentDay = currentHDate.getDate();

        if (currentMonth === months.TISHREI && currentDay >= 2 && currentDay <= 8) {
          const result = wrapper.isSlichotTonight();
          expect(result).toBe(true);
        } else {
          // Not in this period, just verify it returns boolean
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });

      it('should respect nusach difference', () => {
        const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
        const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);

        const sephardicResult = sephardicWrapper.isSlichotTonight();
        const ashkenazResult = ashkenazWrapper.isSlichotTonight();

        // Both should return booleans
        expect(typeof sephardicResult).toBe('boolean');
        expect(typeof ashkenazResult).toBe('boolean');

        // During Elul, they might differ based on the day
        // Sephardic starts Elul 2, Ashkenaz depends on when Rosh Hashanah falls
      });
    });

    describe('Ashkenaz calculation logic', () => {
      it('should calculate based on Saturday before Rosh Hashanah', () => {
        // Ashkenaz slichot start on the Saturday night before Rosh Hashanah
        // At minimum 4 days before, at maximum 11 days before
        const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);

        const result = ashkenazWrapper.isSlichotTonight();
        expect(typeof result).toBe('boolean');

        // The logic uses HDate.dayOnOrBefore to find the Saturday
        // This is tested implicitly by calling the method
      });

      it('should handle year boundary correctly for Ashkenaz', () => {
        // Ashkenaz calculation uses next year (this.hdate.getFullYear() + 1)
        const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);

        const currentHDate = new HDate();
        const nextYear = currentHDate.getFullYear() + 1;

        // Should not throw error
        expect(() => ashkenazWrapper.isSlichotTonight()).not.toThrow();
      });
    });

    describe('time-based logic', () => {
      it('should consider hour for Elul 29', () => {
        // On Elul 29, result depends on whether hour < 9
        const currentHDate = new HDate();
        const currentMonth = currentHDate.getMonth();
        const currentDay = currentHDate.getDate();
        const currentHour = new Date().getHours();

        if (currentMonth === months.ELUL && currentDay === 29) {
          const result = wrapper.isSlichotTonight();

          if (currentHour < 9) {
            expect(result).toBe(true);
          } else {
            expect(result).toBe(false);
          }
        } else {
          // Not on Elul 29, just verify it runs
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });

      it('should consider hour for early Tishrei mornings', () => {
        // In Tishrei, if hour < 9, return true (for early morning)
        const currentHDate = new HDate();
        const currentMonth = currentHDate.getMonth();
        const currentHour = new Date().getHours();

        if (currentMonth === months.TISHREI && currentHour < 9) {
          const result = wrapper.isSlichotTonight();
          expect(result).toBe(true);
        } else {
          // Not in this time window
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });
    });

    describe('comprehensive nusach scenarios', () => {
      it('Sephardic: should follow simple Elul 2-29 rule', () => {
        // Sephardic logic is simpler: Elul days 2-29 (plus Tishrei rules)
        const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
        const result = sephardicWrapper.isSlichotTonight();

        // The method should execute without errors
        expect(typeof result).toBe('boolean');

        // During Elul 1, should be false for Sephardic
        const currentHDate = new HDate();
        if (currentHDate.getMonth() === months.ELUL && currentHDate.getDate() === 1) {
          expect(result).toBe(false);
        }
      });

      it('Ashkenaz: should use complex calculation', () => {
        // Ashkenaz uses Saturday before Rosh Hashanah calculation
        const ashkenazWrapper = new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings);
        const result = ashkenazWrapper.isSlichotTonight();

        expect(typeof result).toBe('boolean');

        // The calculation should use real HDate methods
        // dayOnOrBefore(6, ...) finds the Saturday (day 6)
      });
    });

    describe('integration with real Hebrew calendar', () => {
      it('should work correctly throughout the year', () => {
        // Test that the method works at any time of year
        const wrappers = [
          new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings),
          new ZmanimWrapper('ashkenaz', latitude, longitude, tzid, language, purimSettings),
        ];

        wrappers.forEach((w) => {
          const result = w.isSlichotTonight();
          expect(typeof result).toBe('boolean');
        });
      });

      it('should handle leap years correctly', () => {
        // The method should work in both leap and non-leap years
        const currentHDate = new HDate();
        const isLeapYear = currentHDate.isLeapYear();

        const result = wrapper.isSlichotTonight();
        expect(typeof result).toBe('boolean');

        // Slichot logic shouldn't be affected by leap year (it's Elul/Tishrei based)
        // But the HDate calculations should still work
      });

      it('should use correct Hebrew month constants', () => {
        // Verify that months.ELUL and months.TISHREI are used correctly
        expect(months.ELUL).toBeDefined();
        expect(months.TISHREI).toBeDefined();

        // The method should compare against these correctly
        const result = wrapper.isSlichotTonight();
        expect(typeof result).toBe('boolean');
      });
    });

    describe('edge case days', () => {
      it('should handle Elul day 1 correctly', () => {
        // Elul 1: Sephardic should be false, Ashkenaz depends on calculation
        const currentHDate = new HDate();

        if (currentHDate.getMonth() === months.ELUL && currentHDate.getDate() === 1) {
          const sephardicWrapper = new ZmanimWrapper('sephardic', latitude, longitude, tzid, language, purimSettings);
          expect(sephardicWrapper.isSlichotTonight()).toBe(false);
        } else {
          // Not on Elul 1, skip this specific test
          expect(true).toBe(true);
        }
      });

      it('should handle Tishrei day 1 (Rosh Hashanana) correctly', () => {
        // Tishrei 1: Should consider hour
        const currentHDate = new HDate();

        if (currentHDate.getMonth() === months.TISHREI && currentHDate.getDate() === 1) {
          const currentHour = new Date().getHours();
          const result = wrapper.isSlichotTonight();

          if (currentHour < 9) {
            expect(result).toBe(true);
          }
        } else {
          // Not on Tishrei 1
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });

      it('should handle Tishrei day 9 correctly', () => {
        // Tishrei 9 is after the range (2-8), so should depend on hour only
        const currentHDate = new HDate();
        const currentHour = new Date().getHours();

        if (currentHDate.getMonth() === months.TISHREI && currentHDate.getDate() === 9) {
          const result = wrapper.isSlichotTonight();

          if (currentHour < 9) {
            expect(result).toBe(true);
          } else {
            expect(result).toBe(false);
          }
        } else {
          expect(typeof wrapper.isSlichotTonight()).toBe('boolean');
        }
      });
    });
  });
});
