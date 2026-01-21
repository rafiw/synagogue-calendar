import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { daysOfWeek } from 'utils/classesHelpers';
import { Class } from 'utils/defs';
import { defaultPageDisplayTime, isRTL2 } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale, useResponsiveIconSize } from 'utils/responsive';

const classesPerPage = 3.0;
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings?.classesSettings?.classes) return 0;
  return Math.ceil(localSettings.classesSettings.classes.length / classesPerPage);
}

const Classes: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [PageDisplayTime] = useState(defaultPageDisplayTime);

  const heightScale = useHeightScale();

  // Responsive sizes
  const titleSize = Math.round(useResponsiveFontSize('headingLarge') * heightScale);
  const headerSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('small') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const margin = Math.round(useResponsiveSpacing(40) * heightScale);

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
    return settings.classesSettings.classes.slice(startIndex, startIndex + classesPerPage);
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
  if (isRTL2(settings.synagogueSettings.language)) {
    header.reverse();
  }
  return (
    <View>
      {settings.classesSettings.classes.length ? (
        <View>
          {/* Title Header */}
          <View
            className="flex-row items-center justify-center"
            style={{ marginBottom: margin / 4, marginHorizontal: margin }}
          >
            <View
              className="flex-row items-center bg-white/55 rounded-xl shadow-lg"
              style={{ paddingHorizontal: padding / 2, paddingVertical: padding / 4 }}
            >
              <Ionicons name="book" size={iconSize} color="#3b82f6" />
              <Text className="font-bold text-gray-800" style={{ fontSize: titleSize, marginLeft: padding / 4 }}>
                {t('classes_title')}
              </Text>
            </View>
          </View>

          <View className="border-2 border-grey-600/50 rounded-xl overflow-hidden shadow-md" style={{ margin }}>
            {/* Header */}
            <View className="flex-row bg-gray-600/70 border-b-2 border-gray-800/50">{header}</View>
            {/* Data Rows */}
            {getCurrentPageData().map((classItem: Class, index: number) => {
              const rowData = [
                <Text
                  key={`${classItem.id}_day`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={{ fontSize: textSize, padding }}
                >
                  {getDayNames(classItem.day)}
                </Text>,
                <Text
                  key={`${classItem.id}_time`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={{ fontSize: textSize, padding }}
                >
                  {isRTL2(settings.synagogueSettings.language)
                    ? `${classItem.end}-${classItem.start}`
                    : `${classItem.start}-${classItem.end}`}
                </Text>,
                <Text
                  key={`${classItem.id}_tutor`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={{ fontSize: textSize, padding }}
                >
                  {classItem.tutor}
                </Text>,
                <Text
                  key={`${classItem.id}_subject`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={{ fontSize: textSize, padding }}
                >
                  {classItem.subject}
                </Text>,
              ];

              if (isRTL2(settings.synagogueSettings.language)) {
                rowData.reverse();
              }

              return (
                <View
                  key={classItem.id || `class_${index}`}
                  className="flex-row border-b border-gray-200/50 bg-white/50"
                >
                  {rowData}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={{ fontSize: textSize }}>{t('no_classes')}</Text>
      )}
    </View>
  );
};

export default Classes;
