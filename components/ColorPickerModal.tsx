import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';
import ColorPicker, { Panel1, Swatches, Preview, HueSlider } from 'reanimated-color-picker';
import { useTranslation } from 'react-i18next';

interface ColorPickerModalProps {
  visible: boolean;
  initialColor: string;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  title?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  initialColor,
  onClose,
  onSelectColor,
  title,
}) => {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const { height } = useWindowDimensions();

  // Compact mode for TV/small height screens
  const isCompact = height < 700;

  const onSelectColorComplete = (result: { hex: string }) => {
    setSelectedColor(result.hex);
  };

  const handleConfirm = () => {
    onSelectColor(selectedColor);
    onClose();
  };

  const handleCancel = () => {
    setSelectedColor(initialColor);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View className={`flex-1 bg-black/50 justify-center items-center ${isCompact ? 'p-2' : 'p-5'}`}>
        <View
          className={`bg-white rounded-xl w-full max-w-[500px] max-h-[95%] ${isCompact ? 'p-3' : 'p-5 rounded-2xl'}`}
        >
          {/* Header with color display inline */}
          <View className={`flex-row items-center justify-between ${isCompact ? 'mb-2' : 'mb-4'}`}></View>
          {/* Color Picker */}
          <ColorPicker
            style={{ width: '100%', gap: isCompact ? 8 : 16 }}
            value={selectedColor}
            onComplete={onSelectColorComplete}
          >
            <Preview
              style={{
                height: isCompact ? 40 : 80,
                borderRadius: isCompact ? 8 : 12,
                borderWidth: 2,
                borderColor: '#777777',
              }}
              hideText={true}
            />
            <Panel1 style={{ height: isCompact ? 120 : 200, borderRadius: isCompact ? 8 : 12 }} />
            <HueSlider style={{ height: isCompact ? 24 : 40, borderRadius: isCompact ? 8 : 12 }} />
            <Swatches
              swatchStyle={{
                borderRadius: 6,
                margin: isCompact ? 2 : 4,
                width: isCompact ? 28 : 32,
                height: isCompact ? 28 : 32,
              }}
              colors={[
                '#E3F2FD',
                '#BBDEFB',
                '#90CAF9',
                '#64B5F6',
                '#42A5F5',
                '#2196F3',
                '#1E88E5',
                '#1976D2',
                '#F3E5F5',
                '#E1BEE7',
                '#CE93D8',
                '#BA68C8',
                '#FFEBEE',
                '#FFCDD2',
                '#EF9A9A',
                '#E57373',
                '#aFF3E0',
                '#bFF3E0',
                '#cFF3E0',
                '#dFF3E0',
                '#eeF3E0',
                '#FFE0B2',
                '#FFCC80',
                '#FFB74D',
                '#E8F5E9',
                '#C8E6C9',
                '#A5D6A7',
                '#81C784',
              ]}
            />
          </ColorPicker>

          {/* Action Buttons */}
          <View className={`flex-row gap-2 ${isCompact ? 'mt-2' : 'mt-4'}`}>
            <TouchableOpacity
              className={`flex-1 rounded-lg bg-gray-100 border border-gray-300 ${isCompact ? 'py-2' : 'py-3'}`}
              onPress={handleCancel}
            >
              <Text className={`text-gray-600 font-semibold text-center ${isCompact ? 'text-sm' : 'text-base'}`}>
                {t('deceased_cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-lg bg-blue-500 ${isCompact ? 'py-2' : 'py-3'}`}
              onPress={handleConfirm}
            >
              <Text className={`text-white font-semibold text-center ${isCompact ? 'text-sm' : 'text-base'}`}>
                {t('deceased_save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ColorPickerModal;
