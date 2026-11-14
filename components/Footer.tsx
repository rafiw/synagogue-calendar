import React from 'react';
import { View, Text } from 'react-native';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale } from '@utils/responsive';
import { CARD_BORDER_CLASS, CARD_SURFACE_CLASS, TEXT_SHADOW_STYLE } from '@utils/surfaceStyles';

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
      className={`items-center justify-center ${CARD_SURFACE_CLASS} rounded-xl shadow-md border ${CARD_BORDER_CLASS}`}
      style={{ paddingVertical: paddingV, paddingHorizontal: paddingH }}
    >
      <Text
        className="font-bold text-gray-900 text-center"
        style={[{ fontSize: textSize }, TEXT_SHADOW_STYLE]}
        numberOfLines={1}
      >
        {footerText}
      </Text>
    </View>
  );
};

export default Footer;
