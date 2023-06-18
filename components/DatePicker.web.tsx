import React, { useState, useRef, useEffect } from 'react';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    // Small delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleOpen = () => {
    if (buttonRef.current) {
      // Get the native DOM element from the ref
      const element = buttonRef.current as unknown as HTMLElement;
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setShowPicker(!showPicker);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#4b5563', marginBottom: 4, fontSize: 14 }}>{label}</Text>
      <Pressable
        ref={buttonRef}
        onPress={handleOpen}
        style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          padding: 12,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <Text style={{ color: value ? '#111827' : '#9ca3af' }}>{value || label}</Text>
        <Feather name="calendar" size={20} color="#6B7280" />
      </Pressable>

      {showPicker &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              zIndex: 99999,
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }}
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
          </div>,
          document.body,
        )}
    </View>
  );
};
