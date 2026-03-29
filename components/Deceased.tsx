import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/settingsContext';
import { DeceasedPerson, Settings } from '../utils/defs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import MemorialCandle from './MemorialCandle';
import { isRTL2 } from 'utils/utils';
import { calculateDeceasedPages } from 'utils/deceasedHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsiveFontSize, useResponsiveSpacing, useHeightScale, useFontScale } from 'utils/responsive';

// Export function to calculate sub-pages for timing in index.tsx
export async function getSubPages(): Promise<number> {
  const localSettingsString = await AsyncStorage.getItem('settings');
  const localSettings = localSettingsString ? (JSON.parse(localSettingsString) as Settings) : null;
  if (!localSettings?.deceasedSettings?.deceased) return 0;

  return Math.max(0, calculateDeceasedPages(localSettings.deceasedSettings).totalPages);
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
  const isRightToLeft = isRTL2(settings.synagogueSettings.language);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(settings.synagogueSettings.language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSimpleTemplate = (isRightToLeft: boolean) => (
    <View className="flex-1 rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg border border-amber-600/30">
      <View className="flex-1 flex-row">
        <View className="justify-center items-center px-2">
          <MemorialCandle size={candleSize.simple} />
        </View>
        <View className="flex-1 justify-center items-center p-3">
          <Text className="text-amber-100 font-bold text-center tracking-wide" style={{ fontSize: fontSize.name }}>
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
                  className={`text-slate-300 ${isRightToLeft ? 'm-1' : 'ml-1'}`}
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
    <View className="flex-1 rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border border-amber-600/30">
      <View className="flex-1 flex-row">
        {/* Photo section */}
        <View className="w-1/3 p-2">
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

        {/* Memorial info + candle section */}
        <View className="flex-1 p-2">
          <View className="flex-1 justify-center items-center">
            <Text
              className="text-amber-100 font-bold text-center tracking-wide"
              style={{ fontSize: fontSize.namePhoto }}
            >
              {person.name}
            </Text>
            <View className="w-12 h-0.5 bg-amber-600/50 my-2" />
            <View className="items-center">
              {(person.dateOfBirth || person.dateOfDeath) && (
                <Text className="text-slate-300 text-center" style={{ fontSize: fontSize.date }}>
                  {person.dateOfBirth || '-'} - {person.dateOfDeath || '-'}
                </Text>
              )}
              {(person.hebrewDateOfBirth || person.hebrewDateOfDeath) && (
                <Text className="text-amber-200/80 text-center mt-1 font-medium" style={{ fontSize: fontSize.hebrew }}>
                  {person.hebrewDateOfBirth || '-'} - {person.hebrewDateOfDeath || '-'}
                </Text>
              )}
            </View>
            {person.tribute && (
              <>
                <View className="w-8 h-0.5 bg-amber-600/30 my-1" />
                <Text className="text-slate-300 text-center italic px-2" style={{ fontSize: fontSize.tribute }}>
                  "{person.tribute}"
                </Text>
              </>
            )}
          </View>
          {/* Footer */}
          <View className="flex-row items-center">
            <View style={{ width: candleSize.photoFooter }} />
            <View className="flex-1 items-center">
              <Text className="text-amber-500 italic" style={{ fontSize: fontSize.footer }}>
                ת.נ.צ.ב.ה
              </Text>
            </View>
            <MemorialCandle size={candleSize.photoFooter} />
          </View>
        </View>
      </View>
    </View>
  );

  // Use person's template, or fall back to default template from settings
  const template = person.template || settings.deceasedSettings?.displaySettings?.defaultTemplate || 'simple';

  switch (template) {
    case 'card':
      return renderCardTemplate(isRightToLeft);
    case 'photo':
      return renderPhotoTemplate(isRightToLeft);
    default:
      return renderSimpleTemplate(isRightToLeft);
  }
};

const getGridScaleFactor = (totalCells: number): number => {
  console.log('totalCells', totalCells);
  if (totalCells === 1) return 2.5;
  if (totalCells <= 2) return 2;
  if (totalCells <= 4) return 1.8;
  if (totalCells <= 6) return 1.6;
  if (totalCells <= 8) return 1.5;
  if (totalCells <= 10) return 1.4;
  if (totalCells <= 12) return 1.3;
  if (totalCells <= 14) return 1.2;
  if (totalCells <= 16) return 1.1;
  if (totalCells <= 18) return 1.0;
  if (totalCells <= 20) return 0.9;
  return 0.8;
};

const Deceased: React.FC = () => {
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();

  const heightScale = useHeightScale();
  const fontScale = useFontScale();

  // Responsive font sizes (device-aware)
  const responsiveName = useResponsiveFontSize('headingSmall');
  const responsiveNameCard = useResponsiveFontSize('bodyLarge');
  const responsiveNamePhoto = useResponsiveFontSize('headingMedium');
  const responsiveDate = useResponsiveFontSize('bodySmall');
  const responsiveSmallText = useResponsiveFontSize('labelMedium');
  const responsiveContainerPadding = useResponsiveSpacing(10);
  const responsiveEmptyPadding = useResponsiveSpacing(12);

  const tableRowsCount = settings.deceasedSettings?.displaySettings?.tableRows || 1;
  const tableColumnsCount = settings.deceasedSettings?.displaySettings?.tableColumns || 1;

  const { fontSize, candleSize } = useMemo(() => {
    const gridScale = getGridScaleFactor(tableRowsCount * tableColumnsCount);
    const tableScale = gridScale * heightScale;

    const fontSize: FontSizes = {
      name: Math.round(responsiveName * tableScale),
      nameCard: Math.round(responsiveNameCard * tableScale),
      namePhoto: Math.round(responsiveNamePhoto * tableScale),
      date: Math.round(responsiveDate * tableScale),
      dateSmall: Math.round(responsiveSmallText * tableScale),
      hebrew: Math.round(responsiveDate * tableScale),
      tribute: Math.round(responsiveSmallText * tableScale),
      footer: Math.round(responsiveDate * tableScale),
      label: Math.round(responsiveSmallText * tableScale),
    };

    const candleScale = gridScale * fontScale * heightScale;
    const candleSize: CandleSizes = {
      simple: Math.round(40 * candleScale),
      card: Math.round(35 * candleScale),
      photoPlaceholder: Math.round(60 * candleScale),
      photoFooter: Math.round(30 * candleScale),
    };

    return { fontSize, candleSize };
  }, [
    tableRowsCount,
    tableColumnsCount,
    heightScale,
    fontScale,
    responsiveName,
    responsiveNameCard,
    responsiveNamePhoto,
    responsiveDate,
    responsiveSmallText,
  ]);

  // Filter deceased based on display mode (using Hebrew calendar)
  const { filteredDeceased, totalPages } = useMemo(() => {
    if (!settings.deceasedSettings?.deceased) {
      return { filteredDeceased: [], totalPages: 0 };
    }

    return calculateDeceasedPages(settings.deceasedSettings);
  }, [settings.deceasedSettings]);

  const cellsPerPage = tableRowsCount * tableColumnsCount;

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000); // Change page every 5 seconds

    return () => clearInterval(interval);
  }, [totalPages]);

  if (settings.deceasedSettings.deceased.length === 0) {
    const emptyTextSize = Math.round(responsiveName * heightScale);
    const emptyButtonSize = Math.round(responsiveNameCard * heightScale);
    const emptyPadding = Math.round(responsiveEmptyPadding * heightScale);

    return (
      <View className="flex-1 justify-center items-center bg-white/90 rounded-xl" style={{ margin: emptyPadding }}>
        <Text className="text-gray-500 text-center" style={{ fontSize: emptyTextSize, padding: emptyPadding }}>
          {settings.deceasedSettings.displaySettings.displayMode === 'monthly'
            ? 'No deceased people this month'
            : t('deceased_no_people')}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg"
          style={{ marginTop: emptyPadding * 2, paddingVertical: emptyPadding, paddingHorizontal: emptyPadding * 2 }}
          onPress={() => router.push('/settings/deceased')}
        >
          <Text className="text-white font-bold" style={{ fontSize: emptyButtonSize }}>
            {t('deceased_add_person')}
          </Text>
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

  const paginationSize = Math.round(responsiveNameCard * heightScale);
  const containerPadding = Math.round(responsiveContainerPadding * heightScale);

  return (
    <View className="flex-1 bg-transparent" style={{ padding: containerPadding }}>
      <View className="flex-1">{tableRows}</View>
      {totalPages > 1 && (
        <View className="items-center" style={{ paddingVertical: containerPadding }}>
          <Text className="text-gray-700 font-bold" style={{ fontSize: paginationSize }}>
            {currentPage + 1} / {totalPages}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Deceased;
