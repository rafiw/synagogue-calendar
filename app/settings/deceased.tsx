import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { showAlert, showConfirm } from '../../utils/alert';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useState, useEffect } from 'react';
import { DeceasedPerson, DeceasedSettings } from '../../utils/defs';
import { DatePicker } from '../../components/DatePicker';
import { HDate } from '@hebcal/core';
import * as ImagePicker from 'expo-image-picker';
import ExternalLink from '../../utils/PressableLink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

// Local storage key for image delete URLs (not synced to GitHub for security)
const DELETE_URLS_STORAGE_KEY = 'deceased_image_delete_urls';

// Helper functions for locally storing imgbb delete URLs
const getLocalDeleteUrls = async (): Promise<Record<string, string>> => {
  try {
    const stored = await AsyncStorage.getItem(DELETE_URLS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveLocalDeleteUrl = async (personId: string, deleteUrl: string): Promise<void> => {
  try {
    const urls = await getLocalDeleteUrls();
    urls[personId] = deleteUrl;
    await AsyncStorage.setItem(DELETE_URLS_STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error('Error saving delete URL locally:', error);
  }
};

const getLocalDeleteUrl = async (personId: string): Promise<string | null> => {
  try {
    const urls = await getLocalDeleteUrls();
    return urls[personId] || null;
  } catch {
    return null;
  }
};

const removeLocalDeleteUrl = async (personId: string): Promise<void> => {
  try {
    const urls = await getLocalDeleteUrls();
    delete urls[personId];
    await AsyncStorage.setItem(DELETE_URLS_STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error('Error removing delete URL locally:', error);
  }
};

// Default imgbb API key - users can override in settings
const DEFAULT_IMGBB_API_KEY = '41e08868c7e489e384b456258277b511';

interface UploadResult {
  url: string;
  deleteUrl: string;
}

const uploadImageToImgbb = async (imageUri: string, apiKey: string): Promise<UploadResult | null> => {
  const effectiveApiKey = apiKey || DEFAULT_IMGBB_API_KEY;

  if (!effectiveApiKey) {
    showAlert(
      'Configuration Required',
      'Please add your imgbb API key in settings to enable image uploads. Get a free key at https://api.imgbb.com/',
    );
    return null;
  }

  try {
    // Read the image as base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];

          if (!base64data) {
            reject(new Error('Failed to extract base64 data from image'));
            return;
          }

          const formData = new FormData();
          formData.append('image', base64data);

          const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${effectiveApiKey}`, {
            method: 'POST',
            body: formData,
          });

          const result = await uploadResponse.json();

          if (result.success) {
            resolve({
              url: result.data.url,
              deleteUrl: result.data.delete_url,
            });
          } else {
            reject(new Error(result.error?.message || 'Upload failed'));
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const deleteImageFromImgbb = async (deleteUrl: string): Promise<boolean> => {
  if (!deleteUrl) return false;

  try {
    // imgbb delete URL opens a page that confirms deletion
    // We just need to fetch it to trigger the deletion
    await fetch(deleteUrl);
    return true;
  } catch (error) {
    console.error('Error deleting image from imgbb:', error);
    return false;
  }
};

// Date Input Component - Platform Specific (auto-resolved by React Native)
const DateInputComponent = DatePicker;

interface DeceasedPersonFormProps {
  person?: DeceasedPerson;
  onSave: (person: DeceasedPerson) => void;
  onCancel: () => void;
  imgbbApiKey: string;
}

const DeceasedPersonForm = ({ person, onSave, onCancel, imgbbApiKey }: DeceasedPersonFormProps) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(person?.name || '');
  const [isMale, setIsMale] = useState<boolean | undefined>(person?.isMale || false);
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth || '');
  const [dateOfDeath, setDateOfDeath] = useState(person?.dateOfDeath || '');
  const [hebrewDateOfBirth, setHebrewDateOfBirth] = useState(person?.hebrewDateOfBirth || '');
  const [hebrewDateOfDeath, setHebrewDateOfDeath] = useState(person?.hebrewDateOfDeath || '');
  const [template, setTemplate] = useState<'simple' | 'card' | 'photo'>(person?.template || 'simple');
  const [photoUrl, setPhotoUrl] = useState(person?.photo || '');
  const [photoDeleteUrl, setPhotoDeleteUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [personId] = useState(() => person?.id || Date.now().toString());
  const [tribute, setTribute] = useState(person?.tribute || '');
  const heightScale = useHeightScale();

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const labelSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const smallLabelSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('small') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(12) * heightScale);

  // Load delete URL from local storage when editing
  useEffect(() => {
    if (person?.id) {
      getLocalDeleteUrl(person.id).then((url) => {
        if (url) setPhotoDeleteUrl(url);
      });
    }
  }, [person?.id]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert(t('error'), t('photo_permission_required'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const uploadResult = await uploadImageToImgbb(result.assets[0].uri, imgbbApiKey);
        setIsUploading(false);

        if (uploadResult) {
          // If there was a previous uploaded image, delete it from imgbb and local storage
          if (photoDeleteUrl) {
            deleteImageFromImgbb(photoDeleteUrl);
            await removeLocalDeleteUrl(personId);
          }
          setPhotoUrl(uploadResult.url);
          setPhotoDeleteUrl(uploadResult.deleteUrl);
          // Save the new delete URL locally (not synced to GitHub for security)
          await saveLocalDeleteUrl(personId, uploadResult.deleteUrl);
        } else {
          showAlert(t('error'), t('photo_upload_failed'));
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Error picking image:', error);
      showAlert(t('error'), t('photo_upload_failed'));
    }
  };

  const handleRemovePhoto = async () => {
    // Delete the image from imgbb if it was uploaded there
    if (photoDeleteUrl) {
      deleteImageFromImgbb(photoDeleteUrl);
      await removeLocalDeleteUrl(personId);
    }
    setPhotoUrl('');
    setPhotoDeleteUrl('');
  };

  // Helper function to convert Gregorian date to Hebrew date string
  const convertToHebrewDate = (gregorianDateString: string): string | null => {
    if (!gregorianDateString) return null;

    try {
      const gregorianDate = new Date(gregorianDateString);
      const hdate = new HDate(gregorianDate);
      const locale = i18n.language === 'he' ? 'he' : 'en';

      return locale === 'he' ? hdate.renderGematriya() : hdate.render(locale);
    } catch (error) {
      console.error('Error converting date to Hebrew:', error);
      return null;
    }
  };

  // Auto-populate Hebrew date of birth when Gregorian date changes
  useEffect(() => {
    const hebrewDate = convertToHebrewDate(dateOfBirth);
    if (hebrewDate) {
      setHebrewDateOfBirth(hebrewDate);
    }
  }, [dateOfBirth, i18n.language]);

  // Auto-populate Hebrew date of death when Gregorian date changes
  useEffect(() => {
    const hebrewDate = convertToHebrewDate(dateOfDeath);
    if (hebrewDate) {
      setHebrewDateOfDeath(hebrewDate);
    }
  }, [dateOfDeath, i18n.language]);

  const handleSave = () => {
    if (!name.trim()) {
      showAlert(t('error'), t('please_fill_in_all_required_fields'));
      return;
    }

    const newPerson: DeceasedPerson = {
      id: personId,
      name: name.trim(),
      isMale: isMale || false,
      template: template || 'simple',
    };

    // Only include optional fields if they have values
    if (dateOfBirth?.trim()) {
      newPerson.dateOfBirth = dateOfBirth.trim();
    }
    if (hebrewDateOfBirth?.trim()) {
      newPerson.hebrewDateOfBirth = hebrewDateOfBirth.trim();
    }
    if (dateOfDeath?.trim()) {
      newPerson.dateOfDeath = dateOfDeath.trim();
    }
    if (hebrewDateOfDeath?.trim()) {
      newPerson.hebrewDateOfDeath = hebrewDateOfDeath.trim();
    }
    if (photoUrl?.trim()) {
      newPerson.photo = photoUrl.trim();
    }
    if (tribute?.trim()) {
      newPerson.tribute = tribute.trim();
    }

    onSave(newPerson);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <View className="bg-white rounded-lg shadow-sm" style={{ padding, marginBottom: margin }}>
      <Text className="font-bold" style={{ fontSize: titleSize, marginBottom: margin }}>
        {person ? t('deceased_edit') : t('deceased_add_person')}
      </Text>

      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
          {t('deceased_name')} <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg"
          style={{ padding: smallPadding * 1.5, fontSize: textSize }}
          placeholder={t('deceased_name')}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Gender toggle */}
      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
          {t('deceased_gender')}{' '}
          <Text className="text-gray-400" style={{ fontSize: smallLabelSize }}>
            ({t('optional')})
          </Text>
        </Text>
        <View className="flex-row" style={{ gap: smallPadding }}>
          <TouchableOpacity
            onPress={() => setIsMale(true)}
            className={`flex-1 rounded-lg border ${
              isMale === true ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
            }`}
            style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
          >
            <Text
              className={`text-center ${isMale === true ? 'text-white' : 'text-gray-700'}`}
              style={{ fontSize: textSize }}
            >
              {t('deceased_gender_male')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsMale(false)}
            className={`flex-1 rounded-lg border ${
              isMale === false ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
            }`}
            style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
          >
            <Text
              className={`text-center ${isMale === false ? 'text-white' : 'text-gray-700'}`}
              style={{ fontSize: textSize }}
            >
              {t('deceased_gender_female')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-600" style={{ fontSize: smallLabelSize, marginBottom: smallPadding / 2 }}>
          {t('deceased_date_of_birth')} (YYYY-MM-DD) <Text className="text-gray-400">({t('optional')})</Text>
        </Text>
        <DateInputComponent
          label=""
          value={dateOfBirth}
          format="YYYY-MM-DD"
          onChange={(value) => setDateOfBirth(value)}
        />
      </View>

      <View style={{ marginBottom: margin }}>
        <View className="flex-row items-center justify-between" style={{ marginBottom: smallPadding / 2 }}>
          <Text className="text-gray-600" style={{ fontSize: smallLabelSize }}>
            {t('deceased_date_of_birth')} ({t('hebrew')}) <Text className="text-gray-400">({t('optional')})</Text>
          </Text>
          {dateOfBirth && (
            <TouchableOpacity
              onPress={() => {
                const hebrewDate = convertToHebrewDate(dateOfBirth);
                if (hebrewDate) {
                  setHebrewDateOfBirth(hebrewDate);
                }
              }}
              style={{ paddingHorizontal: smallPadding, paddingVertical: smallPadding / 2 }}
            >
              <Text className="text-blue-500" style={{ fontSize: smallLabelSize }}>
                {t('reset')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          className="border border-gray-300 rounded-lg bg-white"
          style={{ padding: smallPadding * 1.5, fontSize: textSize }}
          value={hebrewDateOfBirth}
          onChangeText={(value) => setHebrewDateOfBirth(value)}
          placeholder={t('hebrew_date_placeholder')}
        />
      </View>

      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-600" style={{ fontSize: smallLabelSize, marginBottom: smallPadding / 2 }}>
          {t('deceased_date_of_death')} (YYYY-MM-DD) <Text className="text-gray-400">({t('optional')})</Text>
        </Text>
        <DateInputComponent
          label=""
          value={dateOfDeath}
          format="YYYY-MM-DD"
          onChange={(value) => setDateOfDeath(value)}
        />
      </View>

      <View style={{ marginBottom: margin }}>
        <View className="flex-row items-center justify-between" style={{ marginBottom: smallPadding / 2 }}>
          <Text className="text-gray-600" style={{ fontSize: smallLabelSize }}>
            {t('deceased_date_of_death')} ({t('hebrew')}) <Text className="text-gray-400">({t('optional')})</Text>
          </Text>
          {dateOfDeath && (
            <TouchableOpacity
              onPress={() => {
                const hebrewDate = convertToHebrewDate(dateOfDeath);
                if (hebrewDate) {
                  setHebrewDateOfDeath(hebrewDate);
                }
              }}
              style={{ paddingHorizontal: smallPadding, paddingVertical: smallPadding / 2 }}
            >
              <Text className="text-blue-500" style={{ fontSize: smallLabelSize }}>
                {t('reset')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          className="border border-gray-300 rounded-lg bg-white"
          style={{ padding: smallPadding * 1.5, fontSize: textSize }}
          value={hebrewDateOfDeath}
          onChangeText={setHebrewDateOfDeath}
          placeholder={t('hebrew_date_placeholder')}
        />
      </View>

      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
          {t('deceased_template')}{' '}
          <Text className="text-gray-400" style={{ fontSize: smallLabelSize }}>
            ({t('optional')})
          </Text>
        </Text>
        <View className="flex-row" style={{ gap: smallPadding }}>
          {(['simple', 'card', 'photo'] as const).map((temp) => (
            <TouchableOpacity
              key={temp}
              onPress={() => setTemplate(temp)}
              className={`rounded-lg border ${
                template === temp ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`}
              style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
            >
              <Text className={template === temp ? 'text-white' : 'text-gray-700'} style={{ fontSize: textSize }}>
                {t(`deceased_template_${temp}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {template === undefined && (
          <Text className="text-gray-500" style={{ fontSize: smallLabelSize, marginTop: smallPadding / 2 }}>
            {t('deceased_template_default_will_be_used')}
          </Text>
        )}
      </View>

      {/* Optional tribute/memorial text */}
      <View style={{ marginBottom: margin }}>
        <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
          {t('deceased_tribute')}{' '}
          <Text className="text-gray-400" style={{ fontSize: smallLabelSize }}>
            ({t('optional')})
          </Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg"
          style={{ padding: smallPadding * 1.5, fontSize: textSize }}
          placeholder={t('deceased_tribute_placeholder')}
          value={tribute}
          onChangeText={setTribute}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {template === 'photo' && (
        <View style={{ marginBottom: margin }}>
          <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
            {t('deceased_photo')}{' '}
            <Text className="text-gray-400" style={{ fontSize: smallLabelSize }}>
              ({t('optional')})
            </Text>
          </Text>

          {/* Photo preview */}
          {photoUrl ? (
            <View className="items-center" style={{ marginBottom: margin }}>
              <Image
                source={{ uri: photoUrl }}
                style={{ width: 96 * heightScale, height: 96 * heightScale, borderRadius: 8 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => void handleRemovePhoto()}
                className="bg-red-100 rounded"
                style={{
                  marginTop: smallPadding,
                  paddingHorizontal: smallPadding * 1.5,
                  paddingVertical: smallPadding / 2,
                }}
              >
                <Text className="text-red-600" style={{ fontSize: smallLabelSize }}>
                  {t('photo_remove')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Upload button */}
          <TouchableOpacity
            onPress={() => void pickImage()}
            disabled={isUploading}
            className={`flex-row items-center justify-center rounded-lg border border-dashed ${
              isUploading ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300'
            }`}
            style={{ padding: smallPadding * 1.5 }}
          >
            {isUploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-blue-600" style={{ fontSize: textSize, marginLeft: smallPadding }}>
                  {t('photo_uploading')}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Feather name="upload" size={iconSize} color="#3b82f6" />
                <Text className="text-blue-600" style={{ fontSize: textSize, marginLeft: smallPadding }}>
                  {t('photo_upload')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider with "or" */}
          <View className="flex-row items-center" style={{ marginVertical: margin }}>
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500" style={{ fontSize: textSize, marginHorizontal: margin }}>
              {t('or')}
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* URL input */}
          <TextInput
            className="border border-gray-300 rounded-lg"
            style={{ padding: smallPadding * 1.5, fontSize: textSize }}
            placeholder={t('deceased_photo_url')}
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />
        </View>
      )}

      <View className="flex-row" style={{ gap: smallPadding }}>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 bg-blue-500 rounded-lg"
          style={{ padding: smallPadding * 1.5 }}
        >
          <Text className="text-white text-center font-medium" style={{ fontSize: buttonTextSize }}>
            {t('deceased_save')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCancel}
          className="flex-1 bg-gray-300 rounded-lg"
          style={{ padding: smallPadding * 1.5 }}
        >
          <Text className="text-gray-700 text-center font-medium" style={{ fontSize: buttonTextSize }}>
            {t('deceased_cancel')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DeceasedSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DeceasedPerson | undefined>();
  const heightScale = useHeightScale() / 1.5;

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('headingSmall') * heightScale);
  const labelSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const smallTextSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodySmall') * heightScale);
  const checkboxSize = Math.round(25 * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);

  const saveChecked = (value: boolean) => {
    updateSettings({ enableDeceased: value });
  };

  const updateDeceasedSettings = (newSettings: Partial<DeceasedSettings>) => {
    const updatedSettings = {
      ...settings.deceasedSettings,
      ...newSettings,
    };
    updateSettings({ deceasedSettings: updatedSettings });
  };

  const addDeceasedPerson = (person: DeceasedPerson) => {
    const updatedDeceased = [...settings.deceasedSettings.deceased, person];
    updateDeceasedSettings({ deceased: updatedDeceased });
    setShowForm(false);
    setEditingPerson(undefined);
  };

  const editDeceasedPerson = (person: DeceasedPerson) => {
    const updatedDeceased = settings.deceasedSettings.deceased.map((p) => (p.id === person.id ? person : p));
    updateDeceasedSettings({ deceased: updatedDeceased });
    setShowForm(false);
    setEditingPerson(undefined);
  };

  const deleteDeceasedPerson = (id: string) => {
    showConfirm(
      t('confirm_delete'),
      t('are_you_sure_you_want_to_delete_this_person'),
      () => {
        // Clean up uploaded image from imgbb using locally stored delete URL
        getLocalDeleteUrl(id).then((deleteUrl) => {
          if (deleteUrl) {
            deleteImageFromImgbb(deleteUrl);
            removeLocalDeleteUrl(id);
          }
        });

        const updatedDeceased = settings.deceasedSettings.deceased.filter((p) => p.id !== id);
        updateDeceasedSettings({ deceased: updatedDeceased });
      },
      undefined,
      {
        confirmText: t('deceased_delete'),
        cancelText: t('deceased_cancel'),
        confirmStyle: 'destructive',
      },
    );
  };

  const startEditing = (person: DeceasedPerson) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  if (isLoading || !i18n?.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ marginTop: margin }}>
      <BouncyCheckbox
        size={checkboxSize}
        isChecked={settings.enableDeceased}
        fillColor="green"
        iconStyle={{ borderColor: 'green' }}
        innerIconStyle={{ borderWidth: 2 }}
        text={t('enable_deceased')}
        textComponent={<Text style={{ fontSize: textSize }}>{t('enable_deceased')}</Text>}
        onPress={(value) => saveChecked(value)}
      />

      {settings.enableDeceased && (
        <View className="flex-1" style={{ paddingHorizontal: padding, marginTop: margin, gap: margin }}>
          {/* Table Configuration */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <Text className="font-bold" style={{ fontSize: titleSize, marginBottom: margin }}>
              {t('deceased_table_configuration')}
            </Text>
            <View className="flex-row items-center justify-between">
              {/* Table Columns */}
              <View className="flex-1 items-center">
                <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                  {t('deceased_table_columns')}
                </Text>
                <View className="flex-row items-center" style={{ gap: smallPadding }}>
                  <TouchableOpacity
                    onPress={() =>
                      updateDeceasedSettings({ tableColumns: Math.max(1, settings.deceasedSettings.tableColumns - 1) })
                    }
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                    disabled={settings.deceasedSettings.tableColumns <= 1}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <View
                    className="bg-blue-100 rounded-lg items-center"
                    style={{ paddingHorizontal: padding, paddingVertical: smallPadding, minWidth: 50 * heightScale }}
                  >
                    <Text className="text-blue-900 font-bold" style={{ fontSize: titleSize }}>
                      {settings.deceasedSettings.tableColumns}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      updateDeceasedSettings({ tableColumns: Math.min(5, settings.deceasedSettings.tableColumns + 1) })
                    }
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                    disabled={settings.deceasedSettings.tableColumns >= 5}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Table Rows */}
              <View className="flex-1 items-center">
                <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                  {t('deceased_table_rows')}
                </Text>
                <View className="flex-row items-center" style={{ gap: smallPadding }}>
                  <TouchableOpacity
                    onPress={() =>
                      updateDeceasedSettings({ tableRows: Math.max(1, settings.deceasedSettings.tableRows - 1) })
                    }
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                    disabled={settings.deceasedSettings.tableRows <= 1}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <View
                    className="bg-blue-100 rounded-lg items-center"
                    style={{ paddingHorizontal: padding, paddingVertical: smallPadding, minWidth: 50 * heightScale }}
                  >
                    <Text className="text-blue-900 font-bold" style={{ fontSize: titleSize }}>
                      {settings.deceasedSettings.tableRows}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      updateDeceasedSettings({ tableRows: Math.min(5, settings.deceasedSettings.tableRows + 1) })
                    }
                    className="bg-gray-200 rounded-lg items-center justify-center"
                    style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                    disabled={settings.deceasedSettings.tableRows >= 10}
                  >
                    <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Display Mode */}
              <View className="flex-1 items-center">
                <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                  {t('deceased_display_mode')}
                </Text>
                <View className="flex-row" style={{ gap: smallPadding }}>
                  {(['all', 'monthly'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => updateDeceasedSettings({ displayMode: mode })}
                      className={`rounded-lg border ${
                        settings.deceasedSettings.displayMode === mode
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                      style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
                    >
                      <Text
                        className={settings.deceasedSettings.displayMode === mode ? 'text-white' : 'text-gray-700'}
                        style={{ fontSize: textSize }}
                      >
                        {t(`deceased_display_${mode}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Default Template */}
              <View className="flex-1 items-center">
                <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                  {t('deceased_default_template')}
                </Text>
                <View className="flex-row" style={{ gap: smallPadding }}>
                  {(['simple', 'card', 'photo'] as const).map((temp) => (
                    <TouchableOpacity
                      key={temp}
                      onPress={() => updateDeceasedSettings({ defaultTemplate: temp })}
                      className={`rounded-lg border ${
                        settings.deceasedSettings.defaultTemplate === temp
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                      style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
                    >
                      <Text
                        className={settings.deceasedSettings.defaultTemplate === temp ? 'text-white' : 'text-gray-700'}
                        style={{ fontSize: textSize }}
                      >
                        {t(`deceased_template_${temp}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Image Upload API Key */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <View className="flex-row items-center justify-between" style={{ marginBottom: smallPadding }}>
              <Text className="font-bold" style={{ fontSize: titleSize }}>
                {t('imgbb_api_key')}
              </Text>
              <ExternalLink url="https://api.imgbb.com/" label={t('imgbb_get_key')} />
            </View>
            <Text className="text-gray-500" style={{ fontSize: smallTextSize, marginBottom: smallPadding * 1.5 }}>
              {t('imgbb_api_key_description')}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg"
              style={{ padding: smallPadding * 1.5, fontSize: textSize }}
              placeholder={t('imgbb_api_key_placeholder')}
              value={settings.deceasedSettings.imgbbApiKey || ''}
              onChangeText={(value) => updateDeceasedSettings({ imgbbApiKey: value })}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Deceased People List */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <View className="flex-row justify-between items-center" style={{ marginBottom: margin }}>
              <Text className="font-bold" style={{ fontSize: titleSize }}>
                {t('deceased_people')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                className="bg-green-500 rounded-lg"
                style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
              >
                <Text className="text-white font-medium" style={{ fontSize: buttonTextSize }}>
                  {t('deceased_add_person')}
                </Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <DeceasedPersonForm
                person={editingPerson}
                onSave={editingPerson ? editDeceasedPerson : addDeceasedPerson}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPerson(undefined);
                }}
                imgbbApiKey={settings.deceasedSettings.imgbbApiKey || ''}
              />
            )}

            {settings.deceasedSettings.deceased.length === 0 ? (
              <Text className="text-gray-500 text-center" style={{ fontSize: textSize, paddingVertical: padding }}>
                {t('deceased_no_people')}
              </Text>
            ) : (
              <View>
                {[...settings.deceasedSettings.deceased]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <View
                      key={item.id}
                      className="border border-gray-200 rounded-lg"
                      style={{ padding: smallPadding * 1.5, marginBottom: smallPadding }}
                    >
                      <Text className="font-medium" style={{ fontSize: titleSize }}>
                        {item.name}
                      </Text>
                      {item.isMale !== undefined && (
                        <Text className="text-gray-600" style={{ fontSize: smallTextSize }}>
                          {t('deceased_gender')}:{' '}
                          {item.isMale ? t('deceased_gender_male') : t('deceased_gender_female')}
                        </Text>
                      )}
                      {(item.dateOfBirth || item.hebrewDateOfBirth) && (
                        <Text className="text-gray-600" style={{ fontSize: smallTextSize }}>
                          {t('deceased_date_of_birth')}: {item.dateOfBirth || '-'}{' '}
                          {item.hebrewDateOfBirth && `- ${item.hebrewDateOfBirth}`}
                        </Text>
                      )}
                      {(item.dateOfDeath || item.hebrewDateOfDeath) && (
                        <Text className="text-gray-600" style={{ fontSize: smallTextSize }}>
                          {t('deceased_date_of_death')}: {item.dateOfDeath || '-'}{' '}
                          {item.hebrewDateOfDeath && `- ${item.hebrewDateOfDeath}`}
                        </Text>
                      )}
                      {item.template && (
                        <Text className="text-gray-600" style={{ fontSize: smallTextSize }}>
                          {t('deceased_template')}: {t(`deceased_template_${item.template}`)}
                        </Text>
                      )}
                      {item.tribute && (
                        <Text
                          className="text-gray-600 italic"
                          style={{ fontSize: smallTextSize, marginTop: smallPadding / 2 }}
                        >
                          {item.tribute}
                        </Text>
                      )}
                      <View className="flex-row" style={{ gap: smallPadding, marginTop: smallPadding }}>
                        <TouchableOpacity
                          onPress={() => startEditing(item)}
                          className="bg-blue-500 rounded"
                          style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding / 2 }}
                        >
                          <Text className="text-white" style={{ fontSize: smallTextSize }}>
                            {t('deceased_edit')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => void deleteDeceasedPerson(item.id)}
                          className="bg-red-500 rounded"
                          style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding / 2 }}
                        >
                          <Text className="text-white" style={{ fontSize: smallTextSize }}>
                            {t('deceased_delete')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DeceasedSettingsTab;
