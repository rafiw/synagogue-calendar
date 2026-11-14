import { ImageSourcePropType } from 'react-native';
import { BACKGROUND_PRESET_IDS, BackgroundPresetId } from './defs';
import classicOakFrame from '../assets/backgrounds/frame_classic_oak.jpg';
import darkWalnutFrame from '../assets/backgrounds/frame_dark_walnut.jpg';
import rusticPineFrame from '../assets/backgrounds/frame_rustic_pine.jpg';
import mahoganyGoldFrame from '../assets/backgrounds/frame_mahogany_gold.jpg';
import carvedChestnutFrame from '../assets/backgrounds/frame_carved_chestnut.jpg';
import carvedDarkOakFrame from '../assets/backgrounds/frame_carved_dark_oak.jpg';
import carvedHoneyFrame from '../assets/backgrounds/frame_carved_honey.jpg';

export interface BackgroundPreset {
  id: BackgroundPresetId;
  labelKey: string;
  source: ImageSourcePropType;
  resizeMode: 'cover' | 'stretch';
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'classic_oak',
    labelKey: 'background_preset_classic_oak',
    source: classicOakFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'dark_walnut',
    labelKey: 'background_preset_dark_walnut',
    source: darkWalnutFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'rustic_pine',
    labelKey: 'background_preset_rustic_pine',
    source: rusticPineFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'mahogany_gold',
    labelKey: 'background_preset_mahogany_gold',
    source: mahoganyGoldFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'carved_chestnut',
    labelKey: 'background_preset_carved_chestnut',
    source: carvedChestnutFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'carved_dark_oak',
    labelKey: 'background_preset_carved_dark_oak',
    source: carvedDarkOakFrame,
    resizeMode: 'stretch',
  },
  {
    id: 'carved_honey',
    labelKey: 'background_preset_carved_honey',
    source: carvedHoneyFrame,
    resizeMode: 'stretch',
  },
];

export { BACKGROUND_PRESET_IDS };

export function getBackgroundPreset(presetId?: string): BackgroundPreset | undefined {
  if (!presetId) return undefined;
  return BACKGROUND_PRESETS.find((preset) => preset.id === presetId);
}
