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
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useSettings } from '@context/settingsContext';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import ExternalLink from '@utils/PressableLink';
import ColorPickerModal from '@components/ColorPickerModal';
import { showAlert } from '@utils/alert';
import { isRTL } from '@utils/utils';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from '@utils/responsive';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useAutoUpdate } from '@utils/useAutoUpdate';

const checkboxStyles = {
  green: {
    iconStyle: { borderColor: 'green' },
    innerIconStyle: { borderWidth: 2 },
  },
};

const PasswordFormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return (
      <form onSubmit={(e) => e.preventDefault()} style={{ margin: 0, padding: 0 }}>
        {children}
      </form>
    );
  }
  return <View>{children}</View>;
};

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
    <View>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between bg-blue-50 rounded-lg"
      >
        <Text className="text-blue-600 font-medium" style={{ fontSize: textSize }}>
          {t('setup_help')}
        </Text>
        <Feather name={isExpanded ? 'chevron-down' : 'chevron-left'} size={iconSize} color="#2563eb" />
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
  const { settings, updateSettings, isLoading, resetToDefaults, revertToPreviousSettings, hasBackupSettings } =
    useSettings();
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const [background] = useState(settings.synagogueSettings.backgroundSettings.imageUrl || '');
  const [rtl, setRtl] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const heightScale = useHeightScale() * 0.5;
  const isSmallHeight = height < 600;

  useEffect(() => {
    void hasBackupSettings().then(setHasBackup);
  }, [hasBackupSettings]);

  const handleRevertToPrevious = () => {
    showAlert(t('revert_to_previous_settings'), t('revert_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('revert_to_previous_settings'),
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await revertToPreviousSettings();
            if (success) {
              showAlert(t('success'), t('revert_success'));
            } else {
              showAlert(t('error'), t('no_backup_found'));
            }
          } catch (error) {
            console.error('Failed to revert settings:', error);
            showAlert(t('error'), t('no_backup_found'));
          }
        },
      },
    ]);
  };

  const handleResetToDefaults = () => {
    showAlert(t('reset_to_defaults'), t('reset_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('reset_to_defaults'),
        style: 'destructive',
        onPress: async () => {
          try {
            await resetToDefaults();
            showAlert(t('success'), t('reset_success'));
            setHasBackup(true);
          } catch (error) {
            console.error('Failed to reset settings:', error);
          }
        },
      },
    ]);
  };

  const autoUpdateInterval = settings.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes ?? 1440;
  const autoUpdateEnabled = autoUpdateInterval > 0 && (settings.synagogueSettings.autoUpdateSettings?.enable ?? true);

  const autoUpdate = useAutoUpdate({
    enabled: autoUpdateEnabled,
    intervalMinutes: autoUpdateInterval,
    autoCheck: false,
  });

  const handleChangeInterval = (val: string) => {
    const mins = parseInt(val, 10);
    const safeMins = !isNaN(mins) && mins >= 0 ? mins : 1440;
    updateSettings({
      synagogueSettings: {
        ...settings.synagogueSettings,
        autoUpdateSettings: {
          enable: safeMins > 0,
          checkIntervalMinutes: safeMins,
        },
      },
    });
  };

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
  const checkboxSize = Math.round(25 * heightScale);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  // New background settings state
  const [backgroundMode, setBackgroundMode] = useState(settings.synagogueSettings.backgroundSettings.mode || 'image');
  const [solidColor, setSolidColor] = useState(settings.synagogueSettings.backgroundSettings.solidColor || '#E3F2FD');
  const [gradientColors, setGradientColors] = useState(
    settings.synagogueSettings.backgroundSettings.gradientColors || ['#E3F2FD', '#BBDEFB', '#90CAF9'],
  );
  const [gradientDirection, setGradientDirection] = useState<'vertical' | 'horizontal' | 'diagonal'>(
    settings.synagogueSettings.backgroundSettings.gradientStart?.x === 0 &&
      settings.synagogueSettings.backgroundSettings.gradientStart?.y === 0 &&
      settings.synagogueSettings.backgroundSettings.gradientEnd?.x === 0
      ? 'vertical'
      : settings.synagogueSettings.backgroundSettings.gradientStart?.x === 0 &&
          settings.synagogueSettings.backgroundSettings.gradientStart?.y === 0 &&
          settings.synagogueSettings.backgroundSettings.gradientEnd?.y === 0
        ? 'horizontal'
        : 'diagonal',
  );
  const [customImageUri, setCustomImageUri] = useState(
    settings.synagogueSettings.backgroundSettings.customImageUri || '',
  );

  // Color picker modal states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState('#E3F2FD');

  const handleChangeLanguage = async (newLanguage: 'he' | 'en') => {
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, language: newLanguage } });
    if (i18n) await i18n.changeLanguage(newLanguage);
    const isRTL = newLanguage === 'he';
    I18nManager.forceRTL(isRTL);
  };

  const handleChangeNusach = (newNusach: 'ashkenaz' | 'sephardic') => {
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, nusach: newNusach } });
  };

  const handleBackgroundModeChange = (mode: 'image' | 'solid' | 'gradient') => {
    setBackgroundMode(mode);
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode,
      imageUrl: customImageUri || settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
      customImageUri,
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
  };

  const handleSolidColorChange = (color: string) => {
    setSolidColor(color);
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode: backgroundMode,
      imageUrl: settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor: color,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
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
      ...settings.synagogueSettings.backgroundSettings,
      mode: backgroundMode,
      imageUrl: settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
  };

  const handleAddGradientColor = () => {
    const newColors = [...gradientColors, '#90CAF9'];
    setGradientColors(newColors);
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode: backgroundMode,
      imageUrl: settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
  };

  const handleRemoveGradientColor = (index: number) => {
    if (gradientColors.length <= 2) return; // Need at least 2 colors for gradient
    const newColors = gradientColors.filter((_: any, i: number) => i !== index);
    setGradientColors(newColors);
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode: backgroundMode,
      imageUrl: settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor,
      gradientColors: newColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
  };

  const handleGradientDirectionChange = (direction: 'vertical' | 'horizontal' | 'diagonal') => {
    setGradientDirection(direction);
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode: backgroundMode,
      imageUrl: settings.synagogueSettings.backgroundSettings.imageUrl || background,
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(direction),
      gradientEnd: getGradientEnd(direction),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
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
          ...settings.synagogueSettings.backgroundSettings,
          mode: 'image' as const,
          imageUrl: imageUri,
          customImageUri: imageUri,
          solidColor,
          gradientColors,
          gradientStart: getGradientStart(gradientDirection),
          gradientEnd: getGradientEnd(gradientDirection),
        };
        updateSettings({
          synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(t('error'), t('photo_upload_failed'));
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomImageUri('');
    const newBackgroundSettings = {
      ...settings.synagogueSettings.backgroundSettings,
      mode: 'image' as const,
      imageUrl: background,
      customImageUri: '',
      solidColor,
      gradientColors,
      gradientStart: getGradientStart(gradientDirection),
      gradientEnd: getGradientEnd(gradientDirection),
    };
    updateSettings({ synagogueSettings: { ...settings.synagogueSettings, backgroundSettings: newBackgroundSettings } });
  };

  const handleFooterEnableChange = (enable: boolean) => {
    const currentFooter = settings.synagogueSettings.footerSettings;
    const newFooterSettings = {
      ...currentFooter,
      enable,
      text: currentFooter?.text || '',
    };
    updateSettings({
      synagogueSettings: {
        ...settings.synagogueSettings,
        footerSettings: newFooterSettings,
      },
    });
  };

  const handleFooterTextChange = (text: string) => {
    const currentFooter = settings.synagogueSettings.footerSettings;
    const newFooterSettings = {
      ...currentFooter,
      enable: currentFooter?.enable ?? true,
      text,
    };
    updateSettings({
      synagogueSettings: {
        ...settings.synagogueSettings,
        footerSettings: newFooterSettings,
      },
    });
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
          {/* Name - Full Width */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('synagogue_name')}
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              value={settings.synagogueSettings.name}
              onChangeText={(name) => updateSettings({ synagogueSettings: { ...settings.synagogueSettings, name } })}
              placeholder="Enter Synagogue Name"
            />
          </View>

          {/* Language and Nusach - Side by Side on Narrow Screens */}
          <View className={`${isSmallHeight ? (rtl ? 'flex-row-reverse' : 'flex-row') : ''}`} style={{ gap: padding }}>
            {/* Language */}
            <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('language')}
              </Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker
                  selectedValue={settings.synagogueSettings.language}
                  onValueChange={(value) => void handleChangeLanguage(value)}
                  style={{ height: pickerHeight }}
                >
                  <Picker.Item label="English" value="en" />
                  <Picker.Item label="עברית" value="he" />
                </Picker>
              </View>
            </View>
            {/* nusach */}
            <View className={isSmallHeight ? 'flex-1' : 'w-full'} style={{ gap: smallPadding }}>
              <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
                {t('nusach')}
              </Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker
                  selectedValue={settings.synagogueSettings.nusach}
                  onValueChange={handleChangeNusach}
                  style={{ height: pickerHeight }}
                >
                  <Picker.Item label={t('nusach_ashkenaz')} value="ashkenaz" />
                  <Picker.Item label={t('nusach_sephardic')} value="sephardic" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Thin Footer Section - Single Line */}
          <View
            className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 p-2.5"
            style={{ gap: smallPadding }}
          >
            <BouncyCheckbox
              size={checkboxSize}
              isChecked={settings.synagogueSettings.footerSettings?.enable ?? false}
              fillColor="green"
              iconStyle={checkboxStyles.green.iconStyle}
              innerIconStyle={checkboxStyles.green.innerIconStyle}
              text={t('enable_footer')}
              textComponent={
                <Text
                  className="text-gray-700 font-medium"
                  style={{ fontSize: textSize, marginHorizontal: smallPadding }}
                >
                  {t('enable_footer')}
                </Text>
              }
              onPress={(value) => handleFooterEnableChange(value)}
            />

            <TextInput
              className={`flex-1 border rounded-lg ${
                settings.synagogueSettings.footerSettings?.enable
                  ? 'border-gray-300 bg-white text-gray-800'
                  : 'border-gray-200 bg-gray-100 text-gray-400'
              }`}
              style={{ padding: smallPadding * 1.2, fontSize: textSize }}
              value={settings.synagogueSettings.footerSettings?.text || ''}
              onChangeText={handleFooterTextChange}
              editable={settings.synagogueSettings.footerSettings?.enable ?? false}
              placeholder={t('footer_text_placeholder')}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <HelpSection />
          {/* gist sha512 */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('gist_sha')}
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              value={settings.githubSettings.gistId}
              onChangeText={(gistId) => updateSettings({ githubSettings: { ...settings.githubSettings, gistId } })}
            />
          </View>
          {/* gistFileName */}
          {/* <View style={{ gap: smallPadding }}>
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
          </View> */}
          {/* access */}
          <View style={{ gap: smallPadding }}>
            <Text className="font-medium text-gray-600" style={{ fontSize: labelSize }}>
              {t('gist_key')}
            </Text>
            <PasswordFormWrapper>
              <TextInput
                className="w-full border border-gray-300 rounded-lg bg-gray-50"
                style={{ padding: smallPadding * 1.5, fontSize: textSize }}
                value={settings.githubSettings.githubKey}
                onChangeText={(githubKey) =>
                  updateSettings({ githubSettings: { ...settings.githubSettings, githubKey } })
                }
                secureTextEntry={true}
                autoComplete="off"
                textContentType="password"
              />
            </PasswordFormWrapper>
          </View>

          {/* Image Upload API Key (imgbb) - used e.g. by deceased images */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <View className="flex-row items-center justify-between" style={{ marginBottom: smallPadding }}>
              <Text className="font-bold text-gray-600" style={{ fontSize: labelSize }}>
                {t('imgbb_api_key')}
              </Text>
              <ExternalLink url="https://api.imgbb.com/" label={t('imgbb_get_key')} />
            </View>
            <Text className="text-gray-500" style={{ fontSize: labelSize, marginBottom: smallPadding * 1.5 }}>
              {t('imgbb_api_key_description')}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg bg-gray-50"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              placeholder={t('imgbb_api_key_placeholder')}
              value={settings.deceasedSettings.imgbbApiKey || ''}
              onChangeText={(value) =>
                updateSettings({ deceasedSettings: { ...settings.deceasedSettings, imgbbApiKey: value } })
              }
              autoCapitalize="none"
              autoCorrect={false}
            />
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
                  {gradientColors.map((color: string, index: number) => (
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

      {/* Advanced Settings Toggle Button */}
      <TouchableOpacity
        onPress={() => setShowAdvanced(!showAdvanced)}
        className="flex-row items-center justify-between bg-gray-100 border border-gray-300 rounded-xl active:opacity-80"
        style={{ padding, marginTop: margin * 1.5 }}
      >
        <View className="flex-row items-center" style={{ gap: smallPadding }}>
          <Feather name="settings" size={iconSize} color="#4b5563" />
          <Text className="font-bold text-gray-800" style={{ fontSize: labelSize * 1.1 }}>
            {t('advanced_settings')}
          </Text>
        </View>
        <Feather name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={iconSize} color="#4b5563" />
      </TouchableOpacity>

      {/* Advanced Settings Content (Update, Update Interval, Recovery) */}
      {showAdvanced && (
        <View style={{ gap: margin, marginTop: smallPadding }}>
          {/* App Updates Section */}
          <View className="border border-blue-200 bg-blue-50/70 rounded-xl" style={{ padding, gap: smallPadding }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-blue-900" style={{ fontSize: labelSize * 1.1 }}>
                {t('app_updates')}
              </Text>
              <View className="bg-blue-200/80 px-2 py-0.5 rounded-full">
                <Text className="text-blue-800 font-semibold" style={{ fontSize: textSize * 0.8 }}>
                  {autoUpdate.currentBuild.version.startsWith('#') || autoUpdate.currentBuild.version.startsWith('v')
                    ? autoUpdate.currentBuild.version
                    : `v${autoUpdate.currentBuild.version}`}
                </Text>
              </View>
            </View>

            {autoUpdate.currentBuild.buildTime && (
              <Text className="text-gray-500" style={{ fontSize: textSize * 0.85 }}>
                {t('app_build_time')}:{' '}
                {new Date(autoUpdate.currentBuild.buildTime).toLocaleString(i18n.language === 'he' ? 'he-IL' : 'en-US')}
              </Text>
            )}

            {/* Update available banner */}
            {autoUpdate.hasUpdate ? (
              <View className="bg-green-100 border border-green-400 p-3 rounded-lg my-1 gap-2">
                <Text className="text-green-800 font-bold" style={{ fontSize: textSize }}>
                  🎉 {t('update_available')}{' '}
                  {autoUpdate.updateInfo?.remoteVersion ? `(v${autoUpdate.updateInfo.remoteVersion})` : ''}
                </Text>
                <TouchableOpacity
                  className="bg-green-600 rounded-lg items-center self-start"
                  style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                  onPress={() => {
                    void autoUpdate.applyUpdateNow();
                  }}
                >
                  <Text className="text-white font-medium" style={{ fontSize: textSize }}>
                    {t('update_and_reload')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-600" style={{ fontSize: textSize * 0.9 }}>
                  {t('app_up_to_date')}
                </Text>
                {autoUpdate.lastChecked && (
                  <Text className="text-gray-400" style={{ fontSize: textSize * 0.8 }}>
                    ({t('last_checked')}: {autoUpdate.lastChecked.toLocaleTimeString()})
                  </Text>
                )}
              </View>
            )}

            {/* Check for updates manual button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-lg items-center self-start flex-row gap-2"
              style={{ paddingHorizontal: padding, paddingVertical: smallPadding, marginTop: smallPadding / 2 }}
              onPress={() => {
                void autoUpdate.checkNow();
              }}
              disabled={autoUpdate.isChecking}
            >
              {autoUpdate.isChecking && <ActivityIndicator size="small" color="#ffffff" />}
              <Text className="text-white font-medium" style={{ fontSize: textSize }}>
                {autoUpdate.isChecking ? t('checking_for_updates') : t('check_for_updates')}
              </Text>
            </TouchableOpacity>

            <View className="h-px bg-blue-200 my-2" />

            {/* Update Check Interval Picker with Don't Check option */}
            <View className="mt-1">
              <Text className="font-semibold text-gray-800" style={{ fontSize: textSize }}>
                {t('update_check_interval')}
              </Text>
              <Text className="text-gray-500 mb-2" style={{ fontSize: textSize * 0.85 }}>
                {t('auto_update_description')}
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={
                    settings.synagogueSettings.autoUpdateSettings?.enable === false ||
                    settings.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes === 0
                      ? '0'
                      : String(settings.synagogueSettings.autoUpdateSettings?.checkIntervalMinutes ?? 1440)
                  }
                  onValueChange={(val) => handleChangeInterval(val)}
                  style={{ height: 44 }}
                >
                  <Picker.Item label={t('interval_hour')} value="60" />
                  <Picker.Item label={t('interval_day')} value="1440" />
                  <Picker.Item label={t('interval_week')} value="10080" />
                  <Picker.Item label={t('interval_month')} value="43200" />
                  <Picker.Item label={t('interval_never')} value="0" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Revert to Previous Settings */}
          {hasBackup && (
            <View className="border border-amber-300 bg-amber-50 rounded-xl" style={{ padding, gap: smallPadding }}>
              <Text className="font-bold text-amber-800" style={{ fontSize: labelSize * 1.1 }}>
                {t('revert_to_previous_settings')}
              </Text>
              <Text className="text-gray-600" style={{ fontSize: textSize * 0.9 }}>
                {t('revert_description')}
              </Text>
              <TouchableOpacity
                className="bg-amber-600 rounded-lg items-center self-start"
                style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                onPress={handleRevertToPrevious}
              >
                <Text className="text-white font-medium" style={{ fontSize: textSize }}>
                  {t('revert_to_previous_settings')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Danger Zone: Reset to Defaults */}
          <View className="border border-red-200 bg-red-50 rounded-xl" style={{ padding, gap: smallPadding }}>
            <Text className="font-bold text-red-700" style={{ fontSize: labelSize * 1.1 }}>
              {t('reset_to_defaults')}
            </Text>
            <Text className="text-gray-600" style={{ fontSize: textSize * 0.9 }}>
              {t('reset_description')}
            </Text>
            <TouchableOpacity
              className="bg-red-600 rounded-lg items-center self-start"
              style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
              onPress={handleResetToDefaults}
            >
              <Text className="text-white font-medium" style={{ fontSize: textSize }}>
                {t('reset_to_defaults')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
