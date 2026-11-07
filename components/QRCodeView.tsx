import React, { useMemo } from 'react';
import { View } from 'react-native';
import { generateQrMatrix, QRErrorCorrectLevel, ErrorCorrectLevel } from '@utils/qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  quietZoneModules?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectLevel?: ErrorCorrectLevel;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 200,
  quietZoneModules = 3,
  foregroundColor = '#111827',
  backgroundColor = '#ffffff',
  errorCorrectLevel = QRErrorCorrectLevel.M,
}) => {
  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value || ' ', errorCorrectLevel);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return [];
    }
  }, [value, errorCorrectLevel]);

  if (matrix.length === 0) {
    return null;
  }

  const moduleCount = matrix.length;
  const totalModules = moduleCount + quietZoneModules * 2;
  const cellSize = Math.max(2, Math.floor(size / totalModules));
  const actualSize = cellSize * totalModules;
  const paddingPx = cellSize * quietZoneModules;

  return (
    <View
      style={{
        width: actualSize,
        height: actualSize,
        backgroundColor,
        padding: paddingPx,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {matrix.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', height: cellSize }}>
          {row.map((isDark, colIndex) => (
            <View
              key={colIndex}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: isDark ? foregroundColor : backgroundColor,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export default QRCodeView;
