import { useState } from 'react';
import {
  View,
  Text,
  I18nManager,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSettings } from '../../context/settingsContext';
import { backgroundImages, cities, olsons } from '../../assets/data';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import ExternalLink from '../../utils/PressableLink';

const HelpSection = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const link1 = 'https://github.com';
  const link2 = 'https://gist.github.com';
  const link3 = 'https://github.com/settings/personal-access-tokens/new';
  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg"
      >
        <Text className="text-blue-600 font-medium">{t('setup_help')}</Text>
        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#2563eb" />
      </TouchableOpacity>

      {/* eslint-disable @typescript-eslint/no-require-imports */}
      {isExpanded && (
        <View className="mt-2 space-y-4">
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">
              {t('help_step_1')} <ExternalLink url={link1} /> {t('help_step_1_1')}
            </Text>
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">
              {t('help_step_2')} <ExternalLink url={link2} />
              {t('help_step_2_1')}
            </Text>
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_3')}</Text>
            <Text className="text-gray-700 mb-2 font-bold">{t('help_step_3_1')}</Text>
            <Text className="text-gray-700 mb-2">{t('help_step_3_2')}</Text>
            <Image
              source={require('../../assets/help/help3.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>

          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_4')}</Text>
            <Image
              source={require('../../assets/help/help4.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_5')}</Text>
            <Image
              source={require('../../assets/help/help5.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">
              {t('help_step_6')} <ExternalLink url={link3} />
            </Text>
            <Text className="text-gray-700 mb-2">{t('help_step_6_1')}</Text>
            <Image
              source={require('../../assets/help/help6.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="w-full bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_7')}</Text>
            <Image
              source={require('../../assets/help/help7.png')}
              className="w-full h-48 rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_8')}</Text>
            <Image
              source={require('../../assets/help/help8.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-gray-700 mb-2">{t('help_step_9')}</Text>
            <Image
              source={require('../../assets/help/help9.png')}
              className="w-full h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
        </View>
      )}
      {/* eslint-enable @typescript-eslint/no-require-imports */}
    </View>
  );
};

const GeneralSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const [latitude, setLatitude] = useState(settings.latitude.toString());
  const [longitude, setLongitude] = useState(settings.longitude.toString());
  const [elevation, setElevation] = useState(settings.elevation?.toString() || '0');
  const [gistId, setGistId] = useState(settings.gistId);
  const [githubKeyUrl, setGithubKeyUrl] = useState(settings.githubKey);
  const [gistFileName, setGistFileName] = useState(settings.gistFileName);
  const [synagogueName, setSynagogueName] = useState(settings.name);
  const [selectedLocation, setSelectedLocation] = useState(cities[0].name);
  const [olson, setOlson] = useState(settings.olson);
  const [background, setBackground] = useState(settings.background);
  const [purimSettings, setPurimSettings] = useState(settings.purimSettings || { regular: true, shushan: false });

  const handleSynagogueName = (synagogueName: string) => {
    setSynagogueName(synagogueName);
    updateSettings({ name: synagogueName });
  };

  const handleGistId = (gistId: string) => {
    setGistId(gistId);
    updateSettings({ gistId: gistId });
  };

  const handleGistFileName = (gistFileName: string) => {
    setGistFileName(gistFileName);
    updateSettings({ gistFileName: gistFileName });
  };

  const handleGithubKey = (githubKey: string) => {
    setGithubKeyUrl(githubKey);
    updateSettings({ githubKey: githubKey });
  };
  const handleChangeLanguage = async (newLanguage: 'he' | 'en') => {
    updateSettings({ language: newLanguage });
    if (i18n) await i18n.changeLanguage(newLanguage);
    const isRTL = newLanguage === 'he';
    I18nManager.forceRTL(isRTL);
  };

  const handleCityChange = (city: string) => {
    const chosen_city = cities.find((x) => x.name === city || x.hebrew_name === city) || cities[0];
    setLatitude(chosen_city.latitude.toString());
    setLongitude(chosen_city.longitude.toString());
    setSelectedLocation(city);
    updateSettings({ city: city });
  };

  const handleLatitudeChange = (latitude: string) => {
    setLatitude(latitude);
    updateSettings({ latitude: Number(latitude) });
  };

  const handleLongitudeChange = (longitude: string) => {
    setLongitude(longitude);
    updateSettings({ longitude: Number(longitude) });
  };

  const handleElevationChange = (elevation: string) => {
    setElevation(elevation);
    updateSettings({ elevation: Number(elevation) });
  };

  const handleOlsonChange = (olson: string) => {
    setOlson(olson);
    updateSettings({ olson: longitude });
  };

  const handleBackgroundChange = (background: string) => {
    setBackground(background);
    updateSettings({ background: background });
  };

  const handlePurimToggle = (type: 'regular' | 'shushan') => {
    const newSettings = { ...purimSettings, [type]: !purimSettings[type] };
    setPurimSettings(newSettings);
    updateSettings({ purimSettings: newSettings });
  };
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="space-y-4">
          {/* Name */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('synagogue_name')}</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value={synagogueName}
              onChangeText={handleSynagogueName}
              placeholder="Enter Synagogue Name"
            />
            <HelpSection />
          </View>
          {/* gist sha512 */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('gist_sha')}</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value={gistId}
              onChangeText={handleGistId}
            />
          </View>
          {/* gistFileName */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('gist_file_key')}</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value={gistFileName}
              onChangeText={handleGistFileName}
            />
          </View>
          {/* access */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('gist_key')}</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value={githubKeyUrl}
              onChangeText={handleGithubKey}
              secureTextEntry={true}
            />
          </View>
          {/* Language */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('language')}</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50">
              <Picker
                selectedValue={settings.language}
                onValueChange={(value) => void handleChangeLanguage(value)}
                className="h-12"
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="עברית" value="he" />
              </Picker>
            </View>
          </View>

          {/* Location */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('location')}</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50">
              <Picker selectedValue={selectedLocation} onValueChange={handleCityChange} className="h-12">
                {settings.language === 'en'
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

          {/* Coordinates */}
          <View className="flex-row space-x-4">
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-medium text-gray-600">{t('latitude')}</Text>
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                value={latitude}
                onChangeText={handleLatitudeChange}
                keyboardType="numeric"
                placeholder="Enter latitude"
              />
            </View>
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-medium text-gray-600">{t('longitude')}</Text>
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                value={longitude}
                onChangeText={handleLongitudeChange}
                keyboardType="numeric"
                placeholder="Enter longitude"
              />
            </View>
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-medium text-gray-600">{t('elevation')}</Text>
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                value={elevation}
                onChangeText={handleElevationChange}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
          {/* olson */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('olson')}</Text>
            <Picker selectedValue={olson} onValueChange={handleOlsonChange} className="h-12">
              {olsons.map((olson) => (
                <Picker.Item key={olson} label={olson} value={olson} />
              ))}
            </Picker>
          </View>
          {/* Purim */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('purim_type')}</Text>
            <View className="space-y-2">
              <TouchableOpacity
                className="flex-row items-center p-3 border border-gray-300 rounded-lg bg-gray-50"
                onPress={() => handlePurimToggle('regular')}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${purimSettings.regular ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                >
                  {purimSettings.regular && <Feather name="check" size={14} color="white" />}
                </View>
                <Text className="text-gray-700">{t('purim_regular')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center p-3 border border-gray-300 rounded-lg bg-gray-50"
                onPress={() => handlePurimToggle('shushan')}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${purimSettings.shushan ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                >
                  {purimSettings.shushan && <Feather name="check" size={14} color="white" />}
                </View>
                <Text className="text-gray-700">{t('purim_shushan')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* background */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('background')}</Text>
            <Picker selectedValue={background} onValueChange={handleBackgroundChange} className="h-12">
              {backgroundImages.map((bimg) => (
                <Picker.Item key={bimg.label} label={bimg.label} value={bimg.value}></Picker.Item>
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default GeneralSettingsTab;
