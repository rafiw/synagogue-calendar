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
  const [availableHeight, setAvailableHeight] = useState(0);
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

  // Dynamically calculate heightScale from the actual measured container height so that prayer
  // schedule columns and fonts fill the available vertical room without overflowing.
  const baseMainTitleFont = useResponsiveFontSize('displayMedium');
  const baseItemFont = useResponsiveFontSize('headingMedium');
  const basePadding = useResponsiveSpacing(12);
  const baseMargin = useResponsiveSpacing(4);
  const baseItemPadding = useResponsiveSpacing(6);

  const activePrayersCount = displayedColumns.reduce((max, col) => Math.max(max, col.prayers.length), 0);
  const stackedPrayersCount = displayedColumns.reduce((sum, col) => sum + col.prayers.length, 0);

  const heightScale = useMemo(() => {
    if (availableHeight > 100 && displayedColumns.length > 0) {
      const isStacked = (isSmallHeight || shouldPaginate) && displayedColumns.length > 1;
      const numCardsVertically = isStacked ? displayedColumns.length : 1;
      const totalVerticalRows = isStacked ? stackedPrayersCount : Math.max(1, activePrayersCount);

      // Unit height at scale = 1.0:
      // Container padding + main title + indicator + card padding/title + rows * (text + itemPadding + margin)
      const mainTitleUnit = baseMainTitleFont * 0.9 * 1.3 + basePadding + (shouldPaginate && totalPages > 1 ? 14 : 0);
      const cardsChromeUnit = numCardsVertically * (basePadding * 3 + baseMargin * 2 + baseMainTitleFont * 0.8 * 1.3);
      const rowsUnit = totalVerticalRows * (baseItemFont * 1.35 + baseItemPadding * 2 + baseMargin + 4);
      const unitHeight = baseItemPadding * 2 + mainTitleUnit + cardsChromeUnit + rowsUnit;

      const colCountHoriz = isSmallHeight || shouldPaginate ? 1 : Math.max(1, displayedColumns.length);
      const maxHorizScale = (width / colCountHoriz) / (baseItemFont * 16);
      const maxScaleCap = Math.min(maxHorizScale, baseHeightScale * 1.35);

      return Math.min(maxScaleCap, Math.max(0.45, (availableHeight * 0.94) / unitHeight));
    }

    const scaleAdjustment = activePrayersCount > 7 ? Math.max(0.65, 7 / activePrayersCount) : 1.0;
    return baseHeightScale * scaleAdjustment;
  }, [
    availableHeight,
    displayedColumns.length,
    isSmallHeight,
    shouldPaginate,
    stackedPrayersCount,
    activePrayersCount,
    baseMainTitleFont,
    baseItemFont,
    basePadding,
    baseMargin,
    baseItemPadding,
    totalPages,
    width,
    baseHeightScale,
  ]);

  // Responsive sizes
  const mainTitleSize = Math.round(baseMainTitleFont * heightScale) * 0.9;
  const titleSize = Math.round(baseMainTitleFont * heightScale) * 0.8;
  const textSize = Math.round(baseItemFont * heightScale);
  const padding = Math.round(basePadding * heightScale);
  const margin = Math.round(baseMargin * heightScale);
  const emptyTextSize = Math.round(baseItemFont * heightScale);
  const itemPadding = Math.round(baseItemPadding * heightScale);

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
    <View
      className="flex-1"
      style={{ padding: itemPadding }}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && Math.abs(h - availableHeight) > 2) {
          setAvailableHeight(h);
        }
      }}
    >
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
        className={`flex-1 ${isSmallHeight || shouldPaginate ? 'flex-col' : 'flex-row flex-wrap'} justify-center items-stretch`}
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
