import { useSettings } from '@context/settingsContext';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { defaultPageDisplayTime, isRTL } from '@utils/utils';
import {
  isPortraitLayout,
  useEffectiveDimensions,
  useResponsiveFontSize,
  useResponsiveSpacing,
  useHeightScale,
} from '@utils/responsive';
import { calculateScheduleSubPages, getPrayerDisplayTime } from '@utils/scheduleHelpers';

const Schedule: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const { width, height } = useEffectiveDimensions(settings.synagogueSettings.screenOrientation);
  const [rtl, setRtl] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const baseHeightScale = useHeightScale();
  const isSmallHeight = isPortraitLayout(settings.synagogueSettings.screenOrientation, width, height);

  const { shouldPaginate, totalPages, columnsWithPrayers } = useMemo(
    () => calculateScheduleSubPages(settings.scheduleSettings?.columns, isSmallHeight),
    [settings.scheduleSettings?.columns, isSmallHeight],
  );

  const displayedColumns = useMemo(() => {
    if (!shouldPaginate || columnsWithPrayers.length <= 1) {
      return columnsWithPrayers;
    }
    const safeIndex = currentPage % columnsWithPrayers.length;
    const col = columnsWithPrayers[safeIndex];
    return col ? [col] : columnsWithPrayers.slice(0, 1);
  }, [columnsWithPrayers, currentPage, shouldPaginate]);

  const pageDisplayTime = settings.scheduleSettings?.screenDisplayTime || defaultPageDisplayTime;

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!shouldPaginate || totalPages <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, pageDisplayTime * 1000);

    return () => clearInterval(timer);
  }, [pageDisplayTime, shouldPaginate, totalPages]);

  // Auto-scale down if the currently displayed column has many prayers
  const activePrayersCount = displayedColumns.reduce((max, col) => Math.max(max, col.prayers.length), 0);
  const scaleAdjustment = activePrayersCount > 7 ? Math.max(0.65, 7 / activePrayersCount) : 1.0;
  const heightScale = baseHeightScale * scaleAdjustment;

  // Responsive sizes
  const mainTitleSize = Math.round(useResponsiveFontSize('displayMedium') * heightScale) * 0.9;
  const titleSize = Math.round(useResponsiveFontSize('displayMedium') * heightScale) * 0.8;
  const textSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(12) * heightScale);
  const margin = Math.round(useResponsiveSpacing(4) * heightScale);
  const emptyTextSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const itemPadding = Math.round(useResponsiveSpacing(6) * heightScale);

  const backgroundColor = 'bg-white/40';
  const headLineColor = 'text-gray-900';
  const textColor = 'text-gray-900';

  const InfoGroup = ({
    title,
    items,
    rtl,
  }: {
    title: string;
    items: { name: string; time: string }[];
    rtl: boolean;
  }) => (
    <View
      className={`${backgroundColor} rounded-2xl ${isSmallHeight || shouldPaginate ? 'w-full' : 'flex-1'} shadow-lg border border-gray-200`}
      style={{ padding, margin }}
    >
      <Text
        className={`font-extrabold ${headLineColor} text-center`}
        style={{ fontSize: titleSize, marginBottom: padding }}
      >
        {title}
      </Text>
      {items.length === 0 ? (
        <Text className={`text-gray-500 text-center`} style={{ fontSize: emptyTextSize, paddingVertical: itemPadding }}>
          {t('schedule_no_prayers')}
        </Text>
      ) : (
        <View className="space-y-2 border-gray-200">
          {items.map((item, index) => (
            <View
              key={index}
              className="bg-white/60 rounded-xl shadow-sm border border-gray-500"
              style={{ paddingHorizontal: itemPadding, paddingVertical: itemPadding, marginBottom: margin }}
            >
              <View className={`flex-row justify-center gap-4 ${rtl ? 'space-x-reverse' : ''}`}>
                <Text className={`${textColor} font-bold`} style={{ fontSize: textSize }}>
                  {item.name}
                </Text>
                <Text className={`${textColor} font-extrabold`} style={{ fontSize: textSize }}>
                  -
                </Text>
                <Text className={`${textColor} font-extrabold`} style={{ fontSize: textSize }}>
                  {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  if (!i18n.isInitialized)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );

  return (
    <View className="flex-1" style={{ padding: itemPadding }}>
      {/* Headline */}
      {columnsWithPrayers.length > 0 && (
        <View style={{ marginBottom: padding }}>
          <Text className={`${headLineColor} font-extrabold text-center`} style={{ fontSize: mainTitleSize }}>
            {t('schedule_title')}
          </Text>
          {/* Page Indicators when cycling through columns */}
          {shouldPaginate && totalPages > 1 && (
            <View className="flex-row justify-center space-x-2" style={{ marginTop: margin }}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${index === currentPage ? 'w-8 bg-blue-500' : 'w-2 bg-gray-400'}`}
                />
              ))}
            </View>
          )}
        </View>
      )}
      {/* Row(s) for columns */}
      <View
        className={`${isSmallHeight || shouldPaginate ? 'flex-col' : 'flex-row flex-wrap'} justify-center items-start`}
      >
        {displayedColumns.map((column) => (
          <InfoGroup
            key={column.id}
            title={column.title}
            items={column.prayers.map((p) => ({ name: p.name, time: getPrayerDisplayTime(p, settings) }))}
            rtl={rtl}
          />
        ))}
      </View>
      {columnsWithPrayers.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-center" style={{ fontSize: mainTitleSize }}>
            {t('schedule_no_prayers')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Schedule;
