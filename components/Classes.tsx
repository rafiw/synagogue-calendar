import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from 'context/settingsContext';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { defaultPageDisplayTime, isRTL2 } from 'utils/utils';

const classesPerPage = 3.0;
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings) return 0;
  return Math.ceil(localSettings.classes.length / classesPerPage);
}

const Classes: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [PageDisplayTime, setPageDisplayTime] = useState(defaultPageDisplayTime);

  const daysOfWeek = [
    { number: 0, key: 'sunday' },
    { number: 1, key: 'monday' },
    { number: 2, key: 'tuesday' },
    { number: 3, key: 'wednesday' },
    { number: 4, key: 'thursday' },
    { number: 5, key: 'friday' },
    { number: 6, key: 'saturday' },
  ];

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
    const timer = setInterval(async () => {
      const subPages = await getSubPages();
      if (subPages > 0) {
        setCurrentPage((prev) => (prev + 1) % subPages);
      }
    }, PageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentPageData = () => {
    const startIndex = currentPage * classesPerPage;
    return settings.classes.slice(startIndex, startIndex + classesPerPage);
  };
  const header = [
    <Text key="day" className="flex-1 p-4 text-center text-xl font-black text-white uppercase tracking-wide">
      {t('day')}
    </Text>,
    <Text key="time" className="flex-1 p-4 text-center text-xl font-black text-white uppercase tracking-wide">
      {t('time')}
    </Text>,
    <Text key="tutor" className="flex-1 p-4 text-center text-xl font-black text-white uppercase tracking-wide">
      {t('tutor')}
    </Text>,
    <Text key="subject" className="flex-1 p-4 text-center text-xl font-black text-white uppercase tracking-wide">
      {t('subject')}
    </Text>,
  ];
  if (isRTL2(settings.language)) {
    header.reverse();
  }
  return (
    <View>
      {settings.classes.length ? (
        <View className="border-2 border-blue-600 m-10 rounded-xl overflow-hidden shadow-md">
          {/* Header */}
          <View className="flex-row bg-blue-600 border-b-2 border-blue-800">{header}</View>
          {/* Data Rows */}
          {getCurrentPageData().map((shiur, index) => {
            const rowData = [
              <Text key={`${index}_${shiur.day}`} className="flex-1 p-4 text-center text-lg font-bold text-gray-800">
                {getDayNames(shiur.day)}
              </Text>,
              <Text key={`${index}_${shiur.start}`} className="flex-1 p-4 text-center text-lg font-bold text-gray-800">
                {`${shiur.start}-${shiur.end}`}
              </Text>,
              <Text key={`${index}_${shiur.tutor}`} className="flex-1 p-4 text-center text-lg font-bold text-gray-800">
                {shiur.tutor}
              </Text>,
              <Text
                key={`${index}_${shiur.subject}`}
                className="flex-1 p-4 text-center text-lg font-bold text-gray-800"
              >
                {shiur.subject}
              </Text>,
            ];

            if (isRTL2(settings.language)) {
              rowData.reverse();
            }

            return (
              <View key={index} className="flex-row border-b border-gray-200 bg-white">
                {rowData}
              </View>
            );
          })}
        </View>
      ) : (
        <Text>{t('no_classes')}</Text>
      )}
    </View>
  );
};

export default Classes;
