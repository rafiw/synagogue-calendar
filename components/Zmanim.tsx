import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { FastDayType, HallelType, ZmanimWrapper } from '@utils/zmanim_wrapper';
import { useSettings } from '@context/settingsContext';
import { useTranslation } from 'react-i18next';
import { isRTL } from '@utils/utils';
import {
  isPortraitLayout,
  useEffectiveDimensions,
  useResponsiveFontSize,
  useResponsiveSpacing,
  useHeightScale,
} from '@utils/responsive';

const getTachanunLabel = (
  haveTachanunShacharit: boolean,
  haveTachanunMincha: boolean,
  all: boolean,
  isShabbat: boolean,
): string => {
  if (all) {
    return '';
  }
  if (!haveTachanunShacharit && !haveTachanunMincha) {
    if (isShabbat) {
      // default no need to show anything
      return 'no_tachanun_in_mincha_shabat';
    }
    return 'no_tachanun';
  }
  if (!haveTachanunShacharit) {
    return 'no_tachanun_in_shacharit';
  }
  if (!haveTachanunMincha) {
    return 'no_tachanun_in_mincha';
  }
  return '';
};

const Zmanim: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { width, height } = useEffectiveDimensions(settings.synagogueSettings.screenOrientation);
  const isSmallWidth = isPortraitLayout(settings.synagogueSettings.screenOrientation, width, height);

  const [rtl, setRtl] = useState(false);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [timeTick, setTimeTick] = useState(() => Math.floor(Date.now() / 60000));

  useEffect(() => {
    const refreshTick = () => {
      setTimeTick(Math.floor(Date.now() / 60000));
    };

    refreshTick();
    const interval = setInterval(refreshTick, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const zmanim = useMemo(
    () =>
      new ZmanimWrapper(
        settings.synagogueSettings.nusach,
        settings.zmanimSettings.latitude,
        settings.zmanimSettings.longitude,
        settings.zmanimSettings.olson,
        settings.synagogueSettings.language,
        settings.zmanimSettings.purimSettings,
        settings.zmanimSettings.elevation,
        settings.zmanimSettings.candleLightingMins,
        settings.zmanimSettings.city,
      ),
    [
      settings.synagogueSettings.nusach,
      settings.synagogueSettings.language,
      settings.zmanimSettings.latitude,
      settings.zmanimSettings.longitude,
      settings.zmanimSettings.olson,
      settings.zmanimSettings.purimSettings,
      settings.zmanimSettings.elevation,
      settings.zmanimSettings.candleLightingMins,
      settings.zmanimSettings.city,
      timeTick,
    ],
  );
  const computedZmanim = useMemo(() => {
    if (!i18n.isInitialized) {
      return null;
    }

    const dow = zmanim.getDOW();
    const isShabbat = dow === 6;
    const isFriday = dow === 5;
    const hallelType = zmanim.getHallel();
    const tachanun = zmanim.getTachanun();
    const haveTachanun =
      hallelType === HallelType.NO_HALLEL || !isShabbat
        ? getTachanunLabel(tachanun?.shacharit, tachanun?.mincha, tachanun?.allCongs, isShabbat)
        : '';
    const fastDay = zmanim.isFastDay();

    return {
      dow,
      hallelType,
      haveTachanun,
      fastDay,
      haveCandleLighting: isFriday || isShabbat || zmanim.isHolidayCandleLighting(),
      parsha: zmanim.getParsha(),
      holidays: zmanim.getHoliday(),
      hftara: zmanim.getHftara(),
      megilla: zmanim.getMegilla(),
      haveAlHanisim: zmanim.haveAlHanisim(),
      haveYaaleVeyavo: zmanim.haveYaaleVeyavo(),
      molad: zmanim.getMolad(),
      chametz: zmanim.getSofChametzTimes(),
      omer: zmanim.getOmer(),
      avotChapter: dow >= 5 ? zmanim.getAvotChapter() : '',
      isMoridHatal: zmanim.isMoridHatal(),
      isVetenBracha: zmanim.isVetenBracha(),
      isSlichotTonight: zmanim.isSlichotTonight(),
      times: {
        alotHaShachar: zmanim.getAlotHaShachar(),
        misheyakir: zmanim.getMisheyakir(),
        netz: zmanim.getNetz(),
        sofZmanShma: zmanim.getSofZmanShma(),
        sofZmanShmaMGA: zmanim.getsofZmanShmaMGA(),
        sofZmanTfilla: zmanim.getsofZmanTfilla(),
        sofZmanTfillaMGA: zmanim.getsofZmanTfillaMGA(),
        chatzot: zmanim.getChatzot(),
        minchaGdola: zmanim.getMinchaGdola(),
        minchaKtana: zmanim.getMinchaKtana(),
        plag: zmanim.getPlag(),
        sunset: zmanim.getSunset(),
        tzeit: zmanim.gettzeit(),
        candleLighting: zmanim.getCandleLighting(),
        havdala: zmanim.getHavdala(),
        havdalaRT: zmanim.getHavdalaRT(),
        minorFastEnd: zmanim.getMinorFastEnd(),
        majorFastEnd: zmanim.getMajorFastEnd(),
      },
    };
  }, [i18n.isInitialized, zmanim]);
  const backgroundColor = 'bg-white/30';
  const headLineColor = 'text-gray-900';
  const textColor = 'text-gray-900';
  const dailyInfoItems = useMemo(() => {
    if (!computedZmanim) {
      return [];
    }

    return [
      ...(computedZmanim.parsha ? [{ text: t('parasha', { date: computedZmanim.parsha }) }] : []),
      ...(computedZmanim.holidays?.length
        ? [
            {
              text: computedZmanim.holidays.map((holiday) => t('holiday', { date: holiday })).join(' - '),
            },
          ]
        : []),
      ...(computedZmanim.fastDay === FastDayType.MINOR_FAST
        ? [
            { text: t('fast_start', { date: computedZmanim.times.alotHaShachar }) },
            { text: t('fast_end', { date: computedZmanim.times.minorFastEnd }) },
          ]
        : []),
      ...(computedZmanim.fastDay === FastDayType.MAJOR_FAST
        ? [
            { text: t('fast_start', { date: computedZmanim.times.sunset }) },
            { text: t('fast_end', { date: computedZmanim.times.majorFastEnd }) },
          ]
        : []),
      ...(computedZmanim.haveCandleLighting
        ? [
            { text: t('light_candle', { date: computedZmanim.times.candleLighting }) },
            { text: t('havdala', { date: computedZmanim.times.havdala, date2: computedZmanim.times.havdalaRT }) },
          ]
        : []),
      ...(computedZmanim.hftara ? [{ text: t('hftara', { date: computedZmanim.hftara }) }] : []),
      ...(computedZmanim.megilla ? [{ text: t('megilla', { date: computedZmanim.megilla }) }] : []),
      ...(computedZmanim.haveAlHanisim ? [{ text: t('al_hanisim') }] : []),
      ...(computedZmanim.haveYaaleVeyavo ? [{ text: t('yaale_veyavo') }] : []),
      ...(computedZmanim.molad ? [{ text: t('molad', { date: computedZmanim.molad }) }] : []),
      ...(computedZmanim.omer ? [{ text: t('omer', { date: computedZmanim.omer }) }] : []),
      ...(computedZmanim.avotChapter ? [{ text: computedZmanim.avotChapter }] : []),
      ...(computedZmanim.isMoridHatal ? [{ text: t('morid_hatal') }] : [{ text: t('mashiv_haruach') }]),
      ...(computedZmanim.isVetenBracha ? [{ text: t('veten_bracha') }] : [{ text: t('tal_umatar') }]),
      ...(computedZmanim.hallelType === HallelType.WHOLE_HALLEL ? [{ text: t('whole_hallel') }] : []),
      ...(computedZmanim.hallelType === HallelType.HALF_HALLEL ? [{ text: t('half_hallel') }] : []),
      ...(computedZmanim.haveTachanun ? [{ text: t(computedZmanim.haveTachanun) }] : []),
      ...(computedZmanim.isSlichotTonight ? [{ text: t('slichot') }] : []),
      ...(computedZmanim.chametz ? [{ text: t('chametz', { text: computedZmanim.chametz }) }] : []),
    ];
  }, [computedZmanim, t]);
  const dayTimeItems = useMemo(() => {
    if (!computedZmanim) {
      return [];
    }

    return [
      { text: t('shachar', { date: computedZmanim.times.alotHaShachar }) },
      { text: t('mishayakir', { date: computedZmanim.times.misheyakir }) },
      { text: t('netz', { date: computedZmanim.times.netz }) },
      null,
      { text: t('eo_shma', { date: computedZmanim.times.sofZmanShma }) },
      { text: t('eo_shma_gra', { date: computedZmanim.times.sofZmanShmaMGA }) },
      { text: t('eo_tfila', { date: computedZmanim.times.sofZmanTfilla }) },
      { text: t('eo_tfila_gra', { date: computedZmanim.times.sofZmanTfillaMGA }) },
      { text: t('chatzot', { date: computedZmanim.times.chatzot }) },
      { text: t('mincha_gdola', { date: computedZmanim.times.minchaGdola }) },
      { text: t('mincha_ktana', { date: computedZmanim.times.minchaKtana }) },
      { text: t('plag_mincha', { date: computedZmanim.times.plag }) },
      { text: t('sunset', { date: computedZmanim.times.sunset }) },
      { text: t('stars', { date: computedZmanim.times.tzeit }) },
    ];
  }, [computedZmanim, t]);

  // Dynamically calculate heightScale from the actual measured container height (or fallback to useHeightScale)
  // so that cards and fonts fill the available vertical room without clipping or leaving empty space at the bottom.
  const baseHeightScale = useHeightScale();
  const baseTitleFont = useResponsiveFontSize('displayMedium');
  const baseItemFont = useResponsiveFontSize('headingMedium');
  const basePadding = useResponsiveSpacing(12);
  const baseMargin = useResponsiveSpacing(4);

  const nonNullTimeItemsCount = dayTimeItems.filter(Boolean).length;
  const landscapeTimeRows = Math.ceil(dayTimeItems.length / 2);

  const heightScale = useMemo(() => {
    if (availableHeight > 100) {
      if (isSmallWidth) {
        // Portrait: two stacked cards (InfoGroup + TimeGroup), 2 titles, all rows in 1 column
        const totalRows = dailyInfoItems.length + nonNullTimeItemsCount;
        // Unit height at scale = 1.0:
        // Outer padding (basePadding) + 2 cards * (2 * basePadding + 2 * baseMargin + title line + marginBottom)
        // + totalRows * (lineHeight ~1.35 * baseItemFont + 2 * 0.45 * basePadding)
        const unitHeight =
          basePadding * 5.8 +
          baseMargin * 5 +
          2 * (baseTitleFont * 1.3 + basePadding * 0.45) +
          totalRows * (baseItemFont * 1.35 + basePadding * 0.9);
        const maxWidthScale = baseHeightScale * 1.15;
        return Math.min(maxWidthScale, Math.max(0.45, (availableHeight * 0.94) / unitHeight));
      } else {
        // Landscape: side-by-side cards; the taller card has max(dailyInfoItems.length, landscapeTimeRows) rows
        const maxRows = Math.max(dailyInfoItems.length, landscapeTimeRows);
        // Unit height at scale = 1.0:
        // Outer padding (basePadding) + card padding (2 * basePadding) + margins (3 * baseMargin)
        // + title (baseTitleFont * 1.3 + basePadding * 0.65) + maxRows * (baseItemFont * 1.35 + basePadding * 1.3)
        const unitHeight =
          basePadding * 3.65 +
          baseMargin * 3 +
          baseTitleFont * 1.3 +
          maxRows * (baseItemFont * 1.35 + basePadding * 1.3);
        // Also cap by horizontal width so 2 columns of Hebrew text + times in TimeGroup don't wrap onto 2 lines
        const maxHorizontalScale = (width * 0.46) / (baseItemFont * 19);
        return Math.min(maxHorizontalScale, Math.max(0.5, (availableHeight * 0.95) / unitHeight));
      }
    }

    const totalPortraitRows = dailyInfoItems.length + nonNullTimeItemsCount;
    const portraitScaleFactor = isSmallWidth
      ? Math.min(1.0, Math.max(0.68, 17 / Math.max(16, totalPortraitRows)))
      : dailyInfoItems.length > 10
        ? 0.8
        : dailyInfoItems.length > 8
          ? 0.85
          : 0.95;
    return baseHeightScale * portraitScaleFactor;
  }, [
    availableHeight,
    isSmallWidth,
    dailyInfoItems.length,
    nonNullTimeItemsCount,
    landscapeTimeRows,
    basePadding,
    baseMargin,
    baseTitleFont,
    baseItemFont,
    baseHeightScale,
    width,
  ]);

  // Responsive sizes with height adjustment
  const titleSize = Math.round(baseTitleFont * heightScale);
  const textSize = Math.round(baseItemFont * heightScale);
  const padding = Math.round(basePadding * heightScale);
  const itemVerticalPadding = Math.max(2, Math.round(padding * (isSmallWidth ? 0.45 : 0.65)));
  const margin = Math.round(baseMargin * heightScale);

  const InfoGroup = ({ title, items }: { title: string; items: { text: string }[] }) => (
    <View
      className={`${backgroundColor} rounded-lg ${isSmallWidth ? 'w-full' : 'flex-1'} shadow-md`}
      style={{ padding, margin }}
    >
      <Text
        className={`font-extrabold ${headLineColor} text-center`}
        style={{ fontSize: titleSize, marginBottom: itemVerticalPadding }}
      >
        {title}
      </Text>
      {items.map((item, index) => (
        <Text
          key={index}
          className={`font-bold ${textColor} text-center`}
          style={{ fontSize: textSize, paddingVertical: itemVerticalPadding }}
        >
          {item.text}
        </Text>
      ))}
    </View>
  );

  const checkRTL = async () => {
    const isRightToLeft = await isRTL();
    setRtl(isRightToLeft);
  };

  useEffect(() => {
    checkRTL();
  }, []);

  const TimeGroup = ({ title, items }: { title: string; items: ({ text: string } | null)[] }) => (
    <View
      className={`${backgroundColor} rounded-lg ${isSmallWidth ? 'w-full' : 'flex-1'} shadow-md`}
      style={{ padding, margin }}
    >
      <Text
        className={`font-extrabold ${headLineColor} text-center`}
        style={{ fontSize: titleSize, marginBottom: itemVerticalPadding }}
      >
        {title}
      </Text>
      <View
        className={
          isSmallWidth ? 'flex-col' : `flex-1 flex-row${rtl ? '-reverse' : ''} flex-wrap content-between items-center`
        }
      >
        {items.map((item, index) =>
          item ? (
            <Text
              key={index}
              className={`font-bold ${textColor} text-center ${isSmallWidth ? 'w-full' : 'w-1/2'}`}
              style={{ fontSize: textSize, paddingVertical: itemVerticalPadding }}
            >
              {item.text}
            </Text>
          ) : isSmallWidth ? null : (
            <View key={index} className="w-1/2" style={{ paddingVertical: itemVerticalPadding }} />
          ),
        )}
      </View>
    </View>
  );

  if (!i18n.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && Math.abs(h - availableHeight) > 2) {
          setAvailableHeight(h);
        }
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: padding / 2 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View
          className={isSmallWidth ? 'flex-col flex-1 justify-between' : 'flex-1 flex-row justify-between items-stretch'}
          style={{ marginBottom: margin }}
        >
          <InfoGroup title={t('daily_info')} items={dailyInfoItems} />

          <TimeGroup title={t('day_times')} items={dayTimeItems} />
        </View>
      </ScrollView>
    </View>
  );
};

export default Zmanim;
