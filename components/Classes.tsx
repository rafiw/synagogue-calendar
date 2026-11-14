import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@context/settingsContext';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { daysOfWeek } from '@utils/classesHelpers';
import { Class, Settings } from '@utils/defs';
import { defaultPageDisplayTime, isRTL2, safeJsonParse } from '@utils/utils';
import { CARD_SUBSURFACE_CLASS, TEXT_SHADOW_STYLE } from '@utils/surfaceStyles';
import {
  useEffectiveDimensions,
  useResponsiveFontSize,
  useResponsiveSpacing,
  useHeightScale,
  useResponsiveIconSize,
} from '@utils/responsive';

const classesPerPage = 3.0;
export async function getSubPages(): Promise<number> {
  try {
    const localSettingsString = await AsyncStorage.getItem('settings');
    const localSettings = safeJsonParse<Settings | null>(localSettingsString, null);
    if (!Array.isArray(localSettings?.classesSettings?.classes)) return 1;
    return Math.max(1, Math.ceil(localSettings.classesSettings.classes.length / classesPerPage));
  } catch {
    return 1;
  }
}

const Classes: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const pageDisplayTime = settings.classesSettings?.screenDisplayTime || defaultPageDisplayTime;

  const { width } = useEffectiveDimensions(settings.synagogueSettings.screenOrientation);
  const baseHeightScale = useHeightScale();
  const baseTitleFont = useResponsiveFontSize('headingLarge');
  const baseHeaderFont = useResponsiveFontSize('headingMedium');
  const baseTextFont = useResponsiveFontSize('bodyLarge');
  const baseIconSize = useResponsiveIconSize('small');
  const basePadding = useResponsiveSpacing(16);
  const baseMargin = useResponsiveSpacing(40);

  const startIndex = currentPage * classesPerPage;
  const currentPageClasses = settings.classesSettings.classes.slice(startIndex, startIndex + classesPerPage);
  const rowsOnPage = Math.max(1, currentPageClasses.length);

  const hasLocation = settings.classesSettings.classes.some(
    (c) => c?.location && typeof c.location === 'string' && c.location.trim() !== '',
  );
  const numCols = hasLocation ? 5 : 4;

  const heightScale = useMemo(() => {
    if (availableHeight > 100) {
      // Unit height at scale = 1.0:
      // Title badge + margin + table header + rowsOnPage * data row (assume ~1.8 lines per cell) + table margins
      const titleUnit = baseTitleFont * 1.4 + basePadding * 0.5 + baseMargin * 0.25;
      const headerUnit = baseHeaderFont * 1.4 + basePadding * 2;
      const rowsUnit = rowsOnPage * (baseTextFont * 2.2 + basePadding * 2);
      const unitHeight = titleUnit + headerUnit + rowsUnit + baseMargin * 1.2;

      const maxHorizScale = width / numCols / (baseTextFont * 9);
      return Math.min(maxHorizScale, baseHeightScale * 1.4, Math.max(0.5, (availableHeight * 0.92) / unitHeight));
    }
    return baseHeightScale;
  }, [
    availableHeight,
    baseTitleFont,
    baseHeaderFont,
    baseTextFont,
    basePadding,
    baseMargin,
    rowsOnPage,
    width,
    numCols,
    baseHeightScale,
  ]);

  // Responsive sizes
  const titleSize = Math.round(baseTitleFont * heightScale);
  const headerSize = Math.round(baseHeaderFont * heightScale);
  const textSize = Math.round(baseTextFont * heightScale);
  const iconSize = Math.round(baseIconSize * heightScale);
  const padding = Math.round(basePadding * heightScale);
  const margin = Math.round(baseMargin * heightScale * 0.6);

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
    }, pageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, [pageDisplayTime]);

  const getCurrentPageData = () => currentPageClasses;

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

  if (hasLocation) {
    header.push(
      <Text
        key="location"
        className="flex-1 text-center font-black text-white uppercase tracking-wide"
        style={{ fontSize: headerSize, padding }}
      >
        {t('location')}
      </Text>,
    );
  }

  if (isRTL2(settings.synagogueSettings.language)) {
    header.reverse();
  }
  return (
    <View
      className="flex-1 justify-center"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && Math.abs(h - availableHeight) > 2) {
          setAvailableHeight(h);
        }
      }}
    >
      {settings.classesSettings.classes.length ? (
        <View className="flex-1 justify-center">
          {/* Title Header */}
          <View
            className="flex-row items-center justify-center"
            style={{ marginBottom: margin / 3, marginHorizontal: margin }}
          >
            <View
              className={`flex-row items-center ${CARD_SUBSURFACE_CLASS} rounded-xl shadow-lg`}
              style={{ paddingHorizontal: padding / 2, paddingVertical: padding / 4 }}
            >
              <Ionicons name="book" size={iconSize} color="#3b82f6" />
              <Text
                className="font-extrabold text-gray-900"
                style={[{ fontSize: titleSize, marginLeft: padding / 4 }, TEXT_SHADOW_STYLE]}
              >
                {t('classes_title')}
              </Text>
            </View>
          </View>

          <View
            className="border-2 border-grey-600/50 rounded-xl overflow-hidden shadow-md"
            style={{ marginHorizontal: margin }}
          >
            {/* Header */}
            <View className="flex-row bg-gray-600/70 border-b-2 border-gray-800/50">{header}</View>
            {/* Data Rows */}
            {getCurrentPageData().map((classItem: Class, index: number) => {
              const rowData = [
                <Text
                  key={`${classItem.id}_day`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={[{ fontSize: textSize, padding }, TEXT_SHADOW_STYLE]}
                >
                  {getDayNames(classItem?.day || [])}
                </Text>,
                <Text
                  key={`${classItem.id}_time`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={[{ fontSize: textSize, padding }, TEXT_SHADOW_STYLE]}
                >
                  {isRTL2(settings.synagogueSettings.language)
                    ? `${classItem.end || ''}-${classItem.start || ''}`
                    : `${classItem.start || ''}-${classItem.end || ''}`}
                </Text>,
                <Text
                  key={`${classItem.id}_tutor`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={[{ fontSize: textSize, padding }, TEXT_SHADOW_STYLE]}
                >
                  {classItem.tutor}
                </Text>,
                <Text
                  key={`${classItem.id}_subject`}
                  className="flex-1 text-center font-bold text-gray-900"
                  style={[{ fontSize: textSize, padding }, TEXT_SHADOW_STYLE]}
                >
                  {classItem.subject}
                </Text>,
              ];

              if (hasLocation) {
                rowData.push(
                  <Text
                    key={`${classItem.id}_location`}
                    className="flex-1 text-center font-bold text-gray-900"
                    style={[{ fontSize: textSize, padding }, TEXT_SHADOW_STYLE]}
                  >
                    {classItem?.location || ''}
                  </Text>,
                );
              }

              if (isRTL2(settings.synagogueSettings.language)) {
                rowData.reverse();
              }

              return (
                <View
                  key={classItem.id || `class_${index}`}
                  className={`flex-row border-b border-gray-200/50 ${CARD_SUBSURFACE_CLASS}`}
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
