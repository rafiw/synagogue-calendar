import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
  Share,
} from 'react-native';
import { showAlert, showConfirm } from '../../utils/alert';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useState, useEffect } from 'react';
import { DeceasedPerson, DeceasedSettings } from '../../utils/defs';
import { DatePicker } from '../../components/DatePicker';
import { NumberInput } from '../../components/NumberInput';
import { HDate } from '@hebcal/core';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
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
const DEFAULT_IMGBB_API_KEY = '';

interface UploadResult {
  url: string;
  deleteUrl: string;
}

const uploadImageToImgbb = async (
  imageUri: string,
  apiKey: string,
  t: (key: string) => string,
): Promise<UploadResult | null> => {
  const effectiveApiKey = apiKey || DEFAULT_IMGBB_API_KEY;

  if (!effectiveApiKey) {
    showAlert(t('imgbb_config_required'), t('imgbb_config_required_msg'));
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

// Helper function to convert Gregorian date to Hebrew date string
const convertToHebrewDate = (gregorianDateString?: string, language: string = 'he'): string | null => {
  if (!gregorianDateString) return null;

  try {
    const gregorianDate = new Date(gregorianDateString);
    if (isNaN(gregorianDate.getTime())) return null;
    const hdate = new HDate(gregorianDate);
    return language === 'he' ? hdate.renderGematriya() : hdate.render(language);
  } catch (error) {
    console.error('Error converting date to Hebrew:', error);
    return null;
  }
};

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
        const uploadResult = await uploadImageToImgbb(result.assets[0].uri, imgbbApiKey, t);
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

  // Auto-populate Hebrew date of birth when Gregorian date changes
  useEffect(() => {
    const hebrewDate = convertToHebrewDate(dateOfBirth, i18n.language);
    if (hebrewDate) {
      setHebrewDateOfBirth(hebrewDate);
    }
  }, [dateOfBirth, i18n.language]);

  // Auto-populate Hebrew date of death when Gregorian date changes
  useEffect(() => {
    const hebrewDate = convertToHebrewDate(dateOfDeath, i18n.language);
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
    <ScrollView className="bg-white rounded-lg" style={{ padding, flexShrink: 1 }}>
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
          {!!dateOfBirth && (
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
          {!!dateOfDeath && (
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
    </ScrollView>
  );
};

const splitCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

interface CsvParseResult {
  success: boolean;
  errors: string[];
  people: DeceasedPerson[];
}

const parseAndValidateCSV = (
  csvText: string,
  language: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): CsvParseResult => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return {
      success: false,
      errors: [t('csv_no_valid_data')],
      people: [],
    };
  }

  // English-only headers
  const headers = splitCsvLine(lines[0] || '').map((h) => h.toLowerCase().trim());
  const nameIndex = headers.findIndex((h) => h === 'name');
  if (nameIndex === -1) {
    return {
      success: false,
      errors: [t('csv_missing_name_header')],
      people: [],
    };
  }

  const genderIndex = headers.findIndex((h) => h === 'gender' || h === 'ismale' || h === 'male');
  const dodIndex = headers.findIndex((h) => h === 'dateofdeath' || h === 'dod' || h === 'death');
  const dobIndex = headers.findIndex((h) => h === 'dateofbirth' || h === 'dob' || h === 'birth');
  const hebrewDodIndex = headers.findIndex((h) => h === 'hebrewdateofdeath' || h === 'hebrewdod');
  const hebrewDobIndex = headers.findIndex((h) => h === 'hebrewdateofbirth' || h === 'hebrewdob');
  const photoIndex = headers.findIndex((h) => h === 'photo' || h === 'photourl');
  const tributeIndex = headers.findIndex((h) => h === 'tribute' || h === 'memorial');

  const errors: string[] = [];
  const people: DeceasedPerson[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine?.trim()) continue; // Skip blank lines

    const rowNum = i + 1; // 1-indexed row number in the CSV
    const values = splitCsvLine(rawLine);

    const name = values[nameIndex]?.trim();
    if (!name) {
      errors.push(t('csv_row_name_required', { row: rowNum }));
    }

    let isMale = true;
    if (genderIndex !== -1 && values[genderIndex]?.trim()) {
      const g = values[genderIndex].trim().toLowerCase();
      if (['male', 'm', 'זכר', 'true', '1'].includes(g)) {
        isMale = true;
      } else if (['female', 'f', 'נקבה', 'false', '0'].includes(g)) {
        isMale = false;
      } else {
        errors.push(t('csv_row_invalid_gender', { row: rowNum, val: values[genderIndex].trim() }));
      }
    }

    const dod = dodIndex !== -1 ? values[dodIndex]?.trim() : '';
    if (dod && isNaN(new Date(dod).getTime())) {
      errors.push(t('csv_row_invalid_dod', { row: rowNum, val: dod }));
    }

    const dob = dobIndex !== -1 ? values[dobIndex]?.trim() : '';
    if (dob && isNaN(new Date(dob).getTime())) {
      errors.push(t('csv_row_invalid_dob', { row: rowNum, val: dob }));
    }

    const hebrewDod = hebrewDodIndex !== -1 ? values[hebrewDodIndex]?.trim() : '';
    const hebrewDob = hebrewDobIndex !== -1 ? values[hebrewDobIndex]?.trim() : '';
    const photo = photoIndex !== -1 ? values[photoIndex]?.trim() : '';
    const tribute = tributeIndex !== -1 ? values[tributeIndex]?.trim() : '';

    if (name) {
      const person: DeceasedPerson = {
        id: `csv_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        isMale,
        template: 'simple',
      };

      if (dod) person.dateOfDeath = dod;
      if (dob) person.dateOfBirth = dob;

      if (hebrewDod) {
        person.hebrewDateOfDeath = hebrewDod;
      } else if (dod) {
        const autoHebrew = convertToHebrewDate(dod, language);
        if (autoHebrew) person.hebrewDateOfDeath = autoHebrew;
      }

      if (hebrewDob) {
        person.hebrewDateOfBirth = hebrewDob;
      } else if (dob) {
        const autoHebrew = convertToHebrewDate(dob, language);
        if (autoHebrew) person.hebrewDateOfBirth = autoHebrew;
      }

      if (photo) person.photo = photo;
      if (tribute) person.tribute = tribute;

      people.push(person);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      people: [],
    };
  }

  if (people.length === 0) {
    return {
      success: false,
      errors: [t('csv_no_valid_data')],
      people: [],
    };
  }

  return {
    success: true,
    errors: [],
    people,
  };
};

const escapeCsvValue = (val?: string | boolean): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const generateCSV = (people: DeceasedPerson[]): string => {
  const headers = [
    'name',
    'gender',
    'dateOfDeath',
    'dateOfBirth',
    'hebrewDateOfDeath',
    'hebrewDateOfBirth',
    'photo',
    'tribute',
  ];

  const rows = people.map((person) => {
    return [
      escapeCsvValue(person.name),
      escapeCsvValue(person.isMale ? 'male' : 'female'),
      escapeCsvValue(person.dateOfDeath || ''),
      escapeCsvValue(person.dateOfBirth || ''),
      escapeCsvValue(person.hebrewDateOfDeath || ''),
      escapeCsvValue(person.hebrewDateOfBirth || ''),
      escapeCsvValue(person.photo || ''),
      escapeCsvValue(person.tribute || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

const DeceasedSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const { height, width } = useWindowDimensions();
  const [showForm, setShowForm] = useState(false);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DeceasedPerson | undefined>();
  const isSmallHeight = height < 600;
  const heightScale = useHeightScale() / 1.5;
  const isWide = width >= 800;

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
    updateSettings({ deceasedSettings: { ...settings.deceasedSettings, enable: value } });
  };

  // Extended type to accept both DeceasedSettings properties and displaySettings properties for convenience
  type DeceasedSettingsUpdate = Partial<DeceasedSettings> & {
    tableRows?: number;
    tableColumns?: number;
    displayMode?: 'all' | 'monthly';
    defaultTemplate?: 'simple' | 'card' | 'photo';
  };

  const updateDeceasedSettings = (newSettings: DeceasedSettingsUpdate) => {
    const updatedSettings = {
      ...settings.deceasedSettings,
    };

    // Handle displaySettings properties
    if (
      'tableRows' in newSettings ||
      'tableColumns' in newSettings ||
      'displayMode' in newSettings ||
      'defaultTemplate' in newSettings
    ) {
      updatedSettings.displaySettings = {
        ...settings.deceasedSettings.displaySettings,
        ...(newSettings.tableRows !== undefined && { tableRows: newSettings.tableRows }),
        ...(newSettings.tableColumns !== undefined && { tableColumns: newSettings.tableColumns }),
        ...(newSettings.displayMode !== undefined && { displayMode: newSettings.displayMode }),
        ...(newSettings.defaultTemplate !== undefined && { defaultTemplate: newSettings.defaultTemplate }),
      };
    }

    // Handle other DeceasedSettings properties
    if ('enable' in newSettings) updatedSettings.enable = newSettings.enable!;
    if ('screenDisplayTime' in newSettings) updatedSettings.screenDisplayTime = newSettings.screenDisplayTime!;
    if ('deceased' in newSettings) updatedSettings.deceased = newSettings.deceased!;
    if ('imgbbApiKey' in newSettings) updatedSettings.imgbbApiKey = newSettings.imgbbApiKey!;
    if ('displaySettings' in newSettings)
      updatedSettings.displaySettings = { ...updatedSettings.displaySettings, ...newSettings.displaySettings };

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

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      if (!file) return;

      const response = await fetch(file.uri);
      const csvText = await response.text();

      const parseResult = parseAndValidateCSV(csvText, i18n.language, t);

      if (!parseResult.success) {
        const maxErrors = 5;
        const displayed = parseResult.errors.slice(0, maxErrors);
        let errorMsg = displayed.join('\n');
        if (parseResult.errors.length > maxErrors) {
          errorMsg += '\n' + t('csv_more_errors', { count: parseResult.errors.length - maxErrors });
        }
        showAlert(t('csv_validation_failed_title'), errorMsg);
        return;
      }

      const currentList = settings.deceasedSettings.deceased || [];
      const updatedDeceased = [...currentList, ...parseResult.people];
      updateDeceasedSettings({ deceased: updatedDeceased });

      showAlert(t('success'), t('csv_imported_count', { count: parseResult.people.length }));
    } catch (error) {
      console.error('Error importing CSV:', error);
      showAlert(t('error'), t('csv_import_failed'));
    }
  };

  const handleDeleteAll = () => {
    const list = settings.deceasedSettings.deceased || [];
    if (list.length === 0) {
      showAlert(t('info'), t('no_deceased_to_delete'));
      return;
    }

    showConfirm(
      t('confirm_delete'),
      t('confirm_delete_all_deceased', { count: list.length }),
      () => {
        // Clean up imgbb images if any
        for (const person of list) {
          getLocalDeleteUrl(person.id).then((deleteUrl) => {
            if (deleteUrl) {
              deleteImageFromImgbb(deleteUrl);
              removeLocalDeleteUrl(person.id);
            }
          });
        }

        updateDeceasedSettings({ deceased: [] });
        showAlert(t('success'), t('all_deceased_deleted'));
      },
      undefined,
      {
        confirmText: t('deceased_delete_all'),
        cancelText: t('deceased_cancel'),
        confirmStyle: 'destructive',
      },
    );
  };

  const handleExportCSV = async () => {
    const deceasedList = settings.deceasedSettings.deceased || [];
    if (deceasedList.length === 0) {
      showAlert(t('info') || 'Info', t('csv_no_deceased_to_export'));
      return;
    }

    try {
      const csvContent = generateCSV(deceasedList);
      const fileName = `deceased_${new Date().toISOString().split('T')[0]}.csv`;

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      await Share.share({
        title: fileName,
        message: csvContent,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showAlert(t('error'), t('csv_export_failed'));
    }
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
      <View className="flex-row items-center justify-center" style={{ gap: padding }}>
        <BouncyCheckbox
          size={checkboxSize}
          isChecked={settings.deceasedSettings.enable}
          fillColor="green"
          iconStyle={{ borderColor: 'green' }}
          innerIconStyle={{ borderWidth: 2 }}
          text={t('enable_deceased')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_deceased')}</Text>}
          onPress={(value) => saveChecked(value)}
        />
      </View>
      {settings.deceasedSettings.enable && (
        <View className="flex-1" style={{ marginTop: margin }}>
          {/* Display Time */}
          <NumberInput
            value={settings.deceasedSettings.screenDisplayTime || 10}
            onChange={(newTime) => {
              updateSettings({
                deceasedSettings: {
                  ...settings.deceasedSettings,
                  screenDisplayTime: newTime,
                },
              });
            }}
            min={1}
            max={60}
            label={t('screen_display_time_description')}
            labelSize={labelSize}
            textSize={textSize}
            padding={padding}
            smallPadding={smallPadding}
            heightScale={heightScale}
          />
          {/* Table Configuration */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <View className="flex-row justify-center items-center" style={{ marginBottom: margin }}>
              <Text className="font-bold" style={{ fontSize: titleSize }}>
                {t('deceased_table_configuration')}
              </Text>
              <TouchableOpacity
                onPress={() => showAlert(t('deceased_table_configuration'), t('deceased_config_help'))}
                className="bg-blue-100 rounded-full"
                style={{
                  padding: smallPadding / 2,
                  width: 24 * heightScale,
                  height: 24 * heightScale,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-blue-600 font-bold" style={{ fontSize: labelSize }}>
                  ?
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: padding }}>
              <View className={isWide || isSmallHeight ? 'flex-row' : ''} style={{ gap: padding }}>
                {/* Table Columns */}
                <View className={`${isWide || isSmallHeight ? 'flex-1' : 'w-full'} items-center`}>
                  <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                    {t('deceased_table_columns')}
                  </Text>
                  <View className="flex-row items-center" style={{ gap: smallPadding }}>
                    <TouchableOpacity
                      onPress={() =>
                        updateDeceasedSettings({
                          tableColumns: Math.max(1, settings.deceasedSettings.displaySettings.tableColumns - 1),
                        })
                      }
                      className="bg-gray-200 rounded-lg items-center justify-center"
                      style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                      disabled={settings.deceasedSettings.displaySettings.tableColumns <= 1}
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
                        {settings.deceasedSettings.displaySettings.tableColumns}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        updateDeceasedSettings({
                          tableColumns: Math.min(5, settings.deceasedSettings.displaySettings.tableColumns + 1),
                        })
                      }
                      className="bg-gray-200 rounded-lg items-center justify-center"
                      style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                      disabled={settings.deceasedSettings.displaySettings.tableColumns >= 5}
                    >
                      <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Table Rows */}
                <View className={`${isWide || isSmallHeight ? 'flex-1' : 'w-full'} items-center`}>
                  <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                    {t('deceased_table_rows')}
                  </Text>
                  <View className="flex-row items-center" style={{ gap: smallPadding }}>
                    <TouchableOpacity
                      onPress={() =>
                        updateDeceasedSettings({
                          tableRows: Math.max(1, settings.deceasedSettings.displaySettings.tableRows - 1),
                        })
                      }
                      className="bg-gray-200 rounded-lg items-center justify-center"
                      style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                      disabled={settings.deceasedSettings.displaySettings.tableRows <= 1}
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
                        {settings.deceasedSettings.displaySettings.tableRows}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        updateDeceasedSettings({
                          tableRows: Math.min(5, settings.deceasedSettings.displaySettings.tableRows + 1),
                        })
                      }
                      className="bg-gray-200 rounded-lg items-center justify-center"
                      style={{ padding: smallPadding, width: 40 * heightScale, height: 40 * heightScale }}
                      disabled={settings.deceasedSettings.displaySettings.tableRows >= 10}
                    >
                      <Text className="text-gray-700 font-bold" style={{ fontSize: titleSize }}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Display Mode */}
                <View className={`${isWide || isSmallHeight ? 'flex-1' : 'w-full'} items-center`}>
                  <Text className="text-gray-700" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                    {t('deceased_display_mode')}
                  </Text>
                  <View className="flex-row" style={{ gap: smallPadding }}>
                    {(['all', 'monthly'] as const).map((mode) => (
                      <TouchableOpacity
                        key={mode}
                        onPress={() => updateDeceasedSettings({ displayMode: mode })}
                        className={`rounded-lg border ${
                          settings.deceasedSettings.displaySettings.displayMode === mode
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                        }`}
                        style={{ paddingHorizontal: smallPadding * 1.5, paddingVertical: smallPadding }}
                      >
                        <Text
                          className={
                            settings.deceasedSettings.displaySettings.displayMode === mode
                              ? 'text-white'
                              : 'text-gray-700'
                          }
                          style={{ fontSize: textSize }}
                        >
                          {t(`deceased_display_${mode}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Deceased People List */}
          <View className="bg-white rounded-lg shadow-sm" style={{ padding }}>
            <View className="flex-row justify-between items-center" style={{ marginBottom: margin }}>
              <Text className="font-bold" style={{ fontSize: titleSize }}>
                {t('deceased_people')}
              </Text>
              <View className="flex-row items-center flex-wrap" style={{ gap: smallPadding }}>
                <TouchableOpacity
                  onPress={() => setShowCsvHelp((prev) => !prev)}
                  className="bg-gray-100 border border-gray-300 rounded-lg flex-row items-center"
                  style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                >
                  <Feather name="help-circle" size={Math.round(12 * heightScale)} color="#4b5563" />
                  <Text
                    className="text-gray-700 font-medium"
                    style={{ fontSize: buttonTextSize, marginLeft: smallPadding / 2 }}
                  >
                    {t('csv_help_button')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void handleExportCSV()}
                  className="bg-indigo-600 rounded-lg flex-row items-center"
                  style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                >
                  <Feather name="download" size={Math.round(12 * heightScale)} color="white" />
                  <Text
                    className="text-white font-medium"
                    style={{ fontSize: buttonTextSize, marginLeft: smallPadding / 2 }}
                  >
                    {t('export_csv')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void handleImportCSV()}
                  className="bg-blue-500 rounded-lg flex-row items-center"
                  style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                >
                  <Feather name="upload" size={Math.round(12 * heightScale)} color="white" />
                  <Text
                    className="text-white font-medium"
                    style={{ fontSize: buttonTextSize, marginLeft: smallPadding / 2 }}
                  >
                    {t('import_csv')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowForm(true)}
                  className="bg-green-500 rounded-lg flex-row items-center"
                  style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                >
                  <Feather name="plus" size={Math.round(12 * heightScale)} color="white" />
                  <Text
                    className="text-white font-medium"
                    style={{ fontSize: buttonTextSize, marginLeft: smallPadding / 2 }}
                  >
                    {t('deceased_add_person')}
                  </Text>
                </TouchableOpacity>
                {settings.deceasedSettings.deceased?.length > 0 && (
                  <TouchableOpacity
                    onPress={handleDeleteAll}
                    className="bg-red-500 rounded-lg flex-row items-center"
                    style={{ paddingHorizontal: padding, paddingVertical: smallPadding }}
                  >
                    <Feather name="trash-2" size={Math.round(12 * heightScale)} color="white" />
                    <Text
                      className="text-white font-medium"
                      style={{ fontSize: buttonTextSize, marginLeft: smallPadding / 2 }}
                    >
                      {t('deceased_delete_all')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showCsvHelp && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg" style={{ padding, marginBottom: margin }}>
                <View className="flex-row items-center justify-between" style={{ marginBottom: smallPadding }}>
                  <View className="flex-row items-center">
                    <Feather name="info" size={Math.round(14 * heightScale)} color="#1d4ed8" />
                    <Text className="font-bold text-blue-900" style={{ fontSize: textSize, marginLeft: smallPadding }}>
                      {t('csv_help_title')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowCsvHelp(false)}>
                    <Feather name="x" size={Math.round(14 * heightScale)} color="#1d4ed8" />
                  </TouchableOpacity>
                </View>
                <Text
                  className="text-blue-900 font-medium"
                  style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}
                >
                  • {t('csv_help_english_headers')}
                </Text>
                <Text className="text-blue-800" style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                  • {t('csv_help_template_tip')}
                </Text>
                <View className="bg-white rounded border border-blue-200" style={{ padding: smallPadding }}>
                  <Text className="text-gray-600 font-medium mb-0.5" style={{ fontSize: labelSize * 0.9 }}>
                    {t('csv_example')}
                  </Text>
                  <Text className="text-gray-800 font-mono select-all" style={{ fontSize: labelSize * 0.85 }}>
                    {
                      'name,gender,dateOfDeath,dateOfBirth,hebrewDateOfDeath,hebrewDateOfBirth,photo,tribute\n"ישראל ישראלי",male,2023-05-15,1950-01-01,"כ״ד באייר תשפ״ג",,,"ת.נ.צ.ב.ה"'
                    }
                  </Text>
                </View>
              </View>
            )}

            <Modal
              visible={showForm}
              transparent
              animationType="slide"
              onRequestClose={() => {
                setShowForm(false);
                setEditingPerson(undefined);
              }}
            >
              <View className="flex-1 justify-center items-center bg-black/50" style={{ padding }}>
                <View className="w-11/12 max-w-2xl" style={{ maxHeight: height * 0.9 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowForm(false);
                      setEditingPerson(undefined);
                    }}
                    className="self-end bg-white rounded-full items-center justify-center"
                    style={{ width: 32 * heightScale, height: 32 * heightScale, marginBottom: smallPadding }}
                  >
                    <Text className="text-gray-600 font-bold" style={{ fontSize: titleSize }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                  <DeceasedPersonForm
                    person={editingPerson}
                    onSave={editingPerson ? editDeceasedPerson : addDeceasedPerson}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingPerson(undefined);
                    }}
                    imgbbApiKey={settings.deceasedSettings.imgbbApiKey || ''}
                  />
                </View>
              </View>
            </Modal>

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
