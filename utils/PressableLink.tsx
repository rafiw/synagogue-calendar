import React from 'react';
import { Text, Pressable, Linking } from 'react-native';

type PressableLinkProps = {
  url: string;
  label?: string;
};

const ExternalLink: React.FC<PressableLinkProps> = ({ url, label }) => {
  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <Pressable onPress={handlePress}>
      <Text className="text-blue-600 underline">{label ?? url}</Text>
    </Pressable>
  );
};

export default ExternalLink;
