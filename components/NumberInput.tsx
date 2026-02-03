import { View, Text, TouchableOpacity } from 'react-native';

interface NumberInputProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  label?: string;
  labelSize?: number;
  textSize?: number;
  padding?: number;
  smallPadding?: number;
  heightScale?: number;
  buttonSize?: number;
  containerStyle?: object;
  showLabel?: boolean;
}

export const NumberInput = ({
  value,
  onChange,
  min = 1,
  max = 60,
  label,
  labelSize,
  textSize,
  padding,
  smallPadding,
  heightScale = 1,
  buttonSize,
  containerStyle,
  showLabel = true,
}: NumberInputProps) => {
  const defaultButtonSize = buttonSize || 32 * heightScale;
  const defaultPadding = padding || 16;
  const defaultSmallPadding = smallPadding || 8;
  const defaultTextSize = textSize || 16;
  const defaultLabelSize = labelSize || 16;

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  return (
    <View style={containerStyle}>
      <View className="flex-row items-center justify-center" style={{ gap: defaultPadding }}>
        {showLabel && label && (
          <Text className="text-gray-600" style={{ fontSize: defaultLabelSize }}>
            {label}
          </Text>
        )}
        <View className="flex-row items-center" style={{ gap: defaultSmallPadding }}>
          <TouchableOpacity
            onPress={handleDecrement}
            className="bg-gray-200 rounded-lg items-center justify-center"
            style={{ padding: defaultSmallPadding, width: defaultButtonSize, height: defaultButtonSize }}
          >
            <Text className="text-gray-700 font-bold" style={{ fontSize: defaultTextSize }}>
              -
            </Text>
          </TouchableOpacity>
          <View
            className="bg-blue-100 rounded-lg items-center justify-center"
            style={{
              paddingHorizontal: defaultPadding,
              paddingVertical: defaultSmallPadding,
              minWidth: 50 * heightScale,
            }}
          >
            <Text className="text-blue-900 font-bold" style={{ fontSize: defaultTextSize }}>
              {value}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleIncrement}
            className="bg-gray-200 rounded-lg items-center justify-center"
            style={{ padding: defaultSmallPadding, width: defaultButtonSize, height: defaultButtonSize }}
          >
            <Text className="text-gray-700 font-bold" style={{ fontSize: defaultTextSize }}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
