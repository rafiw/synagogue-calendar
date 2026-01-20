import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { View, Text, Pressable } from 'react-native';
import { DayPicker } from 'react-day-picker';
import { format as formatFns, parse as parseFns } from 'date-fns';
import 'react-day-picker/style.css';
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
      return parseFns(dateString, 'yyyy-MM-dd', new Date());
    } else {
      return parseFns(dateString, 'dd/MM/yyyy', new Date());
    }
  };

  const formatDate = (date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY'): string => {
    if (format === 'YYYY-MM-DD') {
      return formatFns(date, 'yyyy-MM-dd');
    } else {
      return formatFns(date, 'dd/MM/yyyy');
    }
  };

  const selectedDate = value ? parseDate(value, dateFormat) : undefined;

  const handleOpen = () => {
    setShowPicker(!showPicker);
  };

  return (
    <View className="mb-3">
      <Text className="text-gray-600 mb-1 text-sm">{label}</Text>
      <Pressable
        onPress={handleOpen}
        className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white p-3 cursor-pointer"
      >
        <Text className={value ? 'text-gray-900' : 'text-gray-400'}>{value || label}</Text>
        <Feather name="calendar" size={20} color="#6B7280" />
      </Pressable>

      {showPicker &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
            }}
            onClick={() => setShowPicker(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 16,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onChange(formatDate(date, dateFormat));
                    setShowPicker(false);
                  }
                }}
                captionLayout="dropdown"
                startMonth={new Date(new Date().getFullYear() - 200, 0)}
                endMonth={new Date()}
                defaultMonth={selectedDate}
              />
            </div>
          </div>,
          document.body,
        )}
    </View>
  );
};
