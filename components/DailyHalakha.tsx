import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSettings } from '../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import dailyHalakhaData from '../assets/data/daily_halakha.json';
import { HDate, months, getHolidaysOnDate } from '@hebcal/core';

interface HalakhaItem {
  book_title: string;
  holiday: string;
  sections: string[];
}

const START_DATE = new HDate(1, months.TISHREI, 5786);

const calculateDayNumber = (): number => {
  return new HDate(new Date()).deltaDays(START_DATE);
};

const getHolidayInfo = (
  showHolidayHalachot: boolean,
  isIsrael: boolean = false,
): { type: string | null; dayNumber: number } => {
  if (!showHolidayHalachot) {
    return { type: null, dayNumber: 0 };
  }

  const today = new HDate(new Date());
  const month = today.getMonth();
  const day = today.getDate();
  const year = today.getFullYear();

  // Check if today is a Jewish holiday
  const holidays = getHolidaysOnDate(today, isIsrael);
  const isHoliday = holidays && holidays.length > 0;

  // 36 days before 22 Nissan (Pesach)
  // Calculate 22 Nissan of current year
  const pesach22 = new HDate(22, months.NISAN, year);
  const daysBeforePesach = today.deltaDays(pesach22);
  if (daysBeforePesach >= -36 && daysBeforePesach <= 0) {
    // Day 1 is 36 days before Pesach, day 37 is Pesach itself (22 Nisan)
    const pesachDayNumber = 36 + daysBeforePesach + 1;
    return { type: 'Pesach', dayNumber: pesachDayNumber };
  }

  if (month === months.ELUL || (month === months.TISHREI && day <= 2)) {
    return { type: 'Rosh-Hashana', dayNumber: day };
  }

  if (month === months.TISHREI && day > 10 && day <= 23) {
    return { type: 'Sukkot', dayNumber: day - 10 };
  }

  if (isHoliday) {
    // not the best but will work for now
    const holidayDayNumber = day;
    return { type: 'Generic', dayNumber: holidayDayNumber };
  }
  return { type: null, dayNumber: 0 };
};

const DailyHalakha: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const heightScale = useHeightScale();

  // Responsive sizes
  const textSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(12) * heightScale);
  const margin = Math.round(useResponsiveSpacing(4) * heightScale);
  const itemPadding = Math.round(useResponsiveSpacing(8) * heightScale);

  const backgroundColor = 'bg-white/40';
  const textColor = 'text-gray-800';
  const isIsrael = settings.zmanimSettings?.il || true;
  const showHolidayHalachot = settings.dailyHalakhaSettings?.showRelatedHolidaysHalachot || false;
  const holidayInfo = getHolidayInfo(showHolidayHalachot, isIsrael);
  const holidayType = holidayInfo.type;

  useEffect(() => {
    const loadItems = () => {
      try {
        const selectedBooks = settings.dailyHalakhaSettings?.selectedBooks || [];

        // Filter items by selected books and merge sections
        // Note: When in holiday period, always include holiday sections regardless of book selection
        const allSections: string[] = [];

        // If we're in a holiday period, always include holiday sections (ignore book selection)
        if (holidayType !== null) {
          (dailyHalakhaData as HalakhaItem[]).forEach((item) => {
            // Show only sections matching the holiday type, regardless of selected books
            if (item.holiday === holidayType) {
              item.sections.forEach((section) => {
                if (section.trim()) {
                  allSections.push(section);
                }
              });
            }
          });
        } else {
          // Regular mode: require book selection and show only non-holiday sections
          if (selectedBooks.length === 0) {
            setItems([]);
            setLoading(false);
            return;
          }
          (dailyHalakhaData as HalakhaItem[]).forEach((item) => {
            if (selectedBooks.includes(item.book_title)) {
              if (!item.holiday || item.holiday === '') {
                item.sections.forEach((section) => {
                  if (section.trim()) {
                    allSections.push(section);
                  }
                });
              }
            }
          });
        }

        setItems(allSections);
        setItems(allSections);
      } catch (error) {
        console.error('Error loading daily halakha:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [settings.dailyHalakhaSettings?.selectedBooks, showHolidayHalachot, holidayType, isIsrael]);

  if (!i18n.isInitialized || loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // During holiday periods, show items sequentially based on day number
  let todayItems: string[] = [];
  const itemsPerDay = settings.dailyHalakhaSettings?.halakhaItemsPerDay || 3;
  if (holidayType !== null) {
    // Calculate which items to show based on the day number in the holiday period
    // Day 1 shows items 0-1, Day 2 shows items 2-3, etc.
    const startIndex = (holidayInfo.dayNumber - 1) * itemsPerDay;
    todayItems = items.slice(startIndex, startIndex + itemsPerDay);
  } else {
    // Regular mode: use day-based indexing
    const dayNumber = calculateDayNumber();
    const startIndex = (dayNumber - 1) * itemsPerDay;
    todayItems = items.slice(startIndex, startIndex + itemsPerDay);
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ padding }}>
        <Text className={`${textColor} text-center`} style={{ fontSize: textSize }}>
          {t('daily_halakha_no_books_selected')}
        </Text>
      </View>
    );
  }

  if (todayItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ padding }}>
        <Text className={`${textColor} text-center`} style={{ fontSize: textSize }}>
          {t('daily_halakha_no_items_today')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ padding: padding / 2 }}>
      <View className="flex-1" style={{ padding: itemPadding }}>
        {todayItems.map((item, index) => (
          <View
            key={index}
            className={`${backgroundColor} rounded-2xl shadow-lg border border-gray-200`}
            style={{ padding, marginBottom: margin, marginTop: margin }}
          >
            <Text className={`${textColor} text-center`} style={{ fontSize: textSize, lineHeight: textSize * 1.5 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DailyHalakha;
