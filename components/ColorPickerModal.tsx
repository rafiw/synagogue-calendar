import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
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
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-2xl p-5 w-full max-w-[500px] max-h-[90%]">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-800 text-center">{title || t('background_solid_color')}</Text>
          </View>

          {/* Color Picker */}
          <ColorPicker style={{ width: '100%', gap: 16 }} value={selectedColor} onComplete={onSelectColorComplete}>
            <Preview style={{ height: 80, borderRadius: 12, borderWidth: 2, borderColor: '#ddd' }} />
            <Panel1 style={{ height: 200, borderRadius: 12 }} />
            <HueSlider style={{ height: 40, borderRadius: 12 }} />
            <Swatches
              style={{ marginTop: 8 }}
              swatchStyle={{ borderRadius: 8, margin: 4 }}
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
                '#FFF3E0',
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

          {/* Current Color Display */}
          <View className="flex-row items-center justify-center mt-4 mb-4 p-3 bg-gray-100 rounded-lg">
            <Text className="text-sm font-semibold text-gray-600 mr-2">{t('background_solid_color')}:</Text>
            <Text className="text-base font-bold text-gray-800">{selectedColor.toUpperCase()}</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-gray-100 border border-gray-300"
              onPress={handleCancel}
            >
              <Text className="text-gray-600 text-base font-semibold text-center">{t('deceased_cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-lg bg-blue-500" onPress={handleConfirm}>
              <Text className="text-white text-base font-semibold text-center">{t('deceased_save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ColorPickerModal;
