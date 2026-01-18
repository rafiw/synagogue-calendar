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
import * as ImagePicker from 'expo-image-picker';
import { useSettings } from '../../context/settingsContext';
import { backgroundImages, cities, olsons } from '../../assets/data';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import ExternalLink from '../../utils/PressableLink';
import ColorPickerModal from '../../components/ColorPickerModal';
import { showAlert } from '../../utils/alert';

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
  const [selectedLocation, setSelectedLocation] = useState(cities[0]!.name);
  const [olson, setOlson] = useState(settings.olson);
  const [background, setBackground] = useState(settings.backgroundSettings?.imageUrl || '');
  const [purimSettings, setPurimSettings] = useState(settings.purimSettings || { regular: true, shushan: false });

  // New background settings state
  const [backgroundMode, setBackgroundMode] = useState(settings.backgroundSettings?.mode || 'image');
  const [solidColor, setSolidColor] = useState(settings.backgroundSettings?.solidColor || '#E3F2FD');
  const [gradientColors, setGradientColors] = useState(
    settings.backgroundSettings?.gradientColors || ['#E3F2FD', '#BBDEFB', '#90CAF9'],
  );
  const [gradientDirection, setGradientDirection] = useState<'vertical' | 'horizontal' | 'diagonal'>(
    settings.backgroundSettings?.gradientStart?.x === 0 &&
      settings.backgroundSettings?.gradientStart?.y === 0 &&
      settings.backgroundSettings?.gradientEnd?.x === 0
      ? 'vertical'
      : settings.backgroundSettings?.gradientStart?.x === 0 &&
          settings.backgroundSettings?.gradientStart?.y === 0 &&
          settings.backgroundSettings?.gradientEnd?.y === 0
        ? 'horizontal'
        : 'diagonal',
  );
  const [customImageUri, setCustomImageUri] = useState(settings.backgroundSettings?.customImageUri || '');

  // Color picker modal states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState('#E3F2FD');

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

  const handleChangeNusach = (newNusach: 'ashkenaz' | 'sephardic') => {
    updateSettings({ nusach: newNusach });
  };

  const handleCityChange = (city: string) => {
    const chosen_city = cities.find((x) => x.name === city || x.hebrew_name === city) || cities[0]!;
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
    setCustomImageUri(''); // Clear custom image when selecting predefined background
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: 'image' as const,
      imageUrl: background,
      customImageUri: '',
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ background: background, backgroundSettings: newBackgroundSettings });
  };

  const handlePurimToggle = (type: 'regular' | 'shushan') => {
    const newSettings = { ...purimSettings, [type]: !purimSettings[type] };
    setPurimSettings(newSettings);
    updateSettings({ purimSettings: newSettings });
  };

  const handleBackgroundModeChange = (mode: 'image' | 'solid' | 'gradient') => {
    setBackgroundMode(mode);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode,
      imageUrl: customImageUri || settings.backgroundSettings?.imageUrl || background,
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
      customImageUri,
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const handleSolidColorChange = (color: string) => {
    setSolidColor(color);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: backgroundMode,
      imageUrl: settings.backgroundSettings?.imageUrl || background,
      solidColor: color,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const openColorPicker = (colorIndex: number | null, currentColor: string) => {
    setEditingColorIndex(colorIndex);
    setTempColor(currentColor);
    setShowColorPicker(true);
  };

  const handleColorPickerSelect = (color: string) => {
    if (editingColorIndex === null) {
      // Solid color mode
      handleSolidColorChange(color);
    } else {
      // Gradient color mode
      handleGradientColorChange(editingColorIndex, color);
    }
  };

  const handleGradientColorChange = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    setGradientColors(newColors);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: backgroundMode,
      imageUrl: settings.backgroundSettings?.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const handleAddGradientColor = () => {
    const newColors = [...gradientColors, '#90CAF9'];
    setGradientColors(newColors);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: backgroundMode,
      imageUrl: settings.backgroundSettings?.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const handleRemoveGradientColor = (index: number) => {
    if (gradientColors.length <= 2) return; // Need at least 2 colors for gradient
    const newColors = gradientColors.filter((_, i) => i !== index);
    setGradientColors(newColors);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: backgroundMode,
      imageUrl: settings.backgroundSettings?.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const handleGradientDirectionChange = (direction: 'vertical' | 'horizontal' | 'diagonal') => {
    setGradientDirection(direction);
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: backgroundMode,
      imageUrl: settings.backgroundSettings?.imageUrl || background,
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(direction),
      gradientEnd: getGradientEnd(direction),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
  };

  const getGradientStart = (_direction: 'vertical' | 'horizontal' | 'diagonal') => {
    return { x: 0, y: 0 };
  };

  const getGradientEnd = (direction: 'vertical' | 'horizontal' | 'diagonal') => {
    switch (direction) {
      case 'vertical':
        return { x: 0, y: 1 };
      case 'horizontal':
        return { x: 1, y: 0 };
      case 'diagonal':
        return { x: 1, y: 1 };
      default:
        return { x: 1, y: 1 };
    }
  };

  const handlePickCustomImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert(t('error'), t('background_permission_required'));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCustomImageUri(imageUri);

        // Update background settings with custom image
        const newBackgroundSettings = {
          ...(settings.backgroundSettings || {}),
          mode: 'image' as const,
          imageUrl: imageUri,
          customImageUri: imageUri,
          solidColor,
          gradientColors,
          gradientStart: getGradientStart(gradientDirection),
          gradientEnd: getGradientEnd(gradientDirection),
        };
        updateSettings({ backgroundSettings: newBackgroundSettings });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(t('error'), t('photo_upload_failed'));
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomImageUri('');
    const newBackgroundSettings = {
      ...(settings.backgroundSettings || {}),
      mode: 'image' as const,
      imageUrl: background,
      customImageUri: '',
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ backgroundSettings: newBackgroundSettings });
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
              placeholder="synagogue-settings.json"
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
          {/* nusach */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-600">{t('nusach')}</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50">
              <Picker selectedValue={settings.nusach} onValueChange={handleChangeNusach} className="h-12">
                <Picker.Item label={t('nusach_ashkenaz')} value="ashkenaz" />
                <Picker.Item label={t('nusach_sephardic')} value="sephardic" />
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
          <View className="space-y-4">
            <Text className="text-sm font-medium text-gray-600">{t('background')}</Text>

            {/* Background Mode Selection */}
            <View className="space-y-2">
              <Text className="text-xs font-medium text-gray-500">{t('background_mode')}</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`flex-1 p-3 border rounded-lg ${backgroundMode === 'image' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  onPress={() => handleBackgroundModeChange('image')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'image' ? 'text-white font-semibold' : 'text-gray-700'}`}
                  >
                    {t('background_mode_image')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 border rounded-lg ${backgroundMode === 'solid' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  onPress={() => handleBackgroundModeChange('solid')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'solid' ? 'text-white font-semibold' : 'text-gray-700'}`}
                  >
                    {t('background_mode_solid')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 border rounded-lg ${backgroundMode === 'gradient' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  onPress={() => handleBackgroundModeChange('gradient')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'gradient' ? 'text-white font-semibold' : 'text-gray-700'}`}
                  >
                    {t('background_mode_gradient')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Background Settings */}
            {backgroundMode === 'image' && (
              <View className="space-y-3">
                {/* Custom Image Upload */}
                <View className="space-y-2">
                  <Text className="text-xs font-medium text-gray-500">{t('background_custom_image')}</Text>
                  {customImageUri ? (
                    <View className="space-y-2">
                      <View className="rounded-lg border-2 border-gray-300 overflow-hidden">
                        <Image source={{ uri: customImageUri }} className="w-full h-40" resizeMode="cover" />
                      </View>
                      <TouchableOpacity
                        className="flex-row items-center justify-center p-3 bg-red-500 rounded-lg"
                        onPress={handleRemoveCustomImage}
                      >
                        <Feather name="trash-2" size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">{t('background_remove_custom')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className="flex-row items-center justify-center p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50"
                      onPress={() => void handlePickCustomImage()}
                    >
                      <Feather name="upload" size={20} color="#3B82F6" />
                      <Text className="text-blue-600 font-semibold ml-2">{t('background_upload_custom')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Predefined Images */}
                {!customImageUri && (
                  <View className="space-y-2">
                    <Text className="text-xs font-medium text-gray-500">{t('background_choose_from_library')}</Text>
                    <Picker selectedValue={background} onValueChange={handleBackgroundChange} className="h-12">
                      {backgroundImages.map((bimg) => (
                        <Picker.Item key={bimg.label} label={bimg.label} value={bimg.value}></Picker.Item>
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            {/* Solid Color Background Settings */}
            {backgroundMode === 'solid' && (
              <View className="space-y-2">
                <Text className="text-xs font-medium text-gray-500">{t('background_solid_color')}</Text>
                <TouchableOpacity
                  className="flex-row items-center space-x-2 p-4 border border-gray-300 rounded-lg bg-gray-50"
                  onPress={() => openColorPicker(null, solidColor)}
                >
                  <View
                    className="w-16 h-16 rounded border-2 border-gray-400"
                    style={{ backgroundColor: solidColor }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-semibold">{solidColor.toUpperCase()}</Text>
                    <Text className="text-gray-500 text-sm">{t('optional')}</Text>
                  </View>
                  <Feather name="edit-2" size={20} color="#666" />
                </TouchableOpacity>
                {/* Preset Colors */}
                <View className="flex-row flex-wrap gap-2">
                  {['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'].map(
                    (color) => (
                      <TouchableOpacity
                        key={color}
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                        onPress={() => handleSolidColorChange(color)}
                      />
                    ),
                  )}
                </View>
              </View>
            )}

            {/* Gradient Background Settings */}
            {backgroundMode === 'gradient' && (
              <View className="space-y-3">
                <Text className="text-xs font-medium text-gray-500">{t('background_gradient_colors')}</Text>
                {gradientColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center space-x-2 p-3 border border-gray-300 rounded-lg bg-gray-50"
                    onPress={() => openColorPicker(index, color)}
                  >
                    <View className="w-12 h-12 rounded border-2 border-gray-400" style={{ backgroundColor: color }} />
                    <View className="flex-1">
                      <Text className="text-gray-700 font-semibold">{color.toUpperCase()}</Text>
                      <Text className="text-gray-500 text-xs">Color {index + 1}</Text>
                    </View>
                    <Feather name="edit-2" size={18} color="#666" />
                    {gradientColors.length > 2 && (
                      <TouchableOpacity
                        className="p-2 bg-red-500 rounded ml-2"
                        onPress={() => handleRemoveGradientColor(index)}
                      >
                        <Feather name="x" size={18} color="white" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity className="p-3 bg-blue-500 rounded-lg" onPress={handleAddGradientColor}>
                  <Text className="text-center text-white font-semibold">{t('background_gradient_add_color')}</Text>
                </TouchableOpacity>

                {/* Gradient Direction */}
                <View className="space-y-2">
                  <Text className="text-xs font-medium text-gray-500">{t('background_gradient_direction')}</Text>
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      className={`flex-1 p-3 border rounded-lg ${gradientDirection === 'vertical' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      onPress={() => handleGradientDirectionChange('vertical')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'vertical' ? 'text-white font-semibold' : 'text-gray-700'}`}
                      >
                        {t('background_gradient_direction_vertical')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 p-3 border rounded-lg ${gradientDirection === 'horizontal' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      onPress={() => handleGradientDirectionChange('horizontal')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'horizontal' ? 'text-white font-semibold' : 'text-gray-700'}`}
                      >
                        {t('background_gradient_direction_horizontal')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 p-3 border rounded-lg ${gradientDirection === 'diagonal' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      onPress={() => handleGradientDirectionChange('diagonal')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'diagonal' ? 'text-white font-semibold' : 'text-gray-700'}`}
                      >
                        {t('background_gradient_direction_diagonal')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Color Picker Modal */}
      <ColorPickerModal
        visible={showColorPicker}
        initialColor={tempColor}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorPickerSelect}
        title={
          editingColorIndex === null
            ? t('background_solid_color')
            : `${t('background_gradient_colors')} ${editingColorIndex + 1}`
        }
      />
    </ScrollView>
  );
};

export default GeneralSettingsTab;
