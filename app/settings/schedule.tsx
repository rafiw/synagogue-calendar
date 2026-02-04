import { Feather, Ionicons } from '@expo/vector-icons';
import { useSettings } from 'context/settingsContext';
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useEffect, useState } from 'react';
import { ScheduleColumn, Prayer, PrayerTimeType } from 'utils/defs';
import { showConfirm, showAlert } from 'utils/alert';
import { isRTL } from 'utils/utils';
import { NumberInput } from '../../components/NumberInput';
import { useResponsiveFontSize, useResponsiveIconSize, useResponsiveSpacing, useHeightScale } from 'utils/responsive';
import { getPrayerDisplayTime } from 'utils/scheduleHelpers';

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
  const [prayerTimeType, setPrayerTimeType] = useState<PrayerTimeType>('time');
  const [prayerOffsetMinutes, setPrayerOffsetMinutes] = useState<string>('0');
  const [isOffsetValid, setIsOffsetValid] = useState(true);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [rtl, setRtl] = useState(false);
  const heightScale = useHeightScale() * 0.6;

  // Responsive sizes with height adjustment
  const titleSize = Math.round(useResponsiveFontSize('headingMedium') * heightScale);
  const labelSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const textSize = Math.round(useResponsiveFontSize('bodyMedium') * heightScale);
  const buttonTextSize = Math.round(useResponsiveFontSize('bodyLarge') * heightScale);
  const checkboxSize = Math.round(25 * heightScale);
  const iconSize = Math.round(useResponsiveIconSize('medium') * heightScale);
  const smallIconSize = Math.round(useResponsiveIconSize('small') * heightScale);
  const padding = Math.round(useResponsiveSpacing(16) * heightScale);
  const smallPadding = Math.round(useResponsiveSpacing(8) * heightScale);
  const margin = Math.round(useResponsiveSpacing(16) * heightScale);

  useEffect(() => {
    const checkRTL = async () => {
      const isRightToLeft = await isRTL();
      setRtl(isRightToLeft);
    };

    checkRTL();
  }, []);

  const saveChecked = (value: boolean) => {
    updateSettings({ scheduleSettings: { ...settings.scheduleSettings, enable: value } });
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
      columns.unshift(newColumn);
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
    setPrayerTimeType('time');
    setPrayerOffsetMinutes('0');
    setIsOffsetValid(true);
    setIsPrayerModalVisible(true);
  };

  const openEditPrayerModal = (columnId: string, prayer: Prayer) => {
    setActiveColumnId(columnId);
    setEditingPrayer(prayer);
    setPrayerName(prayer.name);
    setPrayerTime(prayer.time || '');
    setPrayerTimeType(prayer.timeType || 'time');
    const offsetStr = prayer.offsetMinutes?.toString() || '0';
    setPrayerOffsetMinutes(offsetStr);
    setIsOffsetValid(true);
    setIsPrayerModalVisible(true);
  };

  const savePrayer = () => {
    if (!prayerName.trim()) {
      showAlert(t('error'), t('please_fill_in_all_required_fields'));
      return;
    }

    // Validate based on time type
    if (prayerTimeType === 'time') {
      if (!prayerTime.trim()) {
        showAlert(t('error'), t('please_fill_in_all_required_fields'));
        return;
      }
    } else {
      // Check if offset is valid
      if (!isOffsetValid || prayerOffsetMinutes === '' || prayerOffsetMinutes === '-') {
        showAlert(t('error'), t('schedule_invalid_offset'));
        return;
      }
      const offsetValue = parseInt(prayerOffsetMinutes, 10);
      if (isNaN(offsetValue)) {
        showAlert(t('error'), t('schedule_invalid_offset'));
        return;
      }
    }

    if (!activeColumnId || !settings.scheduleSettings) return;

    const columns = [...settings.scheduleSettings.columns];
    const columnIndex = columns.findIndex((c) => c.id === activeColumnId);

    if (columnIndex === -1) return;

    const column = columns[columnIndex];
    if (!column) return;

    const prayers = [...column.prayers];

    const prayerData: Prayer = {
      id: editingPrayer?.id || Date.now().toString(),
      name: prayerName,
      time: prayerTimeType === 'time' ? prayerTime : '',
      timeType: prayerTimeType,
      offsetMinutes: prayerTimeType !== 'time' ? parseInt(prayerOffsetMinutes, 10) : undefined,
    };

    if (editingPrayer) {
      // Edit existing prayer
      const prayerIndex = prayers.findIndex((p) => p.id === editingPrayer.id);
      if (prayerIndex !== -1) {
        prayers[prayerIndex] = prayerData;
      }
    } else {
      // Add new prayer
      prayers.push(prayerData);
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
    setPrayerTimeType('time');
    setPrayerOffsetMinutes('0');
    setIsOffsetValid(true);
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
    <View className="flex-1" style={{ marginTop: margin }}>
      <View className="flex-row items-center justify-center" style={{ gap: padding }}>
        <BouncyCheckbox
          size={checkboxSize}
          isChecked={settings.scheduleSettings.enable}
          fillColor="green"
          iconStyle={{ borderColor: 'green' }}
          innerIconStyle={{ borderWidth: 2 }}
          text={t('enable_schedule')}
          textComponent={<Text style={{ fontSize: textSize }}>{t('enable_schedule')}</Text>}
          onPress={(value) => void saveChecked(value)}
        />
      </View>
      {settings.scheduleSettings.enable && (
        <View style={{ paddingHorizontal: padding, marginTop: margin, marginBottom: margin }}>
          <NumberInput
            value={settings.scheduleSettings.screenDisplayTime || 10}
            onChange={(newTime) => {
              updateSettings({
                scheduleSettings: {
                  ...settings.scheduleSettings,
                  screenDisplayTime: newTime,
                },
              });
            }}
            min={1}
            max={60}
            label={t('screen_display_time_description')}
            labelSize={labelSize}
            textSize={textSize}
            padding={padding}
            smallPadding={smallPadding}
            heightScale={heightScale}
          />
        </View>
      )}

      {settings.scheduleSettings.enable && (
        <ScrollView className="flex-1" style={{ paddingHorizontal: padding, marginTop: margin }}>
          {/* Add Column Button */}
          <TouchableOpacity
            className="bg-blue-500 rounded-lg flex-row items-center justify-center"
            style={{ padding: smallPadding * 1.5, marginBottom: margin }}
            onPress={openAddColumnModal}
          >
            <Ionicons name="add" size={iconSize} color="white" />
            <Text className="text-white font-bold" style={{ fontSize: buttonTextSize, marginLeft: smallPadding }}>
              {t('schedule_add_column')}
            </Text>
          </TouchableOpacity>

          {/* Columns List */}
          {columns.map((column) => (
            <View
              key={column.id}
              className="bg-gray-100 rounded-lg border border-gray-400"
              style={{ padding, marginBottom: margin }}
            >
              {/* Column Header */}
              <View className="flex-row justify-between items-center" style={{ marginBottom: smallPadding * 1.5 }}>
                <Text className="font-bold flex-1" style={{ fontSize: titleSize }}>
                  {column.title}
                </Text>
                <View className="flex-row" style={{ gap: smallPadding }}>
                  <TouchableOpacity onPress={() => openEditColumnModal(column)}>
                    <Feather name="edit" size={smallIconSize} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteColumn(column.id)}>
                    <Feather name="trash-2" size={smallIconSize} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Add Prayer Button */}
              <TouchableOpacity
                className="bg-green-500 rounded-lg flex-row items-center justify-center"
                style={{ padding: smallPadding, marginBottom: smallPadding * 1.5 }}
                onPress={() => openAddPrayerModal(column.id)}
              >
                <Ionicons name="add" size={smallIconSize} color="white" />
                <Text
                  className="text-white font-semibold"
                  style={{ fontSize: labelSize, marginLeft: smallPadding / 2 }}
                >
                  {t('schedule_add_prayer')}
                </Text>
              </TouchableOpacity>

              {/* Prayers List */}
              {column.prayers.length === 0 ? (
                <Text
                  className="text-gray-500 text-center"
                  style={{ fontSize: labelSize, paddingVertical: smallPadding }}
                >
                  {t('schedule_no_prayers')}
                </Text>
              ) : (
                column.prayers.map((prayer) => (
                  <View
                    key={prayer.id}
                    className={`${rtl ? 'space-x-reverse' : ''} bg-white rounded-lg flex-row items-center border border-gray-400`}
                    style={{ padding: smallPadding * 1.5, marginBottom: smallPadding }}
                  >
                    <View className="flex-row flex-1 items-center justify-between" style={{ paddingRight: padding }}>
                      <Text className="font-semibold" style={{ fontSize: textSize }}>
                        {prayer.name}
                      </Text>
                      <Text className="text-gray-700 font-bold" style={{ fontSize: textSize }}>
                        {getPrayerDisplayTime(prayer, settings)}
                      </Text>
                    </View>
                    <View className="flex-row items-center" style={{ gap: smallPadding * 1.5 }}>
                      <TouchableOpacity onPress={() => openEditPrayerModal(column.id, prayer)}>
                        <Feather name="edit" size={smallIconSize} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletePrayer(column.id, prayer.id)}>
                        <Feather name="trash-2" size={smallIconSize} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ))}

          {columns.length === 0 && (
            <Text className="text-gray-500 text-center" style={{ fontSize: labelSize, paddingVertical: padding }}>
              {t('schedule_no_prayers')}
            </Text>
          )}
        </ScrollView>
      )}

      {/* Column Modal */}
      <Modal
        visible={isColumnModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsColumnModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-4/5 max-w-md" style={{ padding: padding * 1.5 }}>
            <Text className="font-bold" style={{ fontSize: titleSize, marginBottom: margin }}>
              {editingColumn ? t('schedule_edit_column') : t('schedule_add_column')}
            </Text>

            <Text style={{ fontSize: labelSize, marginBottom: smallPadding }}>{t('schedule_column_title')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg"
              style={{ padding: smallPadding, fontSize: textSize, marginBottom: margin }}
              value={columnTitle}
              onChangeText={setColumnTitle}
              placeholder={t('schedule_column_title')}
            />

            <View className="flex-row" style={{ gap: smallPadding }}>
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg"
                style={{ padding: smallPadding * 1.5 }}
                onPress={() => setIsColumnModalVisible(false)}
              >
                <Text className="text-center font-semibold" style={{ fontSize: buttonTextSize }}>
                  {t('deceased_cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-lg"
                style={{ padding: smallPadding * 1.5 }}
                onPress={saveColumn}
              >
                <Text className="text-center font-semibold text-white" style={{ fontSize: buttonTextSize }}>
                  {t('save')}
                </Text>
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
          <View className="bg-white rounded-lg w-4/5 max-w-md" style={{ padding: padding * 1.5 }}>
            <Text className="font-bold" style={{ fontSize: titleSize, marginBottom: margin }}>
              {editingPrayer ? t('schedule_edit_prayer') : t('schedule_add_prayer')}
            </Text>

            <Text style={{ fontSize: labelSize, marginBottom: smallPadding }}>{t('schedule_prayer_name')}</Text>
            <TextInput
              className="border border-gray-300 rounded-lg"
              style={{ padding: smallPadding, fontSize: textSize, marginBottom: margin }}
              value={prayerName}
              onChangeText={setPrayerName}
              placeholder={t('schedule_prayer_name')}
            />

            <Text style={{ fontSize: labelSize, marginBottom: smallPadding }}>{t('schedule_prayer_time')}</Text>

            {/* Time Type Selector */}
            <View className="flex-row" style={{ gap: smallPadding, marginBottom: margin }}>
              <TouchableOpacity
                className={`flex-1 rounded-lg ${prayerTimeType === 'time' ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ padding: smallPadding }}
                onPress={() => {
                  setPrayerTimeType('time');
                  setIsOffsetValid(true);
                }}
              >
                <Text
                  className={`text-center font-semibold ${prayerTimeType === 'time' ? 'text-white' : 'text-gray-700'}`}
                  style={{ fontSize: labelSize }}
                >
                  {t('schedule_time_type_time')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg ${prayerTimeType === 'sunrise_offset' ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ padding: smallPadding }}
                onPress={() => {
                  setPrayerTimeType('sunrise_offset');
                  setIsOffsetValid(true);
                }}
              >
                <Text
                  className={`text-center font-semibold ${prayerTimeType === 'sunrise_offset' ? 'text-white' : 'text-gray-700'}`}
                  style={{ fontSize: labelSize }}
                >
                  {t('schedule_time_type_sunrise')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg ${prayerTimeType === 'sunset_offset' ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ padding: smallPadding }}
                onPress={() => {
                  setPrayerTimeType('sunset_offset');
                  setIsOffsetValid(true);
                }}
              >
                <Text
                  className={`text-center font-semibold ${prayerTimeType === 'sunset_offset' ? 'text-white' : 'text-gray-700'}`}
                  style={{ fontSize: labelSize }}
                >
                  {t('schedule_time_type_sunset')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* input Time Type */}
            <View style={{ marginBottom: margin }}>
              <Text style={{ fontSize: labelSize, marginBottom: smallPadding }}>
                {prayerTimeType === 'time' ? t('schedule_prayer_time') : t('schedule_offset_minutes')}
              </Text>
              <TextInput
                className="border rounded-lg"
                style={{
                  padding: smallPadding,
                  fontSize: textSize,
                  borderColor: prayerTimeType === 'time' ? '#d1d5db' : isOffsetValid ? '#d1d5db' : '#ef4444',
                  borderWidth: 2,
                }}
                value={prayerTimeType === 'time' ? prayerTime : prayerOffsetMinutes}
                onChangeText={(text) => {
                  if (prayerTimeType === 'time') {
                    setPrayerTime(text);
                  } else {
                    setPrayerOffsetMinutes(text);
                    // Validate: allow empty string, negative sign, and numbers
                    const isValid = /^-?\d+$/.test(text) || text === '' || text === '-';
                    setIsOffsetValid(isValid);
                  }
                }}
                placeholder={prayerTimeType === 'time' ? '08:00' : '0'}
                keyboardType={prayerTimeType === 'time' ? 'default' : 'numeric'}
              />
              {prayerTimeType !== 'time' && !isOffsetValid && (
                <Text style={{ fontSize: textSize * 0.8, color: '#ef4444', marginTop: smallPadding / 2 }}>
                  {t('schedule_invalid_offset')}
                </Text>
              )}
              {prayerTimeType !== 'time' && isOffsetValid && (
                <Text style={{ fontSize: textSize * 0.8, color: '#666', marginTop: smallPadding / 2 }}>
                  {prayerTimeType === 'sunrise_offset'
                    ? t('schedule_offset_sunrise_hint')
                    : t('schedule_offset_sunset_hint')}
                </Text>
              )}
            </View>

            <View className="flex-row" style={{ gap: smallPadding }}>
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg"
                style={{ padding: smallPadding * 1.5 }}
                onPress={() => setIsPrayerModalVisible(false)}
              >
                <Text className="text-center font-semibold" style={{ fontSize: buttonTextSize }}>
                  {t('deceased_cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-lg"
                style={{ padding: smallPadding * 1.5 }}
                onPress={savePrayer}
              >
                <Text className="text-center font-semibold text-white" style={{ fontSize: buttonTextSize }}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScheduleSettingsTab;
