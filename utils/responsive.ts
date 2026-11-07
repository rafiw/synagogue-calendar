import { Platform, useWindowDimensions } from 'react-native';
import { ScreenOrientationMode } from './defs';
import { useOptionalSettings } from '@context/settingsContext';

/**
 * Device type detection and responsive sizing utilities
 * Provides font scaling and sizing for mobile phones, desktop, and Android TV
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';

export interface EffectiveDimensions {
  width: number;
  height: number;
  physicalWidth: number;
  physicalHeight: number;
  isRotated: boolean;
  rotationDegrees: '0deg' | '90deg';
}

/**
 * Computes effective width/height and 90-degree rotation state based on screenOrientation setting
 * and raw window dimensions. When a TV is physically rotated 90 degrees (portrait) without OS
 * display rotation support, physicalWidth > physicalHeight while orientation is 'vertical',
 * so we rotate the screen 90deg and swap width & height.
 */
export const getEffectiveDimensions = (
  orientation: ScreenOrientationMode | undefined,
  physicalWidth: number,
  physicalHeight: number,
): EffectiveDimensions => {
  const shouldRotateToPortrait = orientation === 'vertical' && physicalWidth > physicalHeight;
  const shouldRotateToLandscape = orientation === 'horizontal' && physicalHeight > physicalWidth;
  const isRotated = shouldRotateToPortrait || shouldRotateToLandscape;

  return {
    width: isRotated ? physicalHeight : physicalWidth,
    height: isRotated ? physicalWidth : physicalHeight,
    physicalWidth,
    physicalHeight,
    isRotated,
    rotationDegrees: isRotated ? '90deg' : '0deg',
  };
};

/**
 * Hook returning effective viewport dimensions after applying manual screenOrientation rotation.
 */
export const useEffectiveDimensions = (orientationOverride?: ScreenOrientationMode): EffectiveDimensions => {
  const { width: physicalWidth, height: physicalHeight } = useWindowDimensions();
  const optionalSettings = useOptionalSettings();
  const orientation = orientationOverride ?? optionalSettings?.settings?.synagogueSettings?.screenOrientation;
  return getEffectiveDimensions(orientation, physicalWidth, physicalHeight);
};

/**
 * Helper to determine if layout should render in portrait (vertical) mode
 * taking into account manual screenOrientation setting ('auto' | 'horizontal' | 'vertical').
 */
export const isPortraitLayout = (
  orientation: ScreenOrientationMode | undefined,
  width: number,
  height: number,
  autoThresholdWidth: number = 500,
): boolean => {
  if (orientation === 'vertical') return true;
  if (orientation === 'horizontal') return false;
  return width < autoThresholdWidth || height > width;
};

/**
 * Detects the device type based on screen width and platform
 */
export const useDeviceType = (orientationOverride?: ScreenOrientationMode): DeviceType => {
  const optionalSettings = useOptionalSettings();
  const orientation = orientationOverride ?? optionalSettings?.settings?.synagogueSettings?.screenOrientation;
  const { width, height } = useEffectiveDimensions(orientation);

  if (orientation === 'vertical') {
    return 'mobile';
  }
  if (orientation === 'horizontal') {
    if (Platform.isTV) return 'tv';
    return width > 1280 ? 'desktop' : 'tablet';
  }

  // Only actual Android TV platform should be treated as TV (10-foot UI)
  if (Platform.isTV) {
    return 'tv';
  }

  // On web, check mobile user agent or TV user agent
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileUA && width < 768) {
      return 'mobile';
    }

    const isTvUA = /TV|SmartTV|Tizen|Web0S|NetCast|HbbTV|Android.*TV|GoogleTV/i.test(navigator.userAgent);
    if (isTvUA) {
      return 'tv';
    }
  }

  // Standard CSS breakpoints based on viewport width or portrait aspect ratio
  if (width < 768 || height > width) {
    return 'mobile';
  }

  // Desktop/PC monitors (> 1280)
  if (width > 1280) {
    return 'desktop';
  }

  // Tablet range (768 - 1280)
  return 'tablet';
};

/**
 * Font size scales for different device types
 * TV needs moderately larger fonts due to viewing distance (10-foot UI)
 * but not so large that content overflows the screen
 * Desktop uses modest scaling for PC monitors at normal viewing distance (2-3 feet)
 */
const FONT_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0, // Phone at 6-12 inches
  tablet: 1.3, // Tablet at 12-18 inches
  desktop: 1.0, // PC monitor at 2-3 feet - no scaling needed
  tv: 1.2, // TV browser - minimal scaling to fit content on screen
};

/**
 * Icon size scales for different device types
 */
const ICON_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0, // Touch targets for fingers
  tablet: 1.2, // Larger touch targets
  desktop: 1.0, // Mouse cursor precision - no scaling
  tv: 1.3, // Remote control - moderate scaling for screen fit
};

/**
 * Spacing scale for different device types
 */
const SPACING_SCALE_MULTIPLIERS: Record<DeviceType, number> = {
  mobile: 1.0,
  tablet: 1.2,
  desktop: 1.0, // No extra spacing on desktop
  tv: 1.2, // Minimal spacing increase for TV
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
 * Returns a scale factor based on screen height
 * Useful for TV and small screens to ensure content fits
 */
export const useHeightScale = (): number => {
  const { width, height } = useEffectiveDimensions();

  // Use the shorter dimension (Math.min(width, height)) so that rotating a TV 90 degrees
  // into vertical/portrait mode keeps fonts proportional to the narrow screen width
  // instead of inflating 2x based on the tall vertical height.
  const baseDimension = Math.min(width, height);

  return Math.min(Math.max(0.3, baseDimension / 670), 2.2);
};

/**
 * Get all responsive sizes in one hook for convenience
 */
export const useResponsiveSizes = () => {
  const deviceType = useDeviceType();
  const fontScale = useFontScale();
  const iconScale = useIconScale();
  const spacingScale = useSpacingScale();
  const heightScale = useHeightScale();

  return {
    deviceType,
    fontScale,
    iconScale,
    spacingScale,
    heightScale,
    isTV: deviceType === 'tv',
    isDesktop: deviceType === 'desktop',
    isTablet: deviceType === 'tablet',
    isMobile: deviceType === 'mobile',
  };
};

export const getDisplayDebugInfo = () => {
  const { height, width, scale, fontScale } = useWindowDimensions();
  return {
    height,
    width,
    scale,
    fontScale,
  };
};
