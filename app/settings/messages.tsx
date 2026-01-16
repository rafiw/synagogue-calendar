import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const MessagesSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const saveChecked = (value: boolean) => {
    updateSettings({ enableMessages: value });
    console.log('saveChecked', value);
  };

  if (isLoading || !i18n?.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <View className="flex-1  mt-4">
      <BouncyCheckbox
        isChecked={settings.enableMessages}
        fillColor="green"
        iconStyle={{ borderColor: 'green' }}
        innerIconStyle={{ borderWidth: 2 }}
        text={t('enable_messages')}
        textComponent={<Text>{t('enable_messages')}</Text>}
        onPress={(value) => void saveChecked(value)}
      />

      {settings.enableMessages && (
        <View className="flex-1 px-4 mt-4">
          {/* Add New Message Button */}
          <TouchableOpacity
            onPress={() => {
              // Add logic to add new message
              const newMessages = [...settings.messages, ''];
              updateSettings({ ...settings, messages: newMessages });
            }}
            className="flex-row items-center justify-center bg-blue-500 p-3 rounded-lg mb-4"
          >
            <Feather name="plus" size={24} color="white" />
            <Text className="text-white ml-2 font-medium">{t('')}</Text>
          </TouchableOpacity>

          {/* Messages List */}
          <FlatList
            data={settings.messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View className="flex-row items-center bg-white p-4 rounded-lg mb-2 shadow-sm">
                <TextInput
                  value={item}
                  onChangeText={(newText) => {
                    const newMessages = [...settings.messages];
                    newMessages[index] = newText;
                    updateSettings({ ...settings, messages: newMessages });
                  }}
                  className="flex-1 text-base"
                  placeholder={t('enter_message')}
                />

                <TouchableOpacity
                  onPress={() => {
                    const newMessages = settings.messages.filter((_, i) => i !== index);
                    updateSettings({ ...settings, messages: newMessages });
                  }}
                  className="ml-4"
                >
                  <Feather name="x" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default MessagesSettingsTab;
