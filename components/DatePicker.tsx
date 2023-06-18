import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

interface DatePickerProps {
  label: string;
  value: string;
  format: 'YYYY-MM-DD' | 'DD/MM/YYYY';
  onChange: (value: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, format: dateFormat, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const parseDate = (dateString: string, format: 'YYYY-MM-DD' | 'DD/MM/YYYY'): Date => {
    if (!dateString) return new Date();
    if (format === 'YYYY-MM-DD') {
      return new Date(dateString);
    } else {
      const [day, month, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  };

  const formatDate = (date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY'): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    } else {
      return `${day}/${month}/${year}`;
    }
  };

  return (
    <View className="mb-3">
      <Text className="text-gray-600 mb-1 text-sm">{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-300 rounded-lg p-3 bg-white flex-row items-center justify-between"
      >
        <Text className={value ? 'text-gray-900' : 'text-gray-400'}>{value || `${label}`}</Text>
        <Feather name="calendar" size={20} color="#6B7280" />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={parseDate(value, dateFormat)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) {
              onChange(formatDate(selectedDate, dateFormat));
            }
          }}
        />
      )}
    </View>
  );
};
