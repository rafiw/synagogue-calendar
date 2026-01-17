import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { ScrollView } from 'react-native-gesture-handler';
import { daysOfWeek } from 'utils/classesHelpers';
import { Shiur } from 'utils/defs';
import { isRTL } from 'utils/utils';

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
    const updatedClasses = [...settings.classes, defaultShiur];
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
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm  border border-gray-500">
      <View className={`flex-row ${rtl ? 'justify-end' : 'justify-start'}`}>
        <TouchableOpacity onPress={() => handleDeleteClass(index)} className="p-2">
          <Feather name="trash-2" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4 ">
        {/* Days of the week selection */}
        <View>
          <Text className="text-gray-600 mb-2 text-center font-medium">{t('day')}</Text>
          <View className={`flex-row flex-wrap gap-2 ${rtl ? 'justify-end' : 'justify-start'}`}>
            {(rtl ? [...daysOfWeek].reverse() : daysOfWeek).map((day) => (
              <View key={day.number} className="flex-row items-center mb-2">
                <BouncyCheckbox
                  size={25}
                  isChecked={item.day.includes(day.number)}
                  fillColor="#3b82f6"
                  iconStyle={checkboxStyles.blue.iconStyle}
                  innerIconStyle={checkboxStyles.blue.innerIconStyle}
                  onPress={() => handleToggleDay(index, day.number)}
                  textComponent={<Text className={`${rtl ? 'mr-2' : 'ml-2'} text-gray-700`}>{t(day.key)}</Text>}
                />
              </View>
            ))}
          </View>
        </View>

        <View className={`flex-row gap-4${rtl ? 'space-x-reverse' : ''} space-x-4`}>
          <View className="flex-1">
            <Text className="text-gray-600 mb-1 text-center">{t('start_time')}</Text>
            <TextInput
              value={item.start}
              onChangeText={(value) => handleUpdateClass(index, 'start', value)}
              className="border border-gray-300 rounded-md p-2 text-center"
              placeholder="HH:MM"
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-600 mb-1 text-center">{t('end_time')}</Text>
            <TextInput
              value={item.end}
              onChangeText={(value) => handleUpdateClass(index, 'end', value)}
              className="border border-gray-300 rounded-md p-2 text-center"
              placeholder="HH:MM"
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>
        </View>

        <View className={`flex-row gap-4 flex-row ${rtl ? 'space-x-reverse' : ''} space-x-4`}>
          <View className="flex-1">
            <Text className="text-gray-600 mb-1 text-center">{t('tutor')}</Text>
            <TextInput
              value={item.tutor}
              onChangeText={(value) => handleUpdateClass(index, 'tutor', value)}
              className="border border-gray-300 rounded-md p-2 text-center"
              placeholder={t('tutor')}
              textAlign={rtl ? 'right' : 'left'}
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-600 mb-1 text-center">{t('subject')}</Text>
            <TextInput
              value={item.subject}
              onChangeText={(value) => handleUpdateClass(index, 'subject', value)}
              className="border border-gray-300 rounded-md p-2 text-center"
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
    <View className="flex-1 mt-4">
      <BouncyCheckbox
        isChecked={settings.enableClasses}
        fillColor="green"
        iconStyle={checkboxStyles.green.iconStyle}
        innerIconStyle={checkboxStyles.green.innerIconStyle}
        text={t('enable_classes')}
        textComponent={<Text>{t('enable_classes')}</Text>}
        onPress={(value) => saveChecked(value)}
      />
      {settings.enableClasses && (
        <ScrollView>
          <View className="flex-1 p-4 ">
            <TouchableOpacity
              onPress={handleAddClass}
              className="flex-row items-center justify-center bg-blue-500 p-3 rounded-lg mb-4"
            >
              <Feather name="plus" size={24} color="white" />
              <Text className="text-white ml-2 font-medium">{t('add_class')}</Text>
            </TouchableOpacity>

            <FlatList
              data={settings.classes}
              renderItem={({ item, index }) => renderClassItem({ rtl, item, index })}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-4"
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ClassesSettingsTab;
