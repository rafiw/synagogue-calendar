import React from 'react';
import { View, Text } from 'react-native';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

interface FooterProps {
  footerText?: string;
}

const Footer: React.FC<FooterProps> = ({ footerText }) => {
  const heightScale = useHeightScale();
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const paddingV = Math.max(3, Math.round(useResponsiveSpacing(6) * heightScale));
  const paddingH = Math.round(useResponsiveSpacing(16) * heightScale);

  if (!footerText?.trim()) return null;

  return (
    <View
      className="items-center justify-center bg-white/55 rounded-xl shadow-md border border-white/60"
      style={{ paddingVertical: paddingV, paddingHorizontal: paddingH }}
    >
      <Text className="font-medium text-gray-800 text-center" style={{ fontSize: textSize }} numberOfLines={1}>
        {footerText}
      </Text>
    </View>
  );
};

export default Footer;
