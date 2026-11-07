import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffectiveDimensions, useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from '@utils/responsive';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  title?: string;
  style?: any;
  nativeID?: string;
}

export const DropdownPicker: React.FC<DropdownPickerProps> = ({
  selectedValue,
  onValueChange,
  options,
  title,
  style,
  nativeID,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { width, height, physicalWidth, physicalHeight, isRotated, rotationDegrees } = useEffectiveDimensions();
  const heightScale = useHeightScale() * 0.5;
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const titleSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => opt.value === selectedValue);
    return found ? found.label : selectedValue;
  }, [options, selectedValue]);

  const showSearch = options.length > 10;

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleOpen = () => {
    setSearchQuery('');
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        nativeID={nativeID}
        onPress={handleOpen}
        className="flex-row items-center justify-between px-3"
        style={[{ minHeight: 40 }, style]}
        activeOpacity={0.7}
      >
        <Text className="text-gray-800 flex-1" style={{ fontSize: Math.max(13, textSize) }} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Feather name="chevron-down" size={Math.max(16, textSize * 1.1)} color="#4b5563" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View
          style={
            isRotated
              ? {
                  width: physicalWidth,
                  height: physicalHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }
              : { flex: 1, width: '100%', height: '100%' }
          }
        >
          <View
            style={
              isRotated
                ? {
                    width,
                    height,
                    transform: [{ rotate: rotationDegrees }],
                  }
                : { flex: 1, width: '100%', height: '100%' }
            }
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setVisible(false)}
              className="flex-1 bg-black/50 items-center justify-center p-4"
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                style={{ maxHeight: Math.round(height * 0.75), padding: padding * 1.2 }}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between pb-2 border-b border-gray-200">
                  <Text className="font-bold text-gray-800" style={{ fontSize: Math.max(16, titleSize) }}>
                    {title || selectedLabel}
                  </Text>
                  <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: smallPadding / 2 }}>
                    <Feather name="x" size={Math.max(18, titleSize)} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Optional Search for long lists (e.g. cities/timezones) */}
                {showSearch && (
                  <View style={{ marginTop: smallPadding, marginBottom: smallPadding }}>
                    <TextInput
                      nativeID={nativeID ? `${nativeID}-search` : 'dropdown-search'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="..."
                      className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2"
                      style={{ fontSize: Math.max(14, textSize) }}
                      autoCorrect={false}
                    />
                  </View>
                )}

                {/* Options List */}
                <ScrollView style={{ marginTop: smallPadding }}>
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === selectedValue;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          onValueChange(option.value);
                          setVisible(false);
                        }}
                        className={`flex-row items-center justify-between rounded-lg px-3 py-2.5 mb-1 ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-50'
                        }`}
                      >
                        <Text
                          className={`flex-1 ${isSelected ? 'text-white font-bold' : 'text-gray-800 font-medium'}`}
                          style={{ fontSize: Math.max(14, textSize) }}
                        >
                          {option.label}
                        </Text>
                        {isSelected && <Feather name="check" size={Math.max(16, textSize)} color="#ffffff" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DropdownPicker;
