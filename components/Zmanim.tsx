import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FastDayType, ZmanimWrapper } from '../utils/zmanim_wrapper';
import { useSettings } from '../context/settingsContext';
import { useTranslation } from 'react-i18next';
import { isRTL } from 'utils/utils';
import { HallelType } from 'utils/zmanim_wrapper';

export function getSubPages() {
  return 1;
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

  const InfoGroup = ({ title, items }: { title: string; items: { label: string; time: string }[] }) => (
    <View className={`${backgroundColor} rounded-lg p-3 m-1 flex-1 shadow-md`}>
      <Text className={`text-4xl font-bold mb-2 ${headLineColor} text-center`}>{t(title)}</Text>
      {items.map((item, index) => (
        <Text key={index} className={`text-3xl py-3 ${textColor} text-center`}>
          {t(item.label, { date: item.time })}
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

  const TimeGroup = ({ title, items }: { title: string; items: ({ label: string; time: string } | null)[] }) => (
    <View className={`${backgroundColor} rounded-lg p-3 m-1 flex-1 shadow-md`}>
      <Text className={`text-4xl font-bold mb-2 ${headLineColor} text-center`}>{t(title)}</Text>
      <View className={`flex-row${rtl ? '-reverse' : ''} flex-wrap`}>
        {items.map((item, index) =>
          item ? (
            <Text key={index} className={`text-3xl py-3 ${textColor} text-center w-1/2`}>
              {t(item.label, { date: item.time })}
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
          title="daily_info"
          items={[
            ...(zmanim.getParsha() ? [{ label: 'parasha', time: zmanim.getParsha() }] : []),
            ...(zmanim.getHftara() ? [{ label: 'hftara', time: zmanim.getHftara() }] : []),
            ...(zmanim.getHoliday() ? zmanim.getHoliday().map((holiday) => ({ label: 'holiday', time: holiday })) : []),
            ...(zmanim.haveAlHanisim() ? [{ label: 'al_hanisim', time: t('al_hanisim') }] : []),
            ...(zmanim.haveYaaleVeyavo() ? [{ label: 'yaale_veyavo', time: t('yaale_veyavo') }] : []),
            ...(zmanim.getMevarchimChodesh() ? [{ label: 'mevarchim', time: zmanim.getMevarchimChodesh() }] : []),
            ...(zmanim.getMolad() ? [{ label: 'molad', time: zmanim.getMolad() }] : []),
            ...(zmanim.getOmer() ? [{ label: 'omer', time: zmanim.getOmer() }] : []),
            ...(zmanim.isMoridHatal()
              ? [{ label: 'morid_hatal', time: t('morid_hatal') }]
              : [{ label: 'mashiv_haruach', time: t('mashiv_haruach') }]),
            ...(zmanim.isVetenBracha()
              ? [{ label: 'veten_bracha', time: t('veten_bracha') }]
              : [{ label: 'tal_umatar', time: t('tal_umatar') }]),
            ...(hallelType === HallelType.WHOLE_HALLEL ? [{ label: 'whole_hallel', time: t('whole_hallel') }] : []),
            ...(hallelType === HallelType.HALF_HALLEL ? [{ label: 'half_hallel', time: t('half_hallel') }] : []),
            ...(haveTachanun ? [{ label: haveTachanun, time: '' }] : []),
          ]}
        />

        <TimeGroup
          title="day_times"
          items={[
            ...(fastDay === FastDayType.MINOR_FAST
              ? [
                  { label: 'fast_start', time: zmanim.getAlotHaShachar() },
                  { label: 'fast_end', time: zmanim.getMinorFastEnd() },
                ]
              : []),
            ...(fastDay === FastDayType.MAJOR_FAST
              ? [
                  { label: 'fast_start', time: zmanim.getSunset() },
                  { label: 'fast_end', time: zmanim.getMajorFastEnd() },
                ]
              : []),
            ...(haveCandleLighting ? [{ label: 'light_candle', time: zmanim.getCandleLighting() }] : []),
            ...(haveCandleLighting ? [{ label: 'havdala', time: zmanim.getHavdala() }] : []),
            { label: 'shachar', time: zmanim.getAlotHaShachar() },
            { label: 'mishayakir', time: zmanim.getMisheyakir() },
            { label: 'netz', time: zmanim.getNetz() },
            null,
            { label: 'eo_shma', time: zmanim.getSofZmanShma() },
            { label: 'eo_shma_gra', time: zmanim.getsofZmanShmaMGA() },
            { label: 'eo_tfila', time: zmanim.getsofZmanTfilla() },
            { label: 'eo_tfila_gra', time: zmanim.getsofZmanTfillaMGA() },
            { label: 'chatzot', time: zmanim.getChatzot() },
            { label: 'mincha_gdola', time: zmanim.getMinchaGdola() },
            { label: 'mincha_ktana', time: zmanim.getMinchaKtana() },
            { label: 'plag_mincha', time: zmanim.getPlag() },
            { label: 'sunset', time: zmanim.getSunset() },
            { label: 'stars', time: zmanim.gettzeit() },
          ]}
        />
      </View>
    </View>
  );
};

export default Zmanim;
