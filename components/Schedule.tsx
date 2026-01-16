import { useSettings } from 'context/settingsContext';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { isRTL } from 'utils/utils';

export async function getSubPages(): Promise<number> {
  return Promise.resolve(1);
}

const Schedule: React.FC = () => {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();
  const [rtl, setRtl] = useState(false);

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
    <View className={`${backgroundColor} rounded-2xl p-6 m-2 flex-1 shadow-lg border border-gray-200`}>
      <Text className={`text-5xl font-bold mb-6 ${headLineColor} text-center`}>{title}</Text>
      {items.length === 0 ? (
        <Text className={`text-3xl py-4 text-gray-500 text-center`}>{t('schedule_no_prayers')}</Text>
      ) : (
        <View className="space-y-2 border-gray-200">
          {items.map((item, index) => (
            <View key={index} className="bg-white/60 rounded-xl px-6 py-4 mb-3 shadow-sm border border-gray-200">
              <View className={`flex-row justify-between gap-4 flex-row ${rtl ? 'space-x-reverse' : ''}`}>
                <Text className={`text-4xl ${textColor} font-semibold flex-1`}>{item.name}</Text>
                <Text className={`text-4xl ${textColor} font-bold`}> - </Text>
                <Text className={`text-4xl ${textColor} font-bold`}>{item.time}</Text>
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
    <View className="flex-1 p-4">
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
          <Text className="text-4xl text-gray-500 text-center">{t('schedule_no_prayers')}</Text>
        </View>
      )}
    </View>
  );
};

export default Schedule;
