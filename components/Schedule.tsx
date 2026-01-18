import { useSettings } from 'context/settingsContext';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { isRTL } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveSpacing } from 'utils/responsive';

export async function getSubPages(): Promise<number> {
  return Promise.resolve(1);
}

const Schedule: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [rtl, setRtl] = useState(false);

  // Responsive sizes
  const titleSize = useResponsiveFontSize('displayLarge');
  const textSize = useResponsiveFontSize('headingMedium');
  const emptyTextSize = useResponsiveFontSize('headingLarge');
  const padding = useResponsiveSpacing(24);
  const margin = useResponsiveSpacing(8);
  const itemPadding = useResponsiveSpacing(16);

  const backgroundColor = 'bg-white/40';
  const headLineColor = 'text-gray-900';
  const textColor = 'text-gray-800';

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
      className={`${backgroundColor} rounded-2xl flex-1 shadow-lg border border-gray-200`}
      style={{ padding, margin }}
    >
      <Text className={`font-bold ${headLineColor} text-center`} style={{ fontSize: titleSize, marginBottom: padding }}>
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
              className="bg-white/60 rounded-xl shadow-sm border border-gray-200"
              style={{ paddingHorizontal: itemPadding, paddingVertical: itemPadding, marginBottom: margin }}
            >
              <View className={`flex-row justify-between gap-4 flex-row ${rtl ? 'space-x-reverse' : ''}`}>
                <Text className={`${textColor} font-semibold flex-1`} style={{ fontSize: textSize }}>
                  {item.name}
                </Text>
                <Text className={`${textColor} font-bold`} style={{ fontSize: textSize }}>
                  {' '}
                  -{' '}
                </Text>
                <Text className={`${textColor} font-bold`} style={{ fontSize: textSize }}>
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

  const columns = settings.scheduleSettings?.columns || [];

  return (
    <View className="flex-1" style={{ padding: itemPadding }}>
      {/* Row(s) for columns */}
      <View className="flex-row justify-center items-start flex-wrap">
        {columns.map((column) => (
          <InfoGroup
            key={column.id}
            title={column.title}
            items={column.prayers.map((p) => ({ name: p.name, time: p.time }))}
            rtl={rtl}
          />
        ))}
      </View>
      {columns.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-center" style={{ fontSize: titleSize }}>
            {t('schedule_no_prayers')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Schedule;
