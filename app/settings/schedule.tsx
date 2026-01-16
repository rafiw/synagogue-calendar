import { Feather, Ionicons } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useEffect, useState } from 'react';
import { ScheduleColumn, Prayer } from 'utils/defs';
import { showConfirm, showAlert } from 'utils/alert';
import { isRTL } from 'utils/utils';

const ScheduleSettingsTab = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, i18n } = useTranslation();
  const [editingColumn, setEditingColumn] = useState<ScheduleColumn | null>(null);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);
  const [isPrayerModalVisible, setIsPrayerModalVisible] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const [prayerName, setPrayerName] = useState('');
  const [prayerTime, setPrayerTime] = useState('');
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  const saveChecked = (value: boolean) => {
    updateSettings({ enableSchedule: value });
  };

  const openAddColumnModal = () => {
    setEditingColumn(null);
    setColumnTitle('');
    setIsColumnModalVisible(true);
  };

  const openEditColumnModal = (column: ScheduleColumn) => {
    setEditingColumn(column);
    setColumnTitle(column.title);
    setIsColumnModalVisible(true);
  };

  const saveColumn = () => {
    if (!columnTitle.trim()) {
      showAlert(t('error'), t('please_fill_in_all_required_fields'));
      return;
    }

    if (!settings.scheduleSettings) return;

    const columns = [...settings.scheduleSettings.columns];

    if (editingColumn) {
      // Edit existing column
      const index = columns.findIndex((c) => c.id === editingColumn.id);
      if (index !== -1) {
        const existingColumn = columns[index];
        if (existingColumn) {
          const updatedColumn: ScheduleColumn = {
            id: existingColumn.id,
            title: columnTitle,
            prayers: existingColumn.prayers,
          };
          columns[index] = updatedColumn;
        }
      }
    } else {
      // Add new column
      const newColumn: ScheduleColumn = {
        id: Date.now().toString(),
        title: columnTitle,
        prayers: [],
      };
      columns.push(newColumn);
    }

    updateSettings({
      scheduleSettings: {
        ...settings.scheduleSettings,
        columns,
      },
    });

    setIsColumnModalVisible(false);
    setColumnTitle('');
  };

  const deleteColumn = (columnId: string) => {
    showConfirm(
      t('confirm_delete'),
      t('sure_column_delete'),
      () => {
        if (!settings.scheduleSettings) return;
        const columns = settings.scheduleSettings.columns.filter((c) => c.id !== columnId);
        updateSettings({
          scheduleSettings: {
            ...settings.scheduleSettings,
            columns,
          },
        });
      },
      undefined,
      {
        confirmText: t('deceased_delete'),
        cancelText: t('deceased_cancel'),
        confirmStyle: 'destructive',
      },
    );
  };

  const openAddPrayerModal = (columnId: string) => {
    setActiveColumnId(columnId);
    setEditingPrayer(null);
    setPrayerName('');
    setPrayerTime('');
    setIsPrayerModalVisible(true);
  };

  const openEditPrayerModal = (columnId: string, prayer: Prayer) => {
    setActiveColumnId(columnId);
    setEditingPrayer(prayer);
    setPrayerName(prayer.name);
    setPrayerTime(prayer.time);
    setIsPrayerModalVisible(true);
  };

  const savePrayer = () => {
    if (!prayerName.trim() || !prayerTime.trim()) {
      showAlert(t('error'), t('please_fill_in_all_required_fields'));
      return;
    }

    if (!activeColumnId || !settings.scheduleSettings) return;

    const columns = [...settings.scheduleSettings.columns];
    const columnIndex = columns.findIndex((c) => c.id === activeColumnId);

    if (columnIndex === -1) return;

    const column = columns[columnIndex];
    if (!column) return;

    const prayers = [...column.prayers];

    if (editingPrayer) {
      // Edit existing prayer
      const prayerIndex = prayers.findIndex((p) => p.id === editingPrayer.id);
      if (prayerIndex !== -1) {
        const existingPrayer = prayers[prayerIndex];
        if (existingPrayer) {
          const updatedPrayer: Prayer = {
            id: existingPrayer.id,
            name: prayerName,
            time: prayerTime,
          };
          prayers[prayerIndex] = updatedPrayer;
        }
      }
    } else {
      // Add new prayer
      const newPrayer: Prayer = {
        id: Date.now().toString(),
        name: prayerName,
        time: prayerTime,
      };
      prayers.push(newPrayer);
    }

    const updatedColumn: ScheduleColumn = {
      id: column.id,
      title: column.title,
      prayers: prayers,
    };
    columns[columnIndex] = updatedColumn;

    updateSettings({
      scheduleSettings: {
        ...settings.scheduleSettings,
        columns,
      },
    });

    setIsPrayerModalVisible(false);
    setPrayerName('');
    setPrayerTime('');
  };

  const deletePrayer = (columnId: string, prayerId: string) => {
    showConfirm(
      t('confirm_delete'),
      t('sure_prayer_delete'),
      () => {
        if (!settings.scheduleSettings) return;
        const columns = [...settings.scheduleSettings.columns];
        const columnIndex = columns.findIndex((c) => c.id === columnId);

        if (columnIndex !== -1) {
          const column = columns[columnIndex];
          if (!column) return;
          const prayers = column.prayers.filter((p) => p.id !== prayerId);
          const updatedColumn: ScheduleColumn = {
            id: column.id,
            title: column.title,
            prayers: prayers,
          };
          columns[columnIndex] = updatedColumn;

          updateSettings({
            scheduleSettings: {
              ...settings.scheduleSettings,
              columns,
            },
          });
        }
      },
      undefined,
      {
        confirmText: t('deceased_delete'),
        cancelText: t('deceased_cancel'),
        confirmStyle: 'destructive',
      },
    );
  };

  if (isLoading || !i18n?.isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const columns = settings.scheduleSettings?.columns || [];

  return (
    <View className="flex-1 mt-4">
      <BouncyCheckbox
        isChecked={settings.enableSchedule}
        fillColor="green"
        iconStyle={{ borderColor: 'green' }}
        innerIconStyle={{ borderWidth: 2 }}
        text={t('enable_schedule')}
        textComponent={<Text>{t('enable_schedule')}</Text>}
        onPress={(value) => void saveChecked(value)}
      />

      {settings.enableSchedule && (
        <ScrollView className="flex-1 px-4 mt-4">
          {/* Add Column Button */}
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg mb-4 flex-row items-center justify-center"
            onPress={openAddColumnModal}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-bold ml-2">{t('schedule_add_column')}</Text>
          </TouchableOpacity>

          {/* Columns List */}
          {columns.map((column) => (
            <View key={column.id} className="bg-gray-100 rounded-lg p-4 mb-4  border border-gray-400">
              {/* Column Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xl font-bold flex-1">{column.title}</Text>
                <View className="flex-row gap-">
                  <TouchableOpacity onPress={() => openEditColumnModal(column)}>
                    <Feather name="edit" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteColumn(column.id)}>
                    <Feather name="trash-2" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Add Prayer Button */}
              <TouchableOpacity
                className="bg-green-500 p-2 rounded-lg mb-3 flex-row items-center justify-center"
                onPress={() => openAddPrayerModal(column.id)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-1">{t('schedule_add_prayer')}</Text>
              </TouchableOpacity>

              {/* Prayers List */}
              {column.prayers.length === 0 ? (
                <Text className="text-gray-500 text-center py-2">{t('schedule_no_prayers')}</Text>
              ) : (
                column.prayers.map((prayer) => (
                  <View
                    key={prayer.id}
                    className={`${rtl ? 'space-x-reverse' : ''} bg-white rounded-lg p-3 mb-2 flex-row items-center border border-gray-400 `}
                  >
                    <View className="flex-row flex-1 items-center justify-between pr-4">
                      <Text className="font-semibold text-base">{prayer.name}</Text>
                      <Text className="text-gray-700 font-bold text-base">{prayer.time}</Text>
                    </View>
                    <View className="flex-row gap-3 items-center">
                      <TouchableOpacity onPress={() => openEditPrayerModal(column.id, prayer)}>
                        <Feather name="edit" size={20} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletePrayer(column.id, prayer.id)}>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ))}

          {columns.length === 0 && <Text className="text-gray-500 text-center py-4">{t('schedule_no_prayers')}</Text>}
        </ScrollView>
      )}

      {/* Column Modal */}
      <Modal
        visible={isColumnModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsColumnModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 ">
          <View className="bg-white rounded-lg p-6 w-4/5 max-w-md">
            <Text className="text-xl font-bold mb-4">
              {editingColumn ? t('schedule_edit_column') : t('schedule_add_column')}
            </Text>

            <Text className="mb-2">{t('schedule_column_title')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4"
              value={columnTitle}
              onChangeText={setColumnTitle}
              placeholder={t('schedule_column_title')}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-gray-300 p-3 rounded-lg"
                onPress={() => setIsColumnModalVisible(false)}
              >
                <Text className="text-center font-semibold">{t('deceased_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-500 p-3 rounded-lg" onPress={saveColumn}>
                <Text className="text-center font-semibold text-white">{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prayer Modal */}
      <Modal
        visible={isPrayerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPrayerModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5 max-w-md">
            <Text className="text-xl font-bold mb-4">
              {editingPrayer ? t('schedule_edit_prayer') : t('schedule_add_prayer')}
            </Text>

            <Text className="mb-2">{t('schedule_prayer_name')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4"
              value={prayerName}
              onChangeText={setPrayerName}
              placeholder={t('schedule_prayer_name')}
            />

            <Text className="mb-2">{t('schedule_prayer_time')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4"
              value={prayerTime}
              onChangeText={setPrayerTime}
              placeholder="08:00"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-gray-300 p-3 rounded-lg"
                onPress={() => setIsPrayerModalVisible(false)}
              >
                <Text className="text-center font-semibold">{t('deceased_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-green-500 p-3 rounded-lg" onPress={savePrayer}>
                <Text className="text-center font-semibold text-white">{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScheduleSettingsTab;
