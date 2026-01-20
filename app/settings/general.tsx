import { useEffect, useState } from 'react';
import {
  View,
  Text,
  I18nManager,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  useWindowDimensions,
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
import { isRTL } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

const HelpSection = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const link1 = 'https://github.com';
  const link2 = 'https://gist.github.com';
  const link3 = 'https://github.com/settings/personal-access-tokens/new';
  const heightScale = useHeightScale();

  // Responsive sizes
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('medium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);
  const imageHeight = Math.round(160 * heightScale);

  return (
    <View style={{ marginBottom: margin }}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between bg-blue-50 rounded-lg"
        style={{ padding: smallPadding * 1.5 }}
      >
        <Text className="text-blue-600 font-medium" style={{ fontSize: textSize }}>
          {t('setup_help')}
        </Text>
        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={iconSize} color="#2563eb" />
      </TouchableOpacity>

      {/* eslint-disable @typescript-eslint/no-require-imports */}
      {isExpanded && (
        <View style={{ marginTop: smallPadding, gap: margin }}>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_1')} <ExternalLink url={link1} /> {t('help_step_1_1')}
            </Text>
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_2')} <ExternalLink url={link2} />
              {t('help_step_2_1')}
            </Text>
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_3')}
            </Text>
            <Text className="text-gray-700 font-bold" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_3_1')}
            </Text>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_3_2')}
            </Text>
            <Image
              source={require('../../assets/help/help3.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
              resizeMode="contain"
            />
          </View>

          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_4')}
            </Text>
            <Image
              source={require('../../assets/help/help4.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
              resizeMode="contain"
            />
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_5')}
            </Text>
            <Image
              source={require('../../assets/help/help5.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
              resizeMode="contain"
            />
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_6')} <ExternalLink url={link3} />
            </Text>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_6_1')}
            </Text>
            <Image
              source={require('../../assets/help/help6.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
              resizeMode="contain"
            />
          </View>
          <View className="w-full bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_7')}
            </Text>
            <Image
              source={require('../../assets/help/help7.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight * 1.2 }}
              resizeMode="contain"
            />
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_8')}
            </Text>
            <Image
              source={require('../../assets/help/help8.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
              resizeMode="contain"
            />
          </View>
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="text-gray-700" style={{ fontSize: textSize, marginBottom: smallPadding }}>
              {t('help_step_9')}
            </Text>
            <Image
              source={require('../../assets/help/help9.png')}
              className="w-full rounded-lg"
              style={{ height: imageHeight }}
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
  const { height } = useWindowDimensions();
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
  const [rtl, setRtl] = useState(false);
  const heightScale = useHeightScale() * 0.5;
  const isSmallHeight = height < 600;

  // Responsive sizes with height adjustment
  const labelSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('small') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);
  const pickerHeight = Math.round(48 * heightScale);
  const imageHeight = Math.round(160 * heightScale);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

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
    updateSettings({ backgroundSettings: newBackgroundSettings });
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
      <View style={{ padding }}>
        <View style={{ gap: margin }}>
          <View
            className={`${isSmallHeight ? 'flex-row' : ''} items-center ${rtl ? 'flex-row-reverse' : ''}`}
            style={{ gap: padding }}
          >
            {/* Name */}
            <View className="flex-1" style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('synagogue_name')}
              </Text>
              <TextInput
                className="w-full border border-gray-300 rounded-lg bg-gray-50"
                style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                value={synagogueName}
                onChangeText={handleSynagogueName}
                placeholder="Enter Synagogue Name"
              />
            </View>
            {/* Language */}
            <View className="flex-1" style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('language')}
              </Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker
                  selectedValue={settings.language}
                  onValueChange={(value) => void handleChangeLanguage(value)}
                  style={{ height: pickerHeight }}
                >
                  <Picker.Item label="English" value="en" />
                  <Picker.Item label="עברית" value="he" />
                </Picker>
              </View>
            </View>
            {/* nusach */}
            <View className="flex-1" style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('nusach')}
              </Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker
                  selectedValue={settings.nusach}
                  onValueChange={handleChangeNusach}
                  style={{ height: pickerHeight }}
                >
                  <Picker.Item label={t('nusach_ashkenaz')} value="ashkenaz" />
                  <Picker.Item label={t('nusach_sephardic')} value="sephardic" />
                </Picker>
              </View>
            </View>
          </View>
          {/* <HelpSection /> */}
          {/* gist sha512 */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('gist_sha')}
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              value={gistId}
              onChangeText={handleGistId}
            />
          </View>
          {/* gistFileName */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('gist_file_key')}
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              value={gistFileName}
              onChangeText={handleGistFileName}
              placeholder="synagogue-settings.json"
            />
          </View>
          {/* access */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('gist_key')}
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              value={githubKeyUrl}
              onChangeText={handleGithubKey}
              secureTextEntry={true}
            />
          </View>
          {/* Location */}
          <View
            className={`${isSmallHeight ? 'flex-row' : ''} items-center ${rtl ? 'flex-row-reverse' : ''}`}
            style={{ gap: padding }}
          >
            <View className="flex-1" style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('location')}
              </Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={handleCityChange}
                  style={{ height: pickerHeight }}
                >
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
            {/* olson */}
            <View className="flex-1" style={{ gap: smallPadding }}>
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
          <View className={isSmallHeight ? 'flex-row' : ''} style={{ gap: padding }}>
            <View className="flex-1" style={{ gap: smallPadding }}>
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
            <View className="flex-1" style={{ gap: smallPadding }}>
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
            <View className="flex-1" style={{ gap: smallPadding }}>
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
          {/* background */}
          <View style={{ gap: margin }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('background')}
            </Text>

            {/* Background Mode Selection */}
            <View style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                {t('background_mode')}
              </Text>
              <View className="flex-row" style={{ gap: smallPadding }}>
                <TouchableOpacity
                  className={`flex-1 border rounded-lg ${backgroundMode === 'image' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  style={{ padding: smallPadding * 1.5 }}
                  onPress={() => handleBackgroundModeChange('image')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'image' ? 'text-white font-semibold' : 'text-gray-700'}`}
                    style={{ fontSize: textSize }}
                  >
                    {t('background_mode_image')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 border rounded-lg ${backgroundMode === 'solid' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  style={{ padding: smallPadding * 1.5 }}
                  onPress={() => handleBackgroundModeChange('solid')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'solid' ? 'text-white font-semibold' : 'text-gray-700'}`}
                    style={{ fontSize: textSize }}
                  >
                    {t('background_mode_solid')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 border rounded-lg ${backgroundMode === 'gradient' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  style={{ padding: smallPadding * 1.5 }}
                  onPress={() => handleBackgroundModeChange('gradient')}
                >
                  <Text
                    className={`text-center ${backgroundMode === 'gradient' ? 'text-white font-semibold' : 'text-gray-700'}`}
                    style={{ fontSize: textSize }}
                  >
                    {t('background_mode_gradient')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Background Settings */}
            {backgroundMode === 'image' && (
              <View style={{ gap: smallPadding * 1.5 }}>
                {/* Custom Image Upload */}
                <View style={{ gap: smallPadding }}>
                  <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                    {t('background_custom_image')}
                  </Text>
                  {customImageUri ? (
                    <View style={{ gap: smallPadding }}>
                      <View className="rounded-lg border-2 border-gray-300 overflow-hidden">
                        <Image
                          source={{ uri: customImageUri }}
                          className="w-full"
                          style={{ height: imageHeight }}
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity
                        className="flex-row items-center justify-center bg-red-500 rounded-lg"
                        style={{ padding: smallPadding * 1.5 }}
                        onPress={handleRemoveCustomImage}
                      >
                        <Feather name="trash-2" size={iconSize} color="white" />
                        <Text
                          className="text-white font-semibold"
                          style={{ fontSize: buttonTextSize, marginLeft: smallPadding }}
                        >
                          {t('background_remove_custom')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className="flex-row items-center justify-center border-2 border-dashed border-blue-400 rounded-lg bg-blue-50"
                      style={{ padding }}
                      onPress={() => void handlePickCustomImage()}
                    >
                      <Feather name="upload" size={iconSize} color="#3B82F6" />
                      <Text
                        className="text-blue-600 font-semibold"
                        style={{ fontSize: buttonTextSize, marginLeft: smallPadding }}
                      >
                        {t('background_upload_custom')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Predefined Images */}
                {!customImageUri && (
                  <View style={{ gap: smallPadding }}>
                    <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                      {t('background_choose_from_library')}
                    </Text>
                    <Picker
                      selectedValue={background}
                      onValueChange={handleBackgroundChange}
                      style={{ height: pickerHeight }}
                    >
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
              <View style={{ gap: smallPadding }}>
                <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                  {t('background_solid_color')}
                </Text>
                <TouchableOpacity
                  className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50"
                  style={{ padding, gap: smallPadding }}
                  onPress={() => openColorPicker(null, solidColor)}
                >
                  <View
                    className="rounded border-2 border-gray-400"
                    style={{ backgroundColor: solidColor, width: 64 * heightScale, height: 64 * heightScale }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-semibold" style={{ fontSize: textSize }}>
                      {solidColor.toUpperCase()}
                    </Text>
                    <Text className="text-gray-500" style={{ fontSize: labelSize }}>
                      {t('optional')}
                    </Text>
                  </View>
                  <Feather name="edit-2" size={iconSize} color="#666" />
                </TouchableOpacity>
                {/* Preset Colors */}
                <View className="flex-row flex-wrap" style={{ gap: smallPadding }}>
                  {['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'].map(
                    (color) => (
                      <TouchableOpacity
                        key={color}
                        className="rounded border border-gray-300"
                        style={{ backgroundColor: color, width: 40 * heightScale, height: 40 * heightScale }}
                        onPress={() => handleSolidColorChange(color)}
                      />
                    ),
                  )}
                </View>
              </View>
            )}

            {/* Gradient Background Settings */}
            {backgroundMode === 'gradient' && (
              <View style={{ gap: smallPadding * 1.5 }}>
                <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                  {t('background_gradient_colors')}
                </Text>
                <View className="flex-row" style={{ gap: padding }}>
                  {gradientColors.map((color, index) => (
                    <View
                      key={index}
                      className="flex-1 flex-row items-stretch rounded-lg overflow-hidden border border-gray-300"
                    >
                      <TouchableOpacity
                        className="flex-1 items-center justify-center"
                        style={{ backgroundColor: color, paddingVertical: padding }}
                        onPress={() => openColorPicker(index, color)}
                      >
                        <Feather name="edit-2" size={iconSize} color="rgba(255,255,255,0.8)" />
                      </TouchableOpacity>
                      {gradientColors.length > 2 && (
                        <TouchableOpacity
                          className="bg-red-500 items-center justify-center"
                          style={{ paddingHorizontal: smallPadding * 1.5 }}
                          onPress={() => handleRemoveGradientColor(index)}
                        >
                          <Feather name="x" size={iconSize * 0.8} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg"
                  style={{ padding: smallPadding * 1.5 }}
                  onPress={handleAddGradientColor}
                >
                  <Text className="text-center text-white font-semibold" style={{ fontSize: buttonTextSize }}>
                    {t('background_gradient_add_color')}
                  </Text>
                </TouchableOpacity>

                {/* Gradient Direction */}
                <View style={{ gap: smallPadding }}>
                  <Text className="font-medium text-gray-500" style={{ fontSize: labelSize * 0.85 }}>
                    {t('background_gradient_direction')}
                  </Text>
                  <View className="flex-row" style={{ gap: smallPadding }}>
                    <TouchableOpacity
                      className={`flex-1 border rounded-lg ${gradientDirection === 'vertical' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      style={{ padding: smallPadding * 1.5 }}
                      onPress={() => handleGradientDirectionChange('vertical')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'vertical' ? 'text-white font-semibold' : 'text-gray-700'}`}
                        style={{ fontSize: textSize }}
                      >
                        {t('background_gradient_direction_vertical')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 border rounded-lg ${gradientDirection === 'horizontal' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      style={{ padding: smallPadding * 1.5 }}
                      onPress={() => handleGradientDirectionChange('horizontal')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'horizontal' ? 'text-white font-semibold' : 'text-gray-700'}`}
                        style={{ fontSize: textSize }}
                      >
                        {t('background_gradient_direction_horizontal')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 border rounded-lg ${gradientDirection === 'diagonal' ? 'bg-blue-500 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      style={{ padding: smallPadding * 1.5 }}
                      onPress={() => handleGradientDirectionChange('diagonal')}
                    >
                      <Text
                        className={`text-center ${gradientDirection === 'diagonal' ? 'text-white font-semibold' : 'text-gray-700'}`}
                        style={{ fontSize: textSize }}
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
