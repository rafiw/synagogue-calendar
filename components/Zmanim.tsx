import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FastDayType, ZmanimWrapper } from '../utils/zmanim_wrapper';
import { useSettings } from '../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { isRTL } from 'utils/utils';
import { HallelType } from 'utils/zmanim_wrapper';

export async function getSubPages(): Promise<number> {
  return Promise.resolve(1);
}

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
  const { settings, updateSettings, isLoading } = useSettings();

  if (!i18n.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const [rtl, setRtl] = useState(false);
  const zmanim = new ZmanimWrapper(
    settings.latitude,
    settings.longitude,
    settings.olson,
    settings.language,
    settings.purimSettings,
    settings.elevation,
  );
  const hallelType = zmanim.getHallel();
  const isShabbat = zmanim.getDOE() === 6;
  const isFriday = zmanim.getDOE() === 5;
  const tachanun = zmanim.getTachanun();
  // if hallelType is not NO_HALLEL, don't show tachanun
  const haveTachanun =
    hallelType === HallelType.NO_HALLEL
      ? getTachanunLabel(tachanun?.shacharit, tachanun?.mincha, tachanun?.allCongs, isShabbat)
      : '';
  const backgroundColor = 'bg-white/30';
  const headLineColor = 'text-gray-800';
  const textColor = 'text-gray-999';
  const haveCandleLighting = isFriday || isShabbat || zmanim.isHolidayCandleLighting();
  const fastDay = zmanim.isFastDay();

  const InfoGroup = ({ title, items }: { title: string; items: { text: string }[] }) => (
    <View className={`${backgroundColor} rounded-lg p-3 m-1 flex-1 shadow-md`}>
      <Text className={`text-4xl font-bold mb-2 ${headLineColor} text-center`}>{title}</Text>
      {items.map((item, index) => (
        <Text key={index} className={`text-3xl py-3 ${textColor} text-center`}>
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
    <View className={`${backgroundColor} rounded-lg p-3 m-1 flex-1 shadow-md`}>
      <Text className={`text-4xl font-bold mb-2 ${headLineColor} text-center`}>{title}</Text>
      <View className={`flex-row${rtl ? '-reverse' : ''} flex-wrap`}>
        {items.map((item, index) =>
          item ? (
            <Text key={index} className={`text-3xl py-3 ${textColor} text-center w-1/2`}>
              {item.text}
            </Text>
          ) : (
            <View key={index} className="w-1/2 py-3" />
          ),
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-2">
      {/* Top Row */}
      <View className="flex-row justify-between mb-1">
        <InfoGroup
          title={t('daily_info')}
          items={[
            ...(zmanim.getParsha() ? [{ text: t('parasha', { date: zmanim.getParsha() }) }] : []),
            ...(zmanim.getHftara() ? [{ text: t('hftara', { date: zmanim.getHftara() }) }] : []),
            ...(zmanim.getHoliday()
              ? zmanim.getHoliday().map((holiday) => ({ text: t('holiday', { date: holiday }) }))
              : []),
            ...(zmanim.haveAlHanisim() ? [{ text: t('al_hanisim') }] : []),
            ...(zmanim.haveYaaleVeyavo() ? [{ text: t('yaale_veyavo') }] : []),
            ...(zmanim.getMevarchimChodesh() ? [{ text: t('mevarchim', { date: zmanim.getMevarchimChodesh() }) }] : []),
            ...(zmanim.getMolad() ? [{ text: t('molad', { date: zmanim.getMolad() }) }] : []),
            ...(zmanim.getOmer() ? [{ text: t('omer', { date: zmanim.getOmer() }) }] : []),
            ...(zmanim.isMoridHatal() ? [{ text: t('morid_hatal') }] : [{ text: t('mashiv_haruach') }]),
            ...(zmanim.isVetenBracha() ? [{ text: t('veten_bracha') }] : [{ text: t('tal_umatar') }]),
            ...(hallelType === HallelType.WHOLE_HALLEL ? [{ text: t('whole_hallel') }] : []),
            ...(hallelType === HallelType.HALF_HALLEL ? [{ text: t('half_hallel') }] : []),
            ...(haveTachanun ? [{ text: t(haveTachanun) }] : []),
          ]}
        />

        <TimeGroup
          title={t('day_times')}
          items={[
            ...(fastDay === FastDayType.MINOR_FAST
              ? [
                  { text: t('fast_start', { date: zmanim.getAlotHaShachar() }) },
                  { text: t('fast_end', { date: zmanim.getMinorFastEnd() }) },
                ]
              : []),
            ...(fastDay === FastDayType.MAJOR_FAST
              ? [
                  { text: t('fast_start', { date: zmanim.getSunset() }) },
                  { text: t('fast_end', { date: zmanim.getMajorFastEnd() }) },
                ]
              : []),
            ...(haveCandleLighting
              ? [
                  { text: t('light_candle', { date: zmanim.getCandleLighting() }) },
                  { text: t('havdala', { date: zmanim.getHavdala() }) },
                  { text: t('havdala_rt', { date: zmanim.getHavdalaRT() }) },
                  null,
                ]
              : []),
            { text: t('shachar', { date: zmanim.getAlotHaShachar() }) },
            { text: t('mishayakir', { date: zmanim.getMisheyakir() }) },
            { text: t('netz', { date: zmanim.getNetz() }) },
            null,
            { text: t('eo_shma', { date: zmanim.getSofZmanShma() }) },
            { text: t('eo_shma_gra', { date: zmanim.getsofZmanShmaMGA() }) },
            { text: t('eo_tfila', { date: zmanim.getsofZmanTfilla() }) },
            { text: t('eo_tfila_gra', { date: zmanim.getsofZmanTfillaMGA() }) },
            { text: t('chatzot', { date: zmanim.getChatzot() }) },
            { text: t('mincha_gdola', { date: zmanim.getMinchaGdola() }) },
            { text: t('mincha_ktana', { date: zmanim.getMinchaKtana() }) },
            { text: t('plag_mincha', { date: zmanim.getPlag() }) },
            { text: t('sunset', { date: zmanim.getSunset() }) },
            { text: t('stars', { date: zmanim.gettzeit() }) },
          ]}
        />
      </View>
    </View>
  );
};

export default Zmanim;
