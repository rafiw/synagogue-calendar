import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from 'context/settingsContext';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { daysOfWeek } from 'utils/classesHelpers';
import { Shiur } from 'utils/defs';
import { defaultPageDisplayTime, isRTL2 } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveSpacing } from 'utils/responsive';

const classesPerPage = 3.0;
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings) return 0;
  return Math.ceil(localSettings.classes.length / classesPerPage);
}

const Classes: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [PageDisplayTime] = useState(defaultPageDisplayTime);

  // Responsive sizes
  const headerSize = useResponsiveFontSize('headingMedium');
  const textSize = useResponsiveFontSize('bodyLarge');
  const padding = useResponsiveSpacing(16);
  const margin = useResponsiveSpacing(40);

  const getDayNames = (dayNumbers: number[]): string => {
    return dayNumbers
      .map((num) => {
        const day = daysOfWeek.find((d) => d.number === num);
        return day ? t(day.key) : '';
      })
      .filter((name) => name !== '')
      .join(', ');
  };
  useEffect(() => {
    const timer = setInterval(() => {
      getSubPages().then((subPages) => {
        if (subPages > 0) {
          setCurrentPage((prev) => (prev + 1) % subPages);
        }
      });
    }, PageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentPageData = () => {
    const startIndex = currentPage * classesPerPage;
    return settings.classes.slice(startIndex, startIndex + classesPerPage);
  };
  const header = [
    <Text
      key="day"
      className="flex-1 text-center font-black text-white uppercase tracking-wide"
      style={{ fontSize: headerSize, padding }}
    >
      {t('day')}
    </Text>,
    <Text
      key="time"
      className="flex-1 text-center font-black text-white uppercase tracking-wide"
      style={{ fontSize: headerSize, padding }}
    >
      {t('time')}
    </Text>,
    <Text
      key="tutor"
      className="flex-1 text-center font-black text-white uppercase tracking-wide"
      style={{ fontSize: headerSize, padding }}
    >
      {t('tutor')}
    </Text>,
    <Text
      key="subject"
      className="flex-1 text-center font-black text-white uppercase tracking-wide"
      style={{ fontSize: headerSize, padding }}
    >
      {t('subject')}
    </Text>,
  ];
  if (isRTL2(settings.language)) {
    header.reverse();
  }
  return (
    <View>
      {settings.classes.length ? (
        <View className="border-2 border-grey-600/50 rounded-xl overflow-hidden shadow-md" style={{ margin }}>
          {/* Header */}
          <View className="flex-row bg-gray-600/70 border-b-2 border-gray-800/50">{header}</View>
          {/* Data Rows */}
          {getCurrentPageData().map((shiur: Shiur, index: number) => {
            const rowData = [
              <Text
                key={`${shiur.id}_day`}
                className="flex-1 text-center font-bold text-gray-900"
                style={{ fontSize: textSize, padding }}
              >
                {getDayNames(shiur.day)}
              </Text>,
              <Text
                key={`${shiur.id}_time`}
                className="flex-1 text-center font-bold text-gray-900"
                style={{ fontSize: textSize, padding }}
              >
                {`${shiur.start}-${shiur.end}`}
              </Text>,
              <Text
                key={`${shiur.id}_tutor`}
                className="flex-1 text-center font-bold text-gray-900"
                style={{ fontSize: textSize, padding }}
              >
                {shiur.tutor}
              </Text>,
              <Text
                key={`${shiur.id}_subject`}
                className="flex-1 text-center font-bold text-gray-900"
                style={{ fontSize: textSize, padding }}
              >
                {shiur.subject}
              </Text>,
            ];

            if (isRTL2(settings.language)) {
              rowData.reverse();
            }

            return (
              <View key={shiur.id || `class_${index}`} className="flex-row border-b border-gray-200/50 bg-white/50">
                {rowData}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ fontSize: textSize }}>{t('no_classes')}</Text>
      )}
    </View>
  );
};

export default Classes;
