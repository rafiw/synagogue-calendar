import { Feather } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { DatePicker } from '../../components/DatePicker';
import { Message } from 'utils/defs';
import { isMessageExpired, isMessageScheduled } from 'utils/classesHelpers';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;

const MessagesSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const heightScale = useHeightScale() * 0.6;

  // Responsive sizes with height adjustment
  const labelSize = Math.round(useResponsiveFontSize('labelSmall') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const checkboxSize = Math.round(25 * heightScale);
  const smallCheckboxSize = Math.round(20 * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('medium') * heightScale);
  const smallIconSize = Math.round(useResponsiveIconSize('small') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);

  const saveChecked = (value: boolean) => {
    updateSettings({ messagesSettings: { ...settings.messagesSettings, enable: value } });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    const newMessages = settings.messagesSettings.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg));
    updateSettings({ messagesSettings: { ...settings.messagesSettings, messages: newMessages } });
  };

  const deleteMessage = (id: string) => {
    const newMessages = settings.messagesSettings.messages.filter((msg) => msg.id !== id);
    updateSettings({ messagesSettings: { ...settings.messagesSettings, messages: newMessages } });
  };

  const addNewMessage = () => {
    const newMessage: Message = {
      id: generateId(),
      text: '',
      enabled: true,
    };
    updateSettings({
      messagesSettings: { ...settings.messagesSettings, messages: [newMessage, ...settings.messagesSettings.messages] },
    });
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
    <View className="flex-1" style={{ marginTop: margin }}>
      <View className="flex-row items-center justify-center" style={{ gap: padding }}>
        <BouncyCheckbox
          size={checkboxSize}
          isChecked={settings.messagesSettings.enable}
          fillColor="green"
          iconStyle={{ borderColor: 'green' }}
          innerIconStyle={{ borderWidth: 2 }}
          text={t('enable_messages')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_messages')}</Text>}
          onPress={(value) => void saveChecked(value)}
        />
      </View>
      {settings.messagesSettings.enable && (
        <View style={{ paddingHorizontal: padding, marginTop: margin, marginBottom: margin }}>
          <View className="flex-row items-center justify-center" style={{ gap: padding }}>
            <Text className="text-gray-600" style={{ fontSize: labelSize }}>
              {t('screen_display_time_description')}
            </Text>
            <View className="flex-row items-center" style={{ gap: smallPadding }}>
              <TouchableOpacity
                onPress={() => {
                  const currentTime = settings.messagesSettings.screenDisplayTime || 10;
                  const newTime = Math.max(1, currentTime - 1);
                  updateSettings({
                    messagesSettings: {
                      ...settings.messagesSettings,
                      screenDisplayTime: newTime,
                    },
                  });
                }}
                className="bg-gray-200 rounded-lg items-center justify-center"
                style={{ padding: smallPadding, width: 32 * heightScale, height: 32 * heightScale }}
              >
                <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                  -
                </Text>
              </TouchableOpacity>
              <View
                className="bg-blue-100 rounded-lg items-center justify-center"
                style={{ paddingHorizontal: padding, paddingVertical: smallPadding, minWidth: 50 * heightScale }}
              >
                <Text className="text-blue-900 font-bold" style={{ fontSize: textSize }}>
                  {settings.messagesSettings.screenDisplayTime || 10}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const currentTime = settings.messagesSettings.screenDisplayTime || 10;
                  const newTime = Math.min(60, currentTime + 1);
                  updateSettings({
                    messagesSettings: {
                      ...settings.messagesSettings,
                      screenDisplayTime: newTime,
                    },
                  });
                }}
                className="bg-gray-200 rounded-lg items-center justify-center"
                style={{ padding: smallPadding, width: 32 * heightScale, height: 32 * heightScale }}
              >
                <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {settings.messagesSettings.enable && (
        <View className="flex-1" style={{ paddingHorizontal: padding, marginTop: margin }}>
          <FlatList
            data={settings.messagesSettings.messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const status = getMessageStatus(item);

              return (
                <View
                  className={`bg-white rounded-lg shadow-sm border ${getMessageBorderStyle(item)}`}
                  style={{ padding, marginBottom: smallPadding }}
                >
                  {/* Status Badge */}
                  <View className="flex-row justify-between items-center" style={{ marginBottom: smallPadding }}>
                    <View
                      className={`rounded ${status.color}`}
                      style={{ paddingHorizontal: smallPadding, paddingVertical: smallPadding / 2 }}
                    >
                      <Text className="text-white font-medium" style={{ fontSize: labelSize }}>
                        {status.label}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteMessage(item.id)}>
                      <Feather name="trash-2" size={iconSize} color="red" />
                    </TouchableOpacity>
                    {/* Enable/Disable Toggle */}
                    <View className="flex-row items-center justify-end">
                      <BouncyCheckbox
                        isChecked={item.enabled}
                        fillColor="green"
                        size={smallCheckboxSize}
                        iconStyle={{ borderColor: 'green' }}
                        innerIconStyle={{ borderWidth: 2 }}
                        text={t('message_enabled') || 'Enabled'}
                        textComponent={
                          <Text className="text-gray-700" style={{ fontSize: labelSize, marginLeft: smallPadding }}>
                            {t('message_enabled') || 'Enabled'}
                          </Text>
                        }
                        onPress={(isChecked) => updateMessage(item.id, { enabled: isChecked })}
                      />
                    </View>
                  </View>

                  {/* Message Text */}
                  <TextInput
                    value={item.text}
                    onChangeText={(newText) => updateMessage(item.id, { text: newText })}
                    className="border border-gray-300 rounded-lg bg-white"
                    style={{ fontSize: textSize, padding: smallPadding * 1.5, marginBottom: smallPadding * 1.5 }}
                    placeholder={t('enter_message')}
                    multiline
                  />

                  {/* Date Range - Start and End on same line */}
                  <View className="flex-row items-center" style={{ gap: smallPadding }}>
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
                        <TouchableOpacity
                          onPress={() => clearDate(item.id, 'startDate')}
                          style={{ padding: smallPadding / 2 }}
                        >
                          <Feather name="x" size={smallIconSize} color="#999" />
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
                        <TouchableOpacity
                          onPress={() => clearDate(item.id, 'endDate')}
                          style={{ padding: smallPadding / 2 }}
                        >
                          <Feather name="x" size={smallIconSize} color="#999" />
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
                className="flex-row items-center justify-center bg-blue-500 rounded-lg"
                style={{ padding: smallPadding * 1.5, marginBottom: margin }}
              >
                <Feather name="plus" size={iconSize} color="white" />
                <Text className="text-white font-medium" style={{ fontSize: buttonTextSize, marginLeft: smallPadding }}>
                  {t('add_message')}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
    </View>
  );
};

export default MessagesSettingsTab;
