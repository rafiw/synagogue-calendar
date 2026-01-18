import { Platform, useWindowDimensions } from 'react-native';

/**
 * Device type detection and responsive sizing utilities
 * Provides font scaling and sizing for mobile phones, desktop, and Android TV
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';

/**
 * Detects the device type based on screen width and platform
 */
export const useDeviceType = (): DeviceType => {
  const { width } = useWindowDimensions();

  // Only actual Android TV platform should be treated as TV (10-foot UI)
  if (Platform.isTV) {
    return 'tv';
  }

  // Desktop/PC monitors (web browser, Electron, etc.) - viewed from 1.5-3 feet
  // These are large screens but NOT TVs
  if (width > 1280) {
    return 'desktop';
  }

  // Tablet range
  if (width >= 768 && width <= 1280) {
    return 'tablet';
  }

  // Default to mobile
  return 'mobile';
};

/**
 * Font size scales for different device types
 * TV needs 2.5-3x larger fonts due to viewing distance (10-foot UI)
 * Desktop uses modest scaling for PC monitors at normal viewing distance (2-3 feet)
 */
const FONT_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0, // Phone at 6-12 inches
  tablet: 1.5, // Tablet at 12-18 inches
  desktop: 1.2, // PC monitor at 2-3 feet (21-27 inch monitors)
  tv: 2.8, // 55" TV at 8-10 feet viewing distance
};

/**
 * Icon size scales for different device types
 */
const ICON_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0, // Touch targets for fingers
  tablet: 1.4, // Larger touch targets
  desktop: 1.3, // Mouse cursor precision - moderate scaling
  tv: 3.0, // Remote control - needs very large targets
};

/**
 * Spacing scale for different device types
 */
const SPACING_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0,
  tablet: 1.3,
  desktop: 1.2, // Slightly more generous spacing on desktop
  tv: 2.2, // Much more spacing for TV
};

/**
 * Returns the font scale multiplier for the current device
 */
export const useFontScale = (): number => {
  const deviceType = useDeviceType();
  return FONT_SCALE_MULTIPLIERS[deviceType];
};

/**
 * Returns the icon scale multiplier for the current device
 */
export const useIconScale = (): number => {
  const deviceType = useDeviceType();
  return ICON_SCALE_MULTIPLIERS[deviceType];
};

/**
 * Returns the spacing scale multiplier for the current device
 */
export const useSpacingScale = (): number => {
  const deviceType = useDeviceType();
  return SPACING_SCALE_MULTIPLIERS[deviceType];
};

/**
 * Responsive font sizes based on semantic meaning
 * These base sizes will be multiplied by the device scale
 */
export const FONT_SIZES = {
  // Display sizes (for hero text, titles)
  displayLarge: 48, // Main titles
  displayMedium: 36, // Section titles
  displaySmall: 30, // Subsection titles

  // Heading sizes
  headingLarge: 24, // Major headings
  headingMedium: 20, // Standard headings
  headingSmall: 18, // Minor headings

  // Body sizes
  bodyLarge: 16, // Large body text
  bodyMedium: 14, // Standard body text
  bodySmall: 12, // Small body text

  // Label sizes
  labelLarge: 14, // Large labels
  labelMedium: 12, // Standard labels
  labelSmall: 10, // Small labels
};

/**
 * Icon sizes for different contexts
 */
export const ICON_SIZES = {
  tiny: 16,
  small: 20,
  medium: 24,
  large: 32,
  xlarge: 48,
  xxlarge: 64,
};

/**
 * Hook to get responsive font size
 * @param baseSizeKey - Key from FONT_SIZES
 * @returns Scaled font size for current device
 */
export const useResponsiveFontSize = (baseSizeKey: keyof typeof FONT_SIZES): number => {
  const scale = useFontScale();
  return Math.round(FONT_SIZES[baseSizeKey] * scale);
};

/**
 * Hook to get responsive icon size
 * @param baseSizeKey - Key from ICON_SIZES
 * @returns Scaled icon size for current device
 */
export const useResponsiveIconSize = (baseSizeKey: keyof typeof ICON_SIZES): number => {
  const scale = useIconScale();
  return Math.round(ICON_SIZES[baseSizeKey] * scale);
};

/**
 * Hook to get responsive spacing
 * @param baseSpacing - Base spacing value in pixels
 * @returns Scaled spacing for current device
 */
export const useResponsiveSpacing = (baseSpacing: number): number => {
  const scale = useSpacingScale();
  return Math.round(baseSpacing * scale);
};

/**
 * Get all responsive sizes in one hook for convenience
 */
export const useResponsiveSizes = () => {
  const deviceType = useDeviceType();
  const fontScale = useFontScale();
  const iconScale = useIconScale();
  const spacingScale = useSpacingScale();

  return {
    deviceType,
    fontScale,
    iconScale,
    spacingScale,
    isTV: deviceType === 'tv',
    isDesktop: deviceType === 'desktop',
    isTablet: deviceType === 'tablet',
    isMobile: deviceType === 'mobile',
  };
};
