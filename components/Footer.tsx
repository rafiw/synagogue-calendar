import React from 'react';
import { View, Text } from 'react-native';

const Footer: React.FC<{ footerText: string }> = ({ footerText }) => (
  <View className="bg-gray-800/90 py-4 px-6">
    <Text className="text-white text-center text-lg font-medium">{footerText}</Text>
  </View>
);

export default Footer;
