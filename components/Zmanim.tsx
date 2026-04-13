import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { FastDayType, ZmanimWrapper } from '../utils/zmanim_wrapper';
import { useSettings } from '../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { isRTL } from 'utils/utils';
import { HallelType } from 'utils/zmanim_wrapper';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

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
  const { width } = useWindowDimensions();
  const isSmallWidth = width < 500;

  const [rtl, setRtl] = useState(false);
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
      ),
    [
      settings.synagogueSettings.nusach,
      settings.synagogueSettings.language,
      settings.zmanimSettings.latitude,
      settings.zmanimSettings.longitude,
      settings.zmanimSettings.olson,
      settings.zmanimSettings.purimSettings,
      settings.zmanimSettings.elevation,
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
      hallelType === HallelType.NO_HALLEL
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
  const headLineColor = 'text-gray-800';
  const textColor = 'text-gray-999';
  const dailyInfoItems = useMemo(() => {
    if (!computedZmanim) {
      return [];
    }

    return [
      ...(computedZmanim.parsha ? [{ text: t('parasha', { date: computedZmanim.parsha }) }] : []),
      ...(computedZmanim.holidays
        ? computedZmanim.holidays.map((holiday) => ({ text: t('holiday', { date: holiday }) }))
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

  // Adjust heightScale based on InfoGroup items array size
  const heightScale = useHeightScale() * (dailyInfoItems.length > 10 ? 0.8 : dailyInfoItems.length > 8 ? 0.85 : 0.95);

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('displayMedium') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(12) * heightScale);
  const margin = Math.round(useResponsiveSpacing(4) * heightScale);

  const InfoGroup = ({ title, items }: { title: string; items: { text: string }[] }) => (
    <View
      className={`${backgroundColor} rounded-lg ${isSmallWidth ? 'w-full' : 'flex-1'} shadow-md`}
      style={{ padding, margin }}
    >
      <Text className={`font-bold ${headLineColor} text-center`} style={{ fontSize: titleSize, marginBottom: padding }}>
        {title}
      </Text>
      {items.map((item, index) => (
        <Text
          key={index}
          className={`${textColor} text-center`}
          style={{ fontSize: textSize, paddingVertical: padding }}
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
      <Text className={`font-bold ${headLineColor} text-center`} style={{ fontSize: titleSize, marginBottom: padding }}>
        {title}
      </Text>
      <View className={`flex-row${rtl ? '-reverse' : ''} flex-wrap`}>
        {items.map((item, index) =>
          item ? (
            <Text
              key={index}
              className={`${textColor} text-center w-1/2`}
              style={{ fontSize: textSize, paddingVertical: padding }}
            >
              {item.text}
            </Text>
          ) : (
            <View key={index} className="w-1/2" style={{ paddingVertical: padding }} />
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
    <ScrollView className="flex-1" contentContainerStyle={{ padding: padding / 2 }}>
      {/* Top Row */}
      <View className={isSmallWidth ? 'flex-col' : 'flex-row justify-between'} style={{ marginBottom: margin }}>
        <InfoGroup title={t('daily_info')} items={dailyInfoItems} />

        <TimeGroup title={t('day_times')} items={dayTimeItems} />
      </View>
    </ScrollView>
  );
};

export default Zmanim;
