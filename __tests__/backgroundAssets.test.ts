import { describe, it, expect } from 'vitest';
import { BACKGROUND_PRESETS, BACKGROUND_PRESET_IDS, getBackgroundPreset } from '../utils/backgroundAssets';
import { mergeSettings } from '../utils/settingsMerge';

describe('backgroundAssets', () => {
  it('should define 7 wooden frame presets', () => {
    expect(BACKGROUND_PRESETS).toHaveLength(7);
    expect(BACKGROUND_PRESET_IDS).toEqual([
      'classic_oak',
      'dark_walnut',
      'rustic_pine',
      'mahogany_gold',
      'carved_chestnut',
      'carved_dark_oak',
      'carved_honey',
    ]);
    for (const preset of BACKGROUND_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.labelKey).toMatch(/^background_preset_/);
      expect(preset.source).toBeTruthy();
      expect(preset.resizeMode).toBe('stretch');
    }
  });

  it('should return matching preset by id and undefined otherwise', () => {
    expect(getBackgroundPreset('classic_oak')?.id).toBe('classic_oak');
    expect(getBackgroundPreset('dark_walnut')?.id).toBe('dark_walnut');
    expect(getBackgroundPreset('rustic_pine')?.id).toBe('rustic_pine');
    expect(getBackgroundPreset('mahogany_gold')?.id).toBe('mahogany_gold');
    expect(getBackgroundPreset('carved_chestnut')?.id).toBe('carved_chestnut');
    expect(getBackgroundPreset('carved_dark_oak')?.id).toBe('carved_dark_oak');
    expect(getBackgroundPreset('carved_honey')?.id).toBe('carved_honey');
    expect(getBackgroundPreset(undefined)).toBeUndefined();
    expect(getBackgroundPreset('')).toBeUndefined();
    expect(getBackgroundPreset('nonexistent_frame')).toBeUndefined();
  });

  it('should preserve valid presetId and customImageUri in mergeSettings while remaining backward compatible', () => {
    const withPreset = mergeSettings({
      synagogueSettings: {
        backgroundSettings: {
          mode: 'image',
          presetId: 'mahogany_gold',
        },
      },
    });
    expect(withPreset.synagogueSettings.backgroundSettings.mode).toBe('image');
    expect(withPreset.synagogueSettings.backgroundSettings.presetId).toBe('mahogany_gold');

    const withInvalidPreset = mergeSettings({
      synagogueSettings: {
        backgroundSettings: {
          mode: 'image',
          presetId: 'unknown_preset',
          customImageUri: 'file:///custom.jpg',
        },
      },
    });
    expect(withInvalidPreset.synagogueSettings.backgroundSettings.presetId).toBeUndefined();
    expect(withInvalidPreset.synagogueSettings.backgroundSettings.customImageUri).toBe('file:///custom.jpg');

    const legacy = mergeSettings({
      synagogueSettings: {
        backgroundSettings: {
          mode: 'image',
          imageUrl: 'https://example.com/bg.jpg',
        },
      },
    });
    expect(legacy.synagogueSettings.backgroundSettings.mode).toBe('image');
    expect(legacy.synagogueSettings.backgroundSettings.imageUrl).toBe('https://example.com/bg.jpg');
    expect(legacy.synagogueSettings.backgroundSettings.presetId).toBeUndefined();
  });
});
