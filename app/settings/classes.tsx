import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { daysOfWeek } from 'utils/classesHelpers';
import { Shiur } from 'utils/defs';
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
    updateSettings({ enableClasses: value });
  };

  const defaultShiur: Shiur = {
    id: '',
    day: [0],
    start: '',
    end: '',
    tutor: '',
    subject: '',
  };

  const handleAddClass = () => {
    // Generate unique ID for new class to prevent duplicate keys
    const newClass: Shiur = {
      ...defaultShiur,
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const updatedClasses = [...settings.classes, newClass];
    updateSettings({ classes: updatedClasses });
  };

  const handleUpdateClass = (index: number, field: keyof Shiur, value: string | number[]) => {
    const updatedClasses = [...settings.classes];
    const currentClass = updatedClasses[index] ?? defaultShiur;
    updatedClasses[index] = {
      ...currentClass,
      [field]: value,
    };
    updateSettings({ classes: updatedClasses });
  };

  const handleToggleDay = (classIndex: number, dayNumber: number) => {
    const updatedClasses = [...settings.classes];
    const currentClass = updatedClasses[classIndex] ?? defaultShiur;
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

    updateSettings({ classes: updatedClasses });
  };

  const handleDeleteClass = (index: number) => {
    const updatedClasses = settings.classes.filter((_, i) => i !== index);
    updateSettings({ classes: updatedClasses });
  };

  const renderClassItem = ({ rtl, item, index }: { rtl: boolean; item: Shiur; index: number }) => (
    <View className="bg-white rounded-lg shadow-sm border border-gray-500" style={{ padding, marginBottom: margin }}>
      <View className={`flex-row ${rtl ? 'justify-end' : 'justify-start'}`}>
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

        <View className={`flex-row ${rtl ? 'space-x-reverse' : ''}`} style={{ gap: padding }}>
          <View className="flex-1">
            <Text className="text-gray-600 text-center" style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}>
              {t('start_time')}
            </Text>
            <TextInput
              value={item.start}
              onChangeText={(value) => handleUpdateClass(index, 'start', value)}
              className="border border-gray-300 rounded-md text-center"
              style={{ padding: smallPadding, fontSize: textSize }}
              placeholder="HH:MM"
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-600 text-center" style={{ fontSize: labelSize, marginBottom: smallPadding / 2 }}>
              {t('end_time')}
            </Text>
            <TextInput
              value={item.end}
              onChangeText={(value) => handleUpdateClass(index, 'end', value)}
              className="border border-gray-300 rounded-md text-center"
              style={{ padding: smallPadding, fontSize: textSize }}
              placeholder="HH:MM"
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>
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
      <BouncyCheckbox
        size={checkboxSize}
        isChecked={settings.enableClasses}
        fillColor="green"
        iconStyle={checkboxStyles.green.iconStyle}
        innerIconStyle={checkboxStyles.green.innerIconStyle}
        text={t('enable_classes')}
        textComponent={<Text style={{ fontSize: textSize }}>{t('enable_classes')}</Text>}
        onPress={(value) => saveChecked(value)}
      />
      {settings.enableClasses && (
        <View className="flex-1" style={{ padding }}>
          <FlatList
            data={settings.classes}
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
