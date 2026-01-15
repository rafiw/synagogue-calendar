import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/settingsContext';
import { DeceasedPerson, DeceasedSettings } from '../utils/defs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import MemorialCandle from './MemorialCandle';
import { isRTL2 } from 'utils/utils';
import { calculateDeceasedPages } from 'utils/deceasedHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Export function to calculate sub-pages for timing in index.tsx
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? JSON.parse(localSettingsString) : null;
  if (!localSettings?.deceasedSettings) return 0;

  const { filteredDeceased, totalPages } = calculateDeceasedPages(
    localSettings.deceased || [],
    localSettings.deceasedSettings.displayMode || 'all',
    localSettings.deceasedSettings.tableRows || 1,
    localSettings.deceasedSettings.tableColumns || 1,
  );

  return Math.max(0, totalPages);
}

// Types for dynamic sizing
interface FontSizes {
  name: number;
  nameCard: number;
  namePhoto: number;
  date: number;
  dateSmall: number;
  hebrew: number;
  tribute: number;
  footer: number;
  label: number;
}

interface CandleSizes {
  simple: number;
  card: number;
  photoPlaceholder: number;
  photoFooter: number;
}

interface DeceasedCellProps {
  person: DeceasedPerson;
  fontSize: FontSizes;
  candleSize: CandleSizes;
}

const DeceasedCell: React.FC<DeceasedCellProps> = ({ person, fontSize, candleSize }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const isRightToLeft = isRTL2(settings.language);

  // Gender-appropriate labels (default to male if not specified)
  const bornLabel = person.isMale !== false ? t('deceased_born_male') : t('deceased_born_female');
  const diedLabel = person.isMale !== false ? t('deceased_died_male') : t('deceased_died_female');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(settings.language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSimpleTemplate = (isRightToLeft: boolean) => (
    <View className="flex-1 rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg border border-amber-600/30">
      {/* Decorative top border */}
      <View className="h-1 bg-amber-600" />

      {/* Content */}
      <View className="flex-1 justify-center items-center p-3">
        <MemorialCandle size={candleSize.simple} />
        <Text className="text-amber-100 font-bold text-center tracking-wide mt-3" style={{ fontSize: fontSize.name }}>
          {person.name}
        </Text>
        <View className="w-10 h-0.5 bg-amber-600/50 my-2" />
        {(person.dateOfBirth || person.dateOfDeath) && (
          <Text className="text-slate-300 text-center" style={{ fontSize: fontSize.date }}>
            {person.dateOfBirth ? formatDate(person.dateOfBirth) : '-'} -{' '}
            {person.dateOfDeath ? formatDate(person.dateOfDeath) : '-'}
          </Text>
        )}
        {(person.hebrewDateOfBirth || person.hebrewDateOfDeath) && (
          <Text className="text-amber-200/80 text-center mt-1 font-medium" style={{ fontSize: fontSize.hebrew }}>
            {person.hebrewDateOfBirth || '-'} - {person.hebrewDateOfDeath || '-'}
          </Text>
        )}
        {person.tribute && (
          <Text className="text-slate-300 text-center mt-2 italic px-2" style={{ fontSize: fontSize.tribute }}>
            "{person.tribute}"
          </Text>
        )}
        <View className="w-6 h-0.5 bg-amber-600/30 my-2" />
        <Text className="text-amber-500 italic" style={{ fontSize: fontSize.footer }}>
          ת.נ.צ.ב.ה
        </Text>
      </View>
    </View>
  );

  const renderCardTemplate = (isRightToLeft: boolean) => (
    <View className="flex-1 flex-row rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border border-amber-600/30">
      {/* Candle section - left side */}
      <View className="w-1/4 justify-center items-center bg-slate-700/30 border-r border-amber-600/20">
        <MemorialCandle size={candleSize.card} />
      </View>

      {/* Content section - right side */}
      <View className="flex-1">
        {/* Header with name */}
        <View className="bg-slate-700/50 border-b border-amber-600/30 py-2 px-3">
          <Text className="text-amber-100 font-bold text-center tracking-wide" style={{ fontSize: fontSize.nameCard }}>
            {person.name}
          </Text>
        </View>

        {/* Dates content */}
        <View className="flex-1 justify-center items-center p-2">
          <View className="items-center">
            {(person.dateOfBirth || person.hebrewDateOfBirth) && (
              <View className={`flex-row ${isRightToLeft ? 'flex-row-reverse' : 'flex-row'} items-center`}>
                <Text
                  className={`text-amber-400 ${isRightToLeft ? 'mr-1' : 'ml-1'}`}
                  style={{ fontSize: fontSize.label }}
                >
                  {bornLabel}:
                </Text>
                <Text
                  className={`text-slate-300 ${isRightToLeft ? 'mr-1' : 'ml-1'}`}
                  style={{ fontSize: fontSize.dateSmall }}
                >
                  {person.dateOfBirth ? formatDate(person.dateOfBirth) : '-'}
                  {person.hebrewDateOfBirth && `, ${person.hebrewDateOfBirth}`}
                </Text>
              </View>
            )}
            {(person.dateOfDeath || person.hebrewDateOfDeath) && (
              <View className={`flex-row ${isRightToLeft ? 'flex-row-reverse' : 'flex-row'} items-center mt-1`}>
                <Text
                  className={`text-amber-400 ${isRightToLeft ? 'ml-1' : 'mr-1'}`}
                  style={{ fontSize: fontSize.label }}
                >
                  {diedLabel}:
                </Text>
                <Text
                  className={`text-slate-300 ${isRightToLeft ? 'ml-1' : 'mr-1'}`}
                  style={{ fontSize: fontSize.dateSmall }}
                >
                  {person.dateOfDeath ? formatDate(person.dateOfDeath) : '-'}
                  {person.hebrewDateOfDeath && `, ${person.hebrewDateOfDeath}`}
                </Text>
              </View>
            )}
          </View>
          {person.tribute && (
            <>
              <View className="w-6 h-0.5 bg-amber-600/20 my-1" />
              <Text className="text-slate-400 text-center italic px-2" style={{ fontSize: fontSize.tribute }}>
                "{person.tribute}"
              </Text>
            </>
          )}
        </View>

        {/* Footer */}
        <View className="bg-slate-700/30 border-t border-amber-600/20 py-1">
          <Text className="text-amber-500 text-center italic" style={{ fontSize: fontSize.footer }}>
            ת.נ.צ.ב.ה
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPhotoTemplate = (isRightToLeft: boolean) => (
    <View className="flex-1 flex-row rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border border-amber-600/30">
      {/* Photo section - left side */}
      <View className="w-2/5 p-2">
        <View className="flex-1 rounded-lg overflow-hidden border-2 border-amber-600/50 shadow-md">
          {person.photo ? (
            <Image source={{ uri: person.photo }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 bg-slate-700 justify-center items-center">
              <MemorialCandle size={candleSize.photoPlaceholder} />
            </View>
          )}
        </View>
      </View>

      {/* Memorial info section - right side */}
      <View className="flex-1 justify-center items-center p-3 border-l border-amber-600/20">
        <Text className="text-amber-100 font-bold text-center tracking-wide" style={{ fontSize: fontSize.namePhoto }}>
          {person.name}
        </Text>
        <View className="w-12 h-0.5 bg-amber-600/50 my-3" />
        <View className="items-center">
          {(person.dateOfBirth || person.dateOfDeath) && (
            <Text className="text-slate-300 text-center" style={{ fontSize: fontSize.date }}>
              {person.dateOfBirth || '-'} - {person.dateOfDeath || '-'}
            </Text>
          )}
          {(person.hebrewDateOfBirth || person.hebrewDateOfDeath) && (
            <Text className="text-amber-200/80 text-center mt-2 font-medium" style={{ fontSize: fontSize.hebrew }}>
              {person.hebrewDateOfBirth || '-'} - {person.hebrewDateOfDeath || '-'}
            </Text>
          )}
        </View>
        {person.tribute && (
          <>
            <View className="w-8 h-0.5 bg-amber-600/30 my-2" />
            <Text className="text-slate-300 text-center italic px-2" style={{ fontSize: fontSize.tribute }}>
              "{person.tribute}"
            </Text>
          </>
        )}
        <View className="w-8 h-0.5 bg-amber-600/30 my-2" />
        <View className="flex-row items-center">
          <MemorialCandle size={candleSize.photoFooter} />
          <Text className="text-amber-500 italic mx-2" style={{ fontSize: fontSize.footer }}>
            ת.נ.צ.ב.ה
          </Text>
          <MemorialCandle size={candleSize.photoFooter} />
        </View>
      </View>
    </View>
  );

  // Use person's template, or fall back to default template from settings
  const template = person.template || settings.deceasedSettings?.defaultTemplate || 'simple';

  switch (template) {
    case 'card':
      return renderCardTemplate(isRightToLeft);
    case 'photo':
      return renderPhotoTemplate(isRightToLeft);
    default:
      return renderSimpleTemplate(isRightToLeft);
  }
};

// Helper function to calculate sizes based on grid
const calculateSizes = (gridRows: number, gridCols: number) => {
  const totalCells = gridRows * gridCols;
  const scaleFactor =
    totalCells === 1
      ? 2.5
      : totalCells <= 2
        ? 2
        : totalCells <= 4
          ? 1.8
          : totalCells <= 6
            ? 1.6
            : totalCells <= 8
              ? 1.5
              : totalCells <= 10
                ? 1.4
                : totalCells <= 12
                  ? 1.3
                  : totalCells <= 14
                    ? 1.2
                    : totalCells <= 16
                      ? 1.1
                      : totalCells <= 18
                        ? 1.0
                        : totalCells <= 20
                          ? 0.9
                          : 0.8;

  const fontSize: FontSizes = {
    name: 18 * scaleFactor,
    nameCard: 16 * scaleFactor,
    namePhoto: 20 * scaleFactor,
    date: 12 * scaleFactor,
    dateSmall: 11 * scaleFactor,
    hebrew: 12 * scaleFactor,
    tribute: 11 * scaleFactor,
    footer: 12 * scaleFactor,
    label: 11 * scaleFactor,
  };

  const candleSize: CandleSizes = {
    simple: Math.round(40 * scaleFactor),
    card: Math.round(35 * scaleFactor),
    photoPlaceholder: Math.round(60 * scaleFactor),
    photoFooter: Math.round(30 * scaleFactor),
  };

  return { fontSize, candleSize };
};

const Deceased: React.FC = () => {
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();

  // Calculate sizes once based on grid configuration
  const tableRowsCount = settings.deceasedSettings?.tableRows || 1;
  const tableColumnsCount = settings.deceasedSettings?.tableColumns || 1;
  const { fontSize, candleSize } = useMemo(
    () => calculateSizes(tableRowsCount, tableColumnsCount),
    [tableRowsCount, tableColumnsCount],
  );

  // Filter deceased based on display mode (using Hebrew calendar)
  const { filteredDeceased, totalPages } = useMemo(() => {
    if (!settings.deceased || !settings.deceasedSettings) {
      return { filteredDeceased: [], totalPages: 0 };
    }

    return calculateDeceasedPages(
      settings.deceased,
      settings.deceasedSettings.displayMode,
      settings.deceasedSettings.tableRows,
      settings.deceasedSettings.tableColumns,
    );
  }, [settings.deceased, settings.deceasedSettings]);

  const cellsPerPage = tableRowsCount * tableColumnsCount;

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000); // Change page every 5 seconds

    return () => clearInterval(interval);
  }, [totalPages]);

  if (settings.deceased.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white/90 rounded-xl m-2.5">
        <Text className="text-lg text-gray-500 text-center">
          {settings.deceasedSettings.displayMode === 'monthly'
            ? 'No deceased people this month'
            : t('deceased_no_people')}
        </Text>
        <TouchableOpacity
          className="mt-5 bg-blue-500 py-3 px-6 rounded-lg"
          onPress={() => router.push('/settings/deceased')}
        >
          <Text className="text-white text-base font-bold">{t('deceased_add_person')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startIndex = currentPage * cellsPerPage;
  const endIndex = startIndex + cellsPerPage;
  const currentDeceased = filteredDeceased.slice(startIndex, endIndex);

  // Create table structure
  const tableRows = [];

  for (let row = 0; row < tableRowsCount; row++) {
    const rowCells = [];
    for (let col = 0; col < tableColumnsCount; col++) {
      const index = row * tableColumnsCount + col;
      const person = currentDeceased[index];

      rowCells.push(
        <View key={`${row}-${col}`} className="flex-1 m-0.5">
          {person ? (
            <DeceasedCell person={person} fontSize={fontSize} candleSize={candleSize} />
          ) : (
            <View className="flex-1 bg-white/10 rounded-lg" />
          )}
        </View>,
      );
    }
    tableRows.push(
      <View key={row} className="flex-1 flex-row">
        {rowCells}
      </View>,
    );
  }

  return (
    <View className="flex-1 p-2.5 bg-transparent">
      <View className="flex-1">{tableRows}</View>
      {totalPages > 1 && (
        <View className="items-center py-2.5">
          <Text className="text-base text-gray-700 font-bold">
            {currentPage + 1} / {totalPages}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Deceased;
