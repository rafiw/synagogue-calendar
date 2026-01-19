import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { DatePicker } from '../../components/DatePicker';
import { Message } from 'utils/defs';
import { isMessageExpired, isMessageScheduled } from 'utils/classesHelpers';

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;

const MessagesSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();

  const saveChecked = (value: boolean) => {
    updateSettings({ enableMessages: value });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    const newMessages = settings.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg));
    updateSettings({ messages: newMessages });
  };

  const deleteMessage = (id: string) => {
    const newMessages = settings.messages.filter((msg) => msg.id !== id);
    updateSettings({ messages: newMessages });
  };

  const addNewMessage = () => {
    const newMessage: Message = {
      id: generateId(),
      text: '',
      enabled: true,
    };
    updateSettings({ messages: [newMessage, ...settings.messages] });
  };

  const clearDate = (messageId: string, field: 'startDate' | 'endDate') => {
    updateMessage(messageId, { [field]: undefined });
  };

  const getMessageStatus = (item: Message) => {
    if (!item.enabled) return { label: t('disabled') || 'Disabled', color: 'bg-gray-400' };
    if (isMessageExpired(item)) return { label: t('expired') || 'Expired', color: 'bg-orange-500' };
    if (isMessageScheduled(item)) return { label: t('scheduled') || 'Scheduled', color: 'bg-blue-500' };
    return { label: t('active') || 'Active', color: 'bg-green-500' };
  };

  const getMessageBorderStyle = (item: Message) => {
    if (!item.enabled) return 'border-gray-300 bg-gray-100';
    if (isMessageExpired(item)) return 'border-orange-300 bg-orange-50';
    if (isMessageScheduled(item)) return 'border-blue-300';
    return 'border-green-500';
  };

  if (isLoading || !i18n?.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 mt-4">
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
          <FlatList
            data={settings.messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const status = getMessageStatus(item);

              return (
                <View className={`bg-white p-4 rounded-lg mb-2 shadow-sm border ${getMessageBorderStyle(item)}`}>
                  {/* Status Badge */}
                  <View className="flex-row justify-between items-center mb-2">
                    <View className={`px-2 py-1 rounded ${status.color}`}>
                      <Text className="text-white text-xs font-medium">{status.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteMessage(item.id)}>
                      <Feather name="trash-2" size={20} color="red" />
                    </TouchableOpacity>
                    {/* Enable/Disable Toggle */}
                    <View className="flex-row items-center justify-end">
                      <BouncyCheckbox
                        isChecked={item.enabled}
                        fillColor="green"
                        size={20}
                        iconStyle={{ borderColor: 'green' }}
                        innerIconStyle={{ borderWidth: 2 }}
                        text={t('message_enabled') || 'Enabled'}
                        textComponent={
                          <Text className="text-sm text-gray-700 ml-2">{t('message_enabled') || 'Enabled'}</Text>
                        }
                        onPress={(isChecked) => updateMessage(item.id, { enabled: isChecked })}
                      />
                    </View>
                  </View>

                  {/* Message Text */}
                  <TextInput
                    value={item.text}
                    onChangeText={(newText) => updateMessage(item.id, { text: newText })}
                    className="text-base border border-gray-300 rounded-lg p-3 mb-3 bg-white"
                    placeholder={t('enter_message')}
                    multiline
                  />

                  {/* Date Range - Start and End on same line */}
                  <View className="flex-row items-center gap-2">
                    {/* Start Date */}
                    <View className="flex-1 flex-row items-center">
                      <View className="flex-1">
                        <DatePicker
                          label={t('start_date') || 'From'}
                          value={item.startDate || ''}
                          format="YYYY-MM-DD"
                          onChange={(value) => updateMessage(item.id, { startDate: value })}
                        />
                      </View>
                      {item.startDate && (
                        <TouchableOpacity onPress={() => clearDate(item.id, 'startDate')} className="p-1">
                          <Feather name="x" size={16} color="#999" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* End Date */}
                    <View className="flex-1 flex-row items-center">
                      <View className="flex-1">
                        <DatePicker
                          label={t('end_date') || 'Until'}
                          value={item.endDate || ''}
                          format="YYYY-MM-DD"
                          onChange={(value) => updateMessage(item.id, { endDate: value })}
                        />
                      </View>
                      {item.endDate && (
                        <TouchableOpacity onPress={() => clearDate(item.id, 'endDate')} className="p-1">
                          <Feather name="x" size={16} color="#999" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListHeaderComponent={
              <TouchableOpacity
                onPress={addNewMessage}
                className="flex-row items-center justify-center bg-blue-500 p-3 rounded-lg mb-4"
              >
                <Feather name="plus" size={24} color="white" />
                <Text className="text-white ml-2 font-medium">{t('add_message')}</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
    </View>
  );
};

export default MessagesSettingsTab;
