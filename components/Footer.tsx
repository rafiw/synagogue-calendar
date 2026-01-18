import React from 'react';
import { View, Text } from 'react-native';

const Footer: React.FC<{ footerText: string }> = ({ footerText }) => (
  <View className="bg-white/30 py-4 px-6">
    <Text className="text-4xl text-gray-800 text-center font-bold">{footerText}</Text>
  </View>
);

export default Footer;
