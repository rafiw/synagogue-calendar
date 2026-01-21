import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { daysOfWeek } from 'utils/classesHelpers';
import { Class } from 'utils/defs';
import { isRTL } from 'utils/utils';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

// Checkbox styles - extracted to avoid inline style warnings
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

const ClassesSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const [rtl, setRtl] = useState(false);
  const heightScale = useHeightScale() * 0.6;

  // Responsive sizes with height adjustment
  const labelSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const checkboxSize = Math.round(25 * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('medium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  const saveChecked = (value: boolean) => {
    updateSettings({ classesSettings: { ...settings.classesSettings, enable: value } });
  };

  const defaultClass: Class = {
    id: '',
    day: [0],
    start: '',
    end: '',
    tutor: '',
    subject: '',
  };

  const handleAddClass = () => {
    // Generate unique ID for new class to prevent duplicate keys
    const newClass: Class = {
      ...defaultClass,
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const updatedClasses = [newClass, ...settings.classesSettings.classes];

    updateSettings({ classesSettings: { ...settings.classesSettings, classes: updatedClasses } });
  };

  const validateTime = (timeStr: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeStr);
  };

  const compareTimeStrings = (time1: string, time2: string): number => {
    if (!time1 || !time2) return 0;
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const mins1 = (h1 || 0) * 60 + (m1 || 0);
    const mins2 = (h2 || 0) * 60 + (m2 || 0);
    return mins1 - mins2;
  };

  const getTimeWarning = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) return null;

    if (startTime && !validateTime(startTime)) {
      return t('invalid_time_format');
    }
    if (endTime && !validateTime(endTime)) {
      return t('invalid_time_format');
    }

    if (compareTimeStrings(startTime, endTime) >= 0) {
      return t('end_time_before_start');
    }

    return null;
  };

  const handleUpdateClass = (index: number, field: keyof Class, value: string | number[]) => {
    const updatedClasses = [...settings.classesSettings.classes];
    const currentClass = updatedClasses[index] ?? defaultClass;
    updatedClasses[index] = {
      ...currentClass,
      [field]: value,
    };
    updateSettings({ classesSettings: { ...settings.classesSettings, classes: updatedClasses } });
  };

  const handleToggleDay = (classIndex: number, dayNumber: number) => {
    const updatedClasses = [...settings.classesSettings.classes];
    const currentClass = updatedClasses[classIndex] ?? defaultClass;
    const currentDays = currentClass.day ?? [];

    if (currentDays.includes(dayNumber)) {
      // Remove the day
      updatedClasses[classIndex] = {
        ...currentClass,
        day: currentDays.filter((d) => d !== dayNumber),
      };
    } else {
      // Add the day and sort
      updatedClasses[classIndex] = {
        ...currentClass,
        day: [...currentDays, dayNumber].sort((a, b) => a - b),
      };
    }

    updateSettings({ classesSettings: { ...settings.classesSettings, classes: updatedClasses } });
  };

  const handleDeleteClass = (index: number) => {
    const updatedClasses = settings.classesSettings.classes.filter((_, i) => i !== index);
    updateSettings({ classesSettings: { ...settings.classesSettings, classes: updatedClasses } });
  };

  const handleMoveClass = (index: number, direction: 'up' | 'down') => {
    const updatedClasses = [...settings.classesSettings.classes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updatedClasses.length) return;

    const temp = updatedClasses[index];
    const swap = updatedClasses[newIndex];
    if (temp && swap) {
      updatedClasses[index] = swap;
      updatedClasses[newIndex] = temp;
      updateSettings({ classesSettings: { ...settings.classesSettings, classes: updatedClasses } });
    }
  };

  const renderClassItem = ({ rtl, item, index }: { rtl: boolean; item: Class; index: number }) => (
    <View className="bg-white rounded-lg shadow-sm border border-gray-500" style={{ padding, marginBottom: margin }}>
      <View className={`flex-row items-center`} style={{ gap: smallPadding }}>
        <View className="flex-row" style={{ gap: smallPadding }}>
          <TouchableOpacity
            onPress={() => handleMoveClass(index, 'up')}
            disabled={index === 0}
            style={{ padding: smallPadding }}
          >
            <Feather name="arrow-up" size={iconSize} color={index === 0 ? '#ccc' : '#3b82f6'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMoveClass(index, 'down')}
            disabled={index === settings.classesSettings.classes.length - 1}
            style={{ padding: smallPadding }}
          >
            <Feather
              name="arrow-down"
              size={iconSize}
              color={index === settings.classesSettings.classes.length - 1 ? '#ccc' : '#3b82f6'}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1">
          <TextInput
            value={item.title || ''}
            onChangeText={(value) => handleUpdateClass(index, 'title', value)}
            className="border border-gray-300 rounded-md text-center"
            style={{ padding: smallPadding, fontSize: textSize }}
            placeholder={t('class_title_placeholder')}
            textAlign={rtl ? 'right' : 'left'}
          />
        </View>
        <TouchableOpacity onPress={() => handleDeleteClass(index)} style={{ padding: smallPadding }}>
          <Feather name="trash-2" size={iconSize} color="red" />
        </TouchableOpacity>
      </View>
      <View style={{ gap: padding }}>
        {/* Days of the week selection */}
        <View>
          <Text
            className="text-gray-600 text-center font-medium"
            style={{ fontSize: labelSize, marginBottom: smallPadding }}
          >
            {t('day')}
          </Text>
          <View className={`flex-row flex-wrap ${rtl ? 'justify-end' : 'justify-start'}`} style={{ gap: smallPadding }}>
            {(rtl ? [...daysOfWeek].reverse() : daysOfWeek).map((day) => (
              <View key={day.number} className="flex-row items-center" style={{ marginBottom: smallPadding }}>
                <BouncyCheckbox
                  size={checkboxSize}
                  isChecked={item.day.includes(day.number)}
                  fillColor="#3b82f6"
                  iconStyle={checkboxStyles.blue.iconStyle}
                  innerIconStyle={checkboxStyles.blue.innerIconStyle}
                  onPress={() => handleToggleDay(index, day.number)}
                  textComponent={
                    <Text
                      className="text-gray-700"
                      style={{
                        fontSize: textSize,
                        marginLeft: rtl ? 0 : smallPadding,
                        marginRight: rtl ? smallPadding : 0,
                      }}
                    >
                      {t(day.key)}
                    </Text>
                  }
                />
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: smallPadding }}>
          <View className={`flex-row ${rtl ? 'space-x-reverse' : ''}`} style={{ gap: padding }}>
            <View className="flex-1">
              <Text
                className="text-gray-600 text-center"
                style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}
              >
                {rtl ? t('end_time') : t('start_time')}
              </Text>
              <TextInput
                value={rtl ? item.end : item.start}
                onChangeText={(value) => handleUpdateClass(index, rtl ? 'end' : 'start', value)}
                className="border border-gray-300 rounded-md text-center"
                style={{ padding: smallPadding, fontSize: textSize }}
                placeholder="HH:MM"
                textAlign={rtl ? 'right' : 'left'}
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-gray-600 text-center"
                style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}
              >
                {rtl ? t('start_time') : t('end_time')}
              </Text>
              <TextInput
                value={rtl ? item.start : item.end}
                onChangeText={(value) => handleUpdateClass(index, rtl ? 'start' : 'end', value)}
                className="border border-gray-300 rounded-md text-center"
                style={{ padding: smallPadding, fontSize: textSize }}
                placeholder="HH:MM"
                textAlign={rtl ? 'right' : 'left'}
              />
            </View>
          </View>
          {(() => {
            const warning = getTimeWarning(item.start, item.end);
            return warning ? (
              <View className="bg-yellow-50 border border-yellow-400 rounded-md" style={{ padding: smallPadding }}>
                <Text className="text-yellow-800 text-center" style={{ fontSize: labelSize }}>
                  ⚠️ {warning}
                </Text>
              </View>
            ) : null;
          })()}
        </View>

        <View className={`flex-row ${rtl ? 'space-x-reverse' : ''}`} style={{ gap: padding }}>
          <View className="flex-1">
            <Text className="text-gray-600 text-center" style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}>
              {t('tutor')}
            </Text>
            <TextInput
              value={item.tutor}
              onChangeText={(value) => handleUpdateClass(index, 'tutor', value)}
              className="border border-gray-300 rounded-md text-center"
              style={{ padding: smallPadding, fontSize: textSize }}
              placeholder={t('tutor')}
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-600 text-center" style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}>
              {t('subject')}
            </Text>
            <TextInput
              value={item.subject}
              onChangeText={(value) => handleUpdateClass(index, 'subject', value)}
              className="border border-gray-300 rounded-md text-center"
              style={{ padding: smallPadding, fontSize: textSize }}
              placeholder={t('subject')}
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading || !i18n?.isInitialized) {
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
          isChecked={settings.classesSettings.enable}
          fillColor="green"
          iconStyle={checkboxStyles.green.iconStyle}
          innerIconStyle={checkboxStyles.green.innerIconStyle}
          text={t('enable_classes')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_classes')}</Text>}
          onPress={(value) => saveChecked(value)}
        />
      </View>
      {settings.classesSettings.enable && (
        <View style={{ paddingHorizontal: padding, marginTop: margin, marginBottom: margin }}>
          <View className="flex-row items-center justify-center" style={{ gap: padding }}>
            <Text className="text-gray-600" style={{ fontSize: labelSize }}>
              {t('screen_display_time_description')}
            </Text>
            <View className="flex-row items-center" style={{ gap: smallPadding }}>
              <TouchableOpacity
                onPress={() => {
                  const currentTime = settings.classesSettings.screenDisplayTime || 10;
                  const newTime = Math.max(1, currentTime - 1);
                  updateSettings({
                    classesSettings: {
                      ...settings.classesSettings,
                      screenDisplayTime: newTime,
                    },
                  });
                }}
                className="bg-gray-200 rounded-lg items-center justify-center"
                style={{ padding: smallPadding, width: 32 * heightScale, height: 32 * heightScale }}
              >
                <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                  -
                </Text>
              </TouchableOpacity>
              <View
                className="bg-blue-100 rounded-lg items-center justify-center"
                style={{ paddingHorizontal: padding, paddingVertical: smallPadding, minWidth: 50 * heightScale }}
              >
                <Text className="text-blue-900 font-bold" style={{ fontSize: textSize }}>
                  {settings.classesSettings.screenDisplayTime || 10}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const currentTime = settings.classesSettings.screenDisplayTime || 10;
                  const newTime = Math.min(60, currentTime + 1);
                  updateSettings({
                    classesSettings: {
                      ...settings.classesSettings,
                      screenDisplayTime: newTime,
                    },
                  });
                }}
                className="bg-gray-200 rounded-lg items-center justify-center"
                style={{ padding: smallPadding, width: 32 * heightScale, height: 32 * heightScale }}
              >
                <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {settings.classesSettings.enable && (
        <View className="flex-1" style={{ padding }}>
          <FlatList
            data={settings.classesSettings.classes}
            renderItem={({ item, index }) => renderClassItem({ rtl, item, index })}
            keyExtractor={(item, index) => item.id || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: padding }}
            ListHeaderComponent={
              <TouchableOpacity
                onPress={handleAddClass}
                className="flex-row items-center justify-center bg-blue-500 rounded-lg"
                style={{ padding: smallPadding * 1.5, marginBottom: margin }}
              >
                <Feather name="plus" size={iconSize} color="white" />
                <Text className="text-white font-medium" style={{ fontSize: buttonTextSize, marginLeft: smallPadding }}>
                  {t('add_class')}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
    </View>
  );
};

export default ClassesSettingsTab;
