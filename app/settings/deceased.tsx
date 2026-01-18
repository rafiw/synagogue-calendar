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
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-4">{person ? t('deceased_edit') : t('deceased_add_person')}</Text>

      <View className="mb-3">
        <Text className="text-gray-700 mb-2">
          {t('deceased_name')} <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder={t('deceased_name')}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Gender toggle */}
      <View className="mb-3">
        <Text className="text-gray-700 mb-2">
          {t('deceased_gender')} <Text className="text-gray-400 text-sm">({t('optional')})</Text>
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setIsMale(true)}
            className={`flex-1 px-3 py-2 rounded-lg border ${
              isMale === true ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
            }`}
          >
            <Text className={`text-center ${isMale === true ? 'text-white' : 'text-gray-700'}`}>
              {t('deceased_gender_male')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsMale(false)}
            className={`flex-1 px-3 py-2 rounded-lg border ${
              isMale === false ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
            }`}
          >
            <Text className={`text-center ${isMale === false ? 'text-white' : 'text-gray-700'}`}>
              {t('deceased_gender_female')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-gray-600 text-sm mb-1">
          {t('deceased_date_of_birth')} (YYYY-MM-DD) <Text className="text-gray-400">({t('optional')})</Text>
        </Text>
        <DateInputComponent
          label=""
          value={dateOfBirth}
          format="YYYY-MM-DD"
          onChange={(value) => setDateOfBirth(value)}
        />
      </View>

      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-gray-600 text-sm">
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
              className="px-2 py-1"
            >
              <Text className="text-blue-500 text-xs">{t('reset')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={hebrewDateOfBirth}
          onChangeText={(value) => setHebrewDateOfBirth(value)}
          placeholder={t('hebrew_date_placeholder')}
        />
      </View>

      <View className="mb-3">
        <Text className="text-gray-600 text-sm mb-1">
          {t('deceased_date_of_death')} (YYYY-MM-DD) <Text className="text-gray-400">({t('optional')})</Text>
        </Text>
        <DateInputComponent
          label=""
          value={dateOfDeath}
          format="YYYY-MM-DD"
          onChange={(value) => setDateOfDeath(value)}
        />
      </View>

      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-gray-600 text-sm">
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
              className="px-2 py-1"
            >
              <Text className="text-blue-500 text-xs">{t('reset')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white"
          value={hebrewDateOfDeath}
          onChangeText={setHebrewDateOfDeath}
          placeholder={t('hebrew_date_placeholder')}
        />
      </View>

      <View className="mb-3">
        <Text className="text-gray-700 mb-2">
          {t('deceased_template')} <Text className="text-gray-400 text-sm">({t('optional')})</Text>
        </Text>
        <View className="flex-row space-x-2">
          {(['simple', 'card', 'photo'] as const).map((temp) => (
            <TouchableOpacity
              key={temp}
              onPress={() => setTemplate(temp)}
              className={`px-3 py-2 rounded-lg border ${
                template === temp ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={template === temp ? 'text-white' : 'text-gray-700'}>
                {t(`deceased_template_${temp}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {template === undefined && (
          <Text className="text-gray-500 text-xs mt-1">{t('deceased_template_default_will_be_used')}</Text>
        )}
      </View>

      {/* Optional tribute/memorial text */}
      <View className="mb-3">
        <Text className="text-gray-700 mb-2">
          {t('deceased_tribute')} <Text className="text-gray-400 text-sm">({t('optional')})</Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder={t('deceased_tribute_placeholder')}
          value={tribute}
          onChangeText={setTribute}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {template === 'photo' && (
        <View className="mb-3">
          <Text className="text-gray-700 mb-2">
            {t('deceased_photo')} <Text className="text-gray-400 text-sm">({t('optional')})</Text>
          </Text>

          {/* Photo preview */}
          {photoUrl ? (
            <View className="mb-3 items-center">
              <Image source={{ uri: photoUrl }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
              <TouchableOpacity onPress={() => void handleRemovePhoto()} className="mt-2 px-3 py-1 bg-red-100 rounded">
                <Text className="text-red-600 text-sm">{t('photo_remove')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Upload button */}
          <TouchableOpacity
            onPress={() => void pickImage()}
            disabled={isUploading}
            className={`flex-row items-center justify-center p-3 rounded-lg border border-dashed ${
              isUploading ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300'
            }`}
          >
            {isUploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-blue-600 ml-2">{t('photo_uploading')}</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Feather name="upload" size={20} color="#3b82f6" />
                <Text className="text-blue-600 ml-2">{t('photo_upload')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider with "or" */}
          <View className="flex-row items-center my-3">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-3 text-gray-500">{t('or')}</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* URL input */}
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder={t('deceased_photo_url')}
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />
        </View>
      )}

      <View className="flex-row space-x-2">
        <TouchableOpacity onPress={handleSave} className="flex-1 bg-blue-500 p-3 rounded-lg">
          <Text className="text-white text-center font-medium">{t('save')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCancel} className="flex-1 bg-gray-300 p-3 rounded-lg">
          <Text className="text-gray-700 text-center font-medium">{t('deceased_cancel')}</Text>
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
    const updatedDeceased = [...settings.deceased, person];
    updateSettings({ deceased: updatedDeceased });
    setShowForm(false);
    setEditingPerson(undefined);
  };

  const editDeceasedPerson = (person: DeceasedPerson) => {
    const updatedDeceased = settings.deceased.map((p) => (p.id === person.id ? person : p));
    updateSettings({ deceased: updatedDeceased });
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

        const updatedDeceased = settings.deceased.filter((p) => p.id !== id);
        updateSettings({ deceased: updatedDeceased });
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
    <ScrollView className="flex-1 mt-4">
      <BouncyCheckbox
        isChecked={settings.enableDeceased}
        fillColor="green"
        iconStyle={{ borderColor: 'green' }}
        innerIconStyle={{ borderWidth: 2 }}
        text={t('enable_deceased')}
        textComponent={<Text>{t('enable_deceased')}</Text>}
        onPress={(value) => saveChecked(value)}
      />

      {settings.enableDeceased && (
        <View className="flex-1 px-4 mt-4 space-y-4">
          {/* Table Configuration */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-4">{t('deceased_table_configuration')}</Text>
            <View className="mb-3 flex-row-reverse items-center justify-between">
              <Text className="text-gray-700 mb-2">{t('deceased_table_rows')}</Text>
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() =>
                    updateDeceasedSettings({ tableRows: Math.max(1, settings.deceasedSettings.tableRows - 1) })
                  }
                  className="bg-gray-200 rounded-lg p-2 w-10 h-10 items-center justify-center"
                  disabled={settings.deceasedSettings.tableRows <= 1}
                >
                  <Text className="text-gray-700 font-bold text-xl">-</Text>
                </TouchableOpacity>
                <View className="bg-blue-100 rounded-lg px-4 py-2 min-w-[50px] items-center">
                  <Text className="text-blue-900 font-bold text-lg">{settings.deceasedSettings.tableRows}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    updateDeceasedSettings({ tableRows: Math.min(5, settings.deceasedSettings.tableRows + 1) })
                  }
                  className="bg-gray-200 rounded-lg p-2 w-10 h-10 items-center justify-center"
                  disabled={settings.deceasedSettings.tableRows >= 10}
                >
                  <Text className="text-gray-700 font-bold text-xl">+</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* table columns */}
            <View className="mb-3 flex-row-reverse items-center justify-between">
              <Text className="text-gray-700 mb-2">{t('deceased_table_columns')}</Text>
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() =>
                    updateDeceasedSettings({ tableColumns: Math.max(1, settings.deceasedSettings.tableColumns - 1) })
                  }
                  className="bg-gray-200 rounded-lg p-2 w-10 h-10 items-center justify-center"
                  disabled={settings.deceasedSettings.tableColumns <= 1}
                >
                  <Text className="text-gray-700 font-bold text-xl">-</Text>
                </TouchableOpacity>
                <View className="bg-blue-100 rounded-lg px-4 py-2 min-w-[50px] items-center">
                  <Text className="text-blue-900 font-bold text-lg">{settings.deceasedSettings.tableColumns}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    updateDeceasedSettings({ tableColumns: Math.min(5, settings.deceasedSettings.tableColumns + 1) })
                  }
                  className="bg-gray-200 rounded-lg p-2 w-10 h-10 items-center justify-center"
                  disabled={settings.deceasedSettings.tableColumns >= 5}
                >
                  <Text className="text-gray-700 font-bold text-xl">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Display Mode */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-4">{t('deceased_display_mode')}</Text>
            <View className="flex-row space-x-2">
              {(['all', 'monthly'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => updateDeceasedSettings({ displayMode: mode })}
                  className={`px-3 py-2 rounded-lg border ${
                    settings.deceasedSettings.displayMode === mode
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={settings.deceasedSettings.displayMode === mode ? 'text-white' : 'text-gray-700'}>
                    {t(`deceased_display_${mode}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Default Template */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-4">{t('deceased_default_template')}</Text>
            <View className="flex-row space-x-2">
              {(['simple', 'card', 'photo'] as const).map((temp) => (
                <TouchableOpacity
                  key={temp}
                  onPress={() => updateDeceasedSettings({ defaultTemplate: temp })}
                  className={`px-3 py-2 rounded-lg border ${
                    settings.deceasedSettings.defaultTemplate === temp
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={settings.deceasedSettings.defaultTemplate === temp ? 'text-white' : 'text-gray-700'}>
                    {t(`deceased_template_${temp}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload API Key */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold">{t('imgbb_api_key')}</Text>
              <ExternalLink url="https://api.imgbb.com/" label={t('imgbb_get_key')} />
            </View>
            <Text className="text-gray-500 text-sm mb-3">{t('imgbb_api_key_description')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder={t('imgbb_api_key_placeholder')}
              value={settings.deceasedSettings.imgbbApiKey || ''}
              onChangeText={(value) => updateDeceasedSettings({ imgbbApiKey: value })}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Deceased People List */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">{t('deceased_people')}</Text>
              <TouchableOpacity onPress={() => setShowForm(true)} className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">{t('deceased_add_person')}</Text>
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

            {settings.deceased.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">{t('deceased_no_people')}</Text>
            ) : (
              <View>
                {[...settings.deceased]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <View key={item.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                      <Text className="font-medium text-lg">{item.name}</Text>
                      {item.isMale !== undefined && (
                        <Text className="text-gray-600">
                          {t('deceased_gender')}:{' '}
                          {item.isMale ? t('deceased_gender_male') : t('deceased_gender_female')}
                        </Text>
                      )}
                      {(item.dateOfBirth || item.hebrewDateOfBirth) && (
                        <Text className="text-gray-600">
                          {t('deceased_date_of_birth')}: {item.dateOfBirth || '-'}{' '}
                          {item.hebrewDateOfBirth && `- ${item.hebrewDateOfBirth}`}
                        </Text>
                      )}
                      {(item.dateOfDeath || item.hebrewDateOfDeath) && (
                        <Text className="text-gray-600">
                          {t('deceased_date_of_death')}: {item.dateOfDeath || '-'}{' '}
                          {item.hebrewDateOfDeath && `- ${item.hebrewDateOfDeath}`}
                        </Text>
                      )}
                      {item.template && (
                        <Text className="text-gray-600">
                          {t('deceased_template')}: {t(`deceased_template_${item.template}`)}
                        </Text>
                      )}
                      {item.tribute && <Text className="text-gray-600 italic mt-1">{item.tribute}</Text>}
                      <View className="flex-row space-x-2 mt-2">
                        <TouchableOpacity onPress={() => startEditing(item)} className="bg-blue-500 px-3 py-1 rounded">
                          <Text className="text-white text-sm">{t('deceased_edit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => void deleteDeceasedPerson(item.id)}
                          className="bg-red-500 px-3 py-1 rounded"
                        >
                          <Text className="text-white text-sm">{t('deceased_delete')}</Text>
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
