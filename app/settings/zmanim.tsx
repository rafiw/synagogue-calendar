import { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSettings } from '@context/settingsContext';
import { cities, olsons } from '@assets/data';
import { isIsraelTimezone, resolveDefaultCandleLightingMins } from '@utils/zmanim_wrapper';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { isRTL } from '@utils/utils';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from '@utils/responsive';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const getCityValueForLanguage = (city: string | undefined, language: string | undefined): string => {
  const matchedCity = cities.find((x) => x.name === city || x.hebrew_name === city) || cities[0]!;
  return language === 'en' ? matchedCity.name : matchedCity.hebrew_name;
};

const ZmanimSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [selectedLocation, setSelectedLocation] = useState(() =>
    getCityValueForLanguage(settings.zmanimSettings.city, settings.synagogueSettings.language),
  );
  const [olson, setOlson] = useState(settings.zmanimSettings.olson);
  const [purimSettings, setPurimSettings] = useState(
    settings.zmanimSettings.purimSettings || { regular: true, shushan: false },
  );
  const [rtl, setRtl] = useState(false);
  const heightScale = useHeightScale() * 0.5;
  const isSmallHeight = height < 600;

  // Responsive sizes with height adjustment
  const labelSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const iconSize = Math.round(24 * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);
  const pickerHeight = Math.round(48 * heightScale);
  const checkboxSize = Math.round(25 * heightScale);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  const [latText, setLatText] = useState((settings.zmanimSettings.latitude ?? 31.7667).toString());
  const [lngText, setLngText] = useState((settings.zmanimSettings.longitude ?? 35.2333).toString());
  const [elevText, setElevText] = useState((settings.zmanimSettings.elevation ?? 0).toString());
  const [candleMinsText, setCandleMinsText] = useState(
    (
      settings.zmanimSettings.candleLightingMins ??
      resolveDefaultCandleLightingMins(
        settings.zmanimSettings.city,
        settings.zmanimSettings.latitude,
        settings.zmanimSettings.longitude,
        settings.zmanimSettings.olson,
      )
    ).toString(),
  );
  const [latError, setLatError] = useState<string | null>(null);
  const [lngError, setLngError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocation(getCityValueForLanguage(settings.zmanimSettings.city, settings.synagogueSettings.language));
    setOlson(settings.zmanimSettings.olson);
    setPurimSettings(settings.zmanimSettings.purimSettings || { regular: true, shushan: false });
    setLatText((settings.zmanimSettings.latitude ?? 31.7667).toString());
    setLngText((settings.zmanimSettings.longitude ?? 35.2333).toString());
    setElevText((settings.zmanimSettings.elevation ?? 0).toString());
    setCandleMinsText(
      (
        settings.zmanimSettings.candleLightingMins ??
        resolveDefaultCandleLightingMins(
          settings.zmanimSettings.city,
          settings.zmanimSettings.latitude,
          settings.zmanimSettings.longitude,
          settings.zmanimSettings.olson,
        )
      ).toString(),
    );
  }, [
    settings.synagogueSettings.language,
    settings.zmanimSettings.city,
    settings.zmanimSettings.olson,
    settings.zmanimSettings.purimSettings,
    settings.zmanimSettings.latitude,
    settings.zmanimSettings.longitude,
    settings.zmanimSettings.elevation,
    settings.zmanimSettings.candleLightingMins,
  ]);

  const handleCityChange = (city: string) => {
    const chosen_city = cities.find((x) => x.name === city || x.hebrew_name === city) || cities[0]!;
    setSelectedLocation(city);
    setLatText(chosen_city.latitude.toString());
    setLngText(chosen_city.longitude.toString());
    setCandleMinsText(chosen_city.candleLightingMins.toString());
    setLatError(null);
    setLngError(null);
    updateSettings({
      zmanimSettings: {
        ...settings.zmanimSettings,
        city,
        latitude: chosen_city.latitude,
        longitude: chosen_city.longitude,
        candleLightingMins: chosen_city.candleLightingMins,
      },
    });
  };

  const handleLatChange = (text: string) => {
    setLatText(text);
    const trimmed = text.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '.') {
      return;
    }
    const val = Number(trimmed);
    if (isNaN(val) || val < -90 || val > 90) {
      setLatError(t('invalid_latitude'));
      return;
    }
    setLatError(null);
    updateSettings({
      zmanimSettings: {
        ...settings.zmanimSettings,
        latitude: val,
      },
    });
  };

  const handleLatBlur = () => {
    const trimmed = latText.trim();
    const val = Number(trimmed);
    if (trimmed === '' || isNaN(val) || val < -90 || val > 90) {
      setLatText((settings.zmanimSettings.latitude ?? 31.7667).toString());
      setLatError(null);
    }
  };

  const handleLngChange = (text: string) => {
    setLngText(text);
    const trimmed = text.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '.') {
      return;
    }
    const val = Number(trimmed);
    if (isNaN(val) || val < -180 || val > 180) {
      setLngError(t('invalid_longitude'));
      return;
    }
    setLngError(null);
    updateSettings({
      zmanimSettings: {
        ...settings.zmanimSettings,
        longitude: val,
      },
    });
  };

  const handleLngBlur = () => {
    const trimmed = lngText.trim();
    const val = Number(trimmed);
    if (trimmed === '' || isNaN(val) || val < -180 || val > 180) {
      setLngText((settings.zmanimSettings.longitude ?? 35.2333).toString());
      setLngError(null);
    }
  };

  const handleElevChange = (text: string) => {
    setElevText(text);
    const trimmed = text.trim();
    if (trimmed === '' || trimmed === '-') {
      return;
    }
    const val = Number(trimmed);
    if (!isNaN(val)) {
      updateSettings({
        zmanimSettings: {
          ...settings.zmanimSettings,
          elevation: val,
        },
      });
    }
  };

  const handleElevBlur = () => {
    const trimmed = elevText.trim();
    const val = Number(trimmed);
    if (trimmed === '' || isNaN(val)) {
      setElevText((settings.zmanimSettings.elevation ?? 0).toString());
    }
  };

  const handleCandleMinsChange = (text: string) => {
    setCandleMinsText(text);
    const trimmed = text.trim();
    if (trimmed === '') {
      return;
    }
    const val = parseInt(trimmed, 10);
    if (!isNaN(val) && val > 0 && val <= 120) {
      updateSettings({
        zmanimSettings: {
          ...settings.zmanimSettings,
          candleLightingMins: val,
        },
      });
    }
  };

  const handleCandleMinsBlur = () => {
    const trimmed = candleMinsText.trim();
    const val = parseInt(trimmed, 10);
    if (trimmed === '' || isNaN(val) || val <= 0 || val > 120) {
      const fallback =
        settings.zmanimSettings.candleLightingMins ??
        resolveDefaultCandleLightingMins(
          settings.zmanimSettings.city,
          settings.zmanimSettings.latitude,
          settings.zmanimSettings.longitude,
          settings.zmanimSettings.olson,
        );
      setCandleMinsText(fallback.toString());
    }
  };

  const handleOlsonChange = (newOlson: string) => {
    setOlson(newOlson);
    const wasIl = isIsraelTimezone(settings.zmanimSettings.olson);
    const nowIl = isIsraelTimezone(newOlson);
    let nextCandleMins = settings.zmanimSettings.candleLightingMins;
    if (wasIl !== nowIl) {
      nextCandleMins = resolveDefaultCandleLightingMins(
        nowIl ? settings.zmanimSettings.city : undefined,
        settings.zmanimSettings.latitude,
        settings.zmanimSettings.longitude,
        newOlson,
      );
      setCandleMinsText(nextCandleMins.toString());
    }
    updateSettings({
      zmanimSettings: {
        ...settings.zmanimSettings,
        olson: newOlson,
        il: nowIl,
        ...(nextCandleMins !== undefined ? { candleLightingMins: nextCandleMins } : {}),
      },
    });
  };

  const handlePurimToggle = (type: 'regular' | 'shushan') => {
    const newSettings = { ...purimSettings, [type]: !purimSettings[type] };
    setPurimSettings(newSettings);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, purimSettings: newSettings } });
  };
  const saveChecked = (value: boolean) => {
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, enable: value } });
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
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ marginTop: margin }}>
      <View className="flex-row items-center justify-center" style={{ gap: padding }}>
        <BouncyCheckbox
          size={checkboxSize}
          isChecked={settings.zmanimSettings.enable}
          fillColor="green"
          iconStyle={checkboxStyles.green.iconStyle}
          innerIconStyle={checkboxStyles.green.innerIconStyle}
          text={t('enable_zmanim')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_zmanim')}</Text>}
          onPress={(value) => saveChecked(value)}
        />
      </View>
      {settings.zmanimSettings.enable && (
        <View className="flex-1" style={{ marginTop: margin }}>
          <View style={{ padding }}>
            <View style={{ gap: margin }}>
              {/* Zmanim Display Time */}
              <View className="flex-row items-center justify-center" style={{ gap: padding }}>
                <Text className="text-center text-gray-600" style={{ fontSize: textSize * 0.9 }}>
                  {t('screen_display_time_description')}
                </Text>
                <View className="flex-row items-center" style={{ gap: smallPadding }}>
                  <TouchableOpacity
                    onPress={() => {
                      const currentTime = settings.zmanimSettings.screenDisplayTime || 10;
                      const newTime = Math.max(1, currentTime - 1);
                      updateSettings({
                        zmanimSettings: {
                          ...settings.zmanimSettings,
                          screenDisplayTime: newTime,
                        },
                      });
                    }}
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <View
                    className="bg-blue-100 rounded-lg items-center justify-center"
                    style={{ paddingHorizontal: padding, paddingVertical: smallPadding, minWidth: 60 * heightScale }}
                  >
                    <Text className="text-blue-900 font-bold" style={{ fontSize: textSize }}>
                      {settings.zmanimSettings.screenDisplayTime || 10}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const currentTime = settings.zmanimSettings.screenDisplayTime || 10;
                      const newTime = Math.min(60, currentTime + 1);
                      updateSettings({
                        zmanimSettings: {
                          ...settings.zmanimSettings,
                          screenDisplayTime: newTime,
                        },
                      });
                    }}
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                className={`${isSmallHeight ? (rtl ? 'flex-row-reverse' : 'flex-row') : ''} items-center`}
                style={{ gap: padding }}
              >
                {/* Location */}
                <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                  <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                    {t('location')}
                  </Text>
                  <View className="border border-gray-300 rounded-lg bg-gray-50">
                    <Picker
                      selectedValue={selectedLocation}
                      onValueChange={handleCityChange}
                      style={{ height: pickerHeight }}
                    >
                      {settings.synagogueSettings.language === 'en'
                        ? cities.map((location) => (
                            <Picker.Item key={location.name} label={location.name} value={location.name} />
                          ))
                        : cities.map((location) => (
                            <Picker.Item
                              key={location.hebrew_name}
                              label={location.hebrew_name}
                              value={location.hebrew_name}
                            />
                          ))}
                    </Picker>
                  </View>
                </View>
                {/* olson */}
                <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                  <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                    {t('olson')}
                  </Text>
                  <View className="border border-gray-300 rounded-lg bg-gray-50">
                    <Picker selectedValue={olson} onValueChange={handleOlsonChange} style={{ height: pickerHeight }}>
                      {olsons.map((olson) => (
                        <Picker.Item key={olson} label={olson} value={olson} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Coordinates */}
              <View style={{ gap: padding }}>
                {/* First Row: Latitude and Longitude */}
                <View className={isSmallHeight ? 'flex-row' : ''} style={{ gap: padding }}>
                  <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                      {t('latitude')}
                    </Text>
                    <TextInput
                      className={`w-full border rounded-lg bg-gray-50 ${latError ? 'border-red-500' : 'border-gray-300'}`}
                      style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                      value={latText}
                      onChangeText={handleLatChange}
                      onBlur={handleLatBlur}
                      keyboardType="numeric"
                      placeholder="Enter latitude"
                    />
                    {latError && (
                      <Text className="text-red-500 font-medium" style={{ fontSize: labelSize * 0.9 }}>
                        {latError}
                      </Text>
                    )}
                  </View>
                  <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                      {t('longitude')}
                    </Text>
                    <TextInput
                      className={`w-full border rounded-lg bg-gray-50 ${lngError ? 'border-red-500' : 'border-gray-300'}`}
                      style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                      value={lngText}
                      onChangeText={handleLngChange}
                      onBlur={handleLngBlur}
                      keyboardType="numeric"
                      placeholder="Enter longitude"
                    />
                    {lngError && (
                      <Text className="text-red-500 font-medium" style={{ fontSize: labelSize * 0.9 }}>
                        {lngError}
                      </Text>
                    )}
                  </View>
                </View>
                {/* Second Row: Elevation and Candle Lighting Minutes */}
                <View className={isSmallHeight ? 'flex-row' : ''} style={{ gap: padding }}>
                  <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                      {t('elevation')}
                    </Text>
                    <TextInput
                      className="w-full border border-gray-300 rounded-lg bg-gray-50"
                      style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                      value={elevText}
                      onChangeText={handleElevChange}
                      onBlur={handleElevBlur}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                      {t('candle_lighting_mins')}
                    </Text>
                    <View className="flex-row items-center" style={{ gap: smallPadding }}>
                      <TextInput
                        className="flex-1 border border-gray-300 rounded-lg bg-gray-50"
                        style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                        value={candleMinsText}
                        onChangeText={handleCandleMinsChange}
                        onBlur={handleCandleMinsBlur}
                        keyboardType="numeric"
                        placeholder="20"
                      />
                      {[18, 20, 30, 40].map((mins) => {
                        const isSelected = Number(candleMinsText) === mins;
                        return (
                          <TouchableOpacity
                            key={mins}
                            onPress={() => handleCandleMinsChange(mins.toString())}
                            className={`rounded-lg border items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-100 border-gray-300'
                            }`}
                            style={{ paddingHorizontal: smallPadding * 1.2, paddingVertical: smallPadding * 1.2 }}
                          >
                            <Text
                              className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}
                              style={{ fontSize: labelSize }}
                            >
                              {mins}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* Purim */}
              <View style={{ gap: smallPadding }}>
                <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                  {t('purim_type')}
                </Text>
                <View className="flex-row" style={{ gap: padding }}>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center border border-gray-300 rounded-lg bg-gray-50"
                    style={{ padding: smallPadding * 1.5 }}
                    onPress={() => handlePurimToggle('regular')}
                  >
                    <View
                      className={`rounded border-2 items-center justify-center ${purimSettings.regular ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                      style={{ width: 20 * heightScale, height: 20 * heightScale, marginRight: smallPadding * 1.5 }}
                    >
                      {purimSettings.regular && <Feather name="check" size={iconSize * 0.7} color="white" />}
                    </View>
                    <Text className="text-gray-700" style={{ fontSize: textSize }}>
                      {t('purim_regular')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center border border-gray-300 rounded-lg bg-gray-50"
                    style={{ padding: smallPadding * 1.5 }}
                    onPress={() => handlePurimToggle('shushan')}
                  >
                    <View
                      className={`rounded border-2 items-center justify-center ${purimSettings.shushan ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                      style={{ width: 20 * heightScale, height: 20 * heightScale, marginRight: smallPadding * 1.5 }}
                    >
                      {purimSettings.shushan && <Feather name="check" size={iconSize * 0.7} color="white" />}
                    </View>
                    <Text className="text-gray-700" style={{ fontSize: textSize }}>
                      {t('purim_shushan')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ZmanimSettingsTab;
