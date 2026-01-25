import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSettings } from '../../context/settingsContext';
import { cities, olsons } from '../../assets/data';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { isRTL } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const ZmanimSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [latitude, setLatitude] = useState(settings.zmanimSettings.latitude.toString());
  const [longitude, setLongitude] = useState(settings.zmanimSettings.longitude.toString());
  const [elevation, setElevation] = useState(settings.zmanimSettings.elevation?.toString() || '0');
  const [selectedLocation, setSelectedLocation] = useState(cities[0]!.name);
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

  const handleCityChange = (city: string) => {
    const chosen_city = cities.find((x) => x.name === city || x.hebrew_name === city) || cities[0]!;
    setLatitude(chosen_city.latitude.toString());
    setLongitude(chosen_city.longitude.toString());
    setSelectedLocation(city);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, city: city } });
  };

  const handleLatitudeChange = (latitude: string) => {
    setLatitude(latitude);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, latitude: Number(latitude) } });
  };

  const handleLongitudeChange = (longitude: string) => {
    setLongitude(longitude);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, longitude: Number(longitude) } });
  };

  const handleElevationChange = (elevation: string) => {
    setElevation(elevation);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, elevation: Number(elevation) } });
  };

  const handleOlsonChange = (olson: string) => {
    setOlson(olson);
    updateSettings({ zmanimSettings: { ...settings.zmanimSettings, olson: olson } });
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
                      className="w-full border border-gray-300 rounded-lg bg-gray-50"
                      style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                      value={latitude}
                      onChangeText={handleLatitudeChange}
                      keyboardType="numeric"
                      placeholder="Enter latitude"
                    />
                  </View>
                  <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                      {t('longitude')}
                    </Text>
                    <TextInput
                      className="w-full border border-gray-300 rounded-lg bg-gray-50"
                      style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                      value={longitude}
                      onChangeText={handleLongitudeChange}
                      keyboardType="numeric"
                      placeholder="Enter longitude"
                    />
                  </View>
                </View>
                {/* Second Row: Elevation */}
                <View style={{ gap: smallPadding }}>
                  <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                    {t('elevation')}
                  </Text>
                  <TextInput
                    className="w-full border border-gray-300 rounded-lg bg-gray-50"
                    style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                    value={elevation}
                    onChangeText={handleElevationChange}
                    keyboardType="numeric"
                    placeholder="0"
                  />
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
