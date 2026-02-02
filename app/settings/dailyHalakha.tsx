import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSettings } from '../../context/settingsContext';
import { useTranslation } from 'react-i18next';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import { NumberInput } from '../../components/NumberInput';
import dailyHalakhaData from '../../assets/data/daily_halakha.json';

interface HalakhaItem {
  book_title: string;
  sections: string[];
}

const DailyHalakhaSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const [bookTitles, setBookTitles] = useState<string[]>([]);
  const heightScale = useHeightScale() * 0.5;
  const isSmallHeight = height < 600;

  // Responsive sizes with height adjustment
  const labelSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);
  const checkboxSize = Math.round(25 * heightScale);

  useEffect(() => {
    // Extract unique book titles from the JSON data
    // keep books thet have book_title and sections
    const titles = Array.from(
      new Set((dailyHalakhaData as HalakhaItem[]).filter((item) => item.book_title).map((item) => item.book_title)),
    );
    setBookTitles(titles.sort());
  }, []);

  const saveChecked = (value: boolean) => {
    updateSettings({ dailyHalakhaSettings: { ...settings.dailyHalakhaSettings, enable: value } });
  };

  const toggleBook = (bookTitle: string) => {
    const selectedBooks = settings.dailyHalakhaSettings?.selectedBooks || [];
    const newSelectedBooks = selectedBooks.includes(bookTitle)
      ? selectedBooks.filter((title) => title !== bookTitle)
      : [...selectedBooks, bookTitle];
    updateSettings({
      dailyHalakhaSettings: {
        ...settings.dailyHalakhaSettings,
        selectedBooks: newSelectedBooks,
      },
    });
  };

  const checkboxStyles = {
    blue: {
      iconStyle: { borderColor: '#3b82f6' },
      innerIconStyle: { borderWidth: 2 },
    },
    green: {
      iconStyle: { borderColor: 'green' },
      innerIconStyle: { borderWidth: 2 },
    },
  };

  if (isLoading || !i18n.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const selectedBooks = settings.dailyHalakhaSettings?.selectedBooks || [];

  return (
    <View className="flex-1" style={{ marginTop: margin }}>
      <View className="flex-row items-center justify-center" style={{ gap: padding }}>
        <BouncyCheckbox
          size={checkboxSize}
          isChecked={settings.dailyHalakhaSettings?.enable || false}
          fillColor="green"
          iconStyle={checkboxStyles.green.iconStyle}
          innerIconStyle={checkboxStyles.green.innerIconStyle}
          text={t('enable_daily_halakha')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_daily_halakha')}</Text>}
          onPress={(value) => saveChecked(value)}
        />
      </View>
      {settings.dailyHalakhaSettings?.enable && (
        <View className="flex-1" style={{ marginTop: margin }}>
          <View style={{ padding }}>
            <View style={{ gap: margin }}>
              {/* Show Holiday Halachot Before Holidays and Screen Display Time in same row */}
              <View className="flex-row items-center justify-center" style={{ gap: padding }}>
                <BouncyCheckbox
                  size={checkboxSize}
                  isChecked={settings.dailyHalakhaSettings?.showRelatedHolidaysHalachot || false}
                  fillColor="green"
                  iconStyle={checkboxStyles.green.iconStyle}
                  innerIconStyle={checkboxStyles.green.innerIconStyle}
                  text={t('show_holiday_halachot_before_holidays')}
                  textComponent={
                    <Text style={{ fontSize: textSize }}>{t('show_holiday_halachot_before_holidays')}</Text>
                  }
                  onPress={(value) => {
                    updateSettings({
                      dailyHalakhaSettings: {
                        ...settings.dailyHalakhaSettings,
                        showRelatedHolidaysHalachot: value,
                      },
                    });
                  }}
                />
                <NumberInput
                  value={settings.dailyHalakhaSettings?.screenDisplayTime || 10}
                  onChange={(newTime) => {
                    updateSettings({
                      dailyHalakhaSettings: {
                        ...settings.dailyHalakhaSettings,
                        screenDisplayTime: newTime,
                      },
                    });
                  }}
                  min={1}
                  max={60}
                  label={t('screen_display_time_description')}
                  labelSize={textSize * 0.9}
                  textSize={textSize}
                  padding={padding}
                  smallPadding={smallPadding}
                  heightScale={heightScale}
                  buttonSize={40 * heightScale}
                />
              </View>

              {/* Halakha Items Per Day */}
              <NumberInput
                value={settings.dailyHalakhaSettings?.halakhaItemsPerDay || 2}
                onChange={(newItems) => {
                  updateSettings({
                    dailyHalakhaSettings: {
                      ...settings.dailyHalakhaSettings,
                      halakhaItemsPerDay: newItems,
                    },
                  });
                }}
                min={1}
                max={10}
                label={t('halakha_items_per_day')}
                labelSize={textSize * 0.9}
                textSize={textSize}
                padding={padding}
                smallPadding={smallPadding}
                heightScale={heightScale}
                buttonSize={40 * heightScale}
              />

              {/* Book Selection */}
              <View style={{ gap: smallPadding }}>
                <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                  {t('select_books')}
                </Text>
                <ScrollView className="flex-1" style={{ maxHeight: isSmallHeight ? 300 : 500 }}>
                  <View className="flex-row flex-wrap" style={{ gap: smallPadding }}>
                    {bookTitles.map((bookTitle) => (
                      <View
                        key={bookTitle}
                        className="border border-gray-300 rounded-lg bg-gray-50"
                        style={{ padding: smallPadding, marginBottom: smallPadding, width: '48%' }}
                      >
                        <BouncyCheckbox
                          size={checkboxSize}
                          isChecked={selectedBooks.includes(bookTitle)}
                          fillColor="#3b82f6"
                          iconStyle={checkboxStyles.blue.iconStyle}
                          innerIconStyle={checkboxStyles.blue.innerIconStyle}
                          text={bookTitle}
                          textComponent={<Text style={{ fontSize: textSize }}>{bookTitle}</Text>}
                          onPress={() => toggleBook(bookTitle)}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DailyHalakhaSettingsTab;
