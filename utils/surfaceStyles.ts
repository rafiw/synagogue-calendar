import { TextStyle } from 'react-native';

/**
 * Shared translucent rectangle/card surface styles used across all display screens.
 * Uses static Tailwind class literals so NativeWind/Tailwind includes them in the bundle.
 */
export const CARD_SURFACE_CLASS = 'bg-white/20';
export const CARD_SUBSURFACE_CLASS = 'bg-white/25';
export const CARD_BORDER_CLASS = 'border-white/35';

/**
 * Small translucent frame for text elements that sit directly over decorative wood/image borders (e.g. Header).
 */
export const HEADER_TEXT_FRAME_CLASS = 'bg-white/65 rounded-lg border border-white/75';

/**
 * Crisp light text shadow/halo so dark text remains legible over textured or wooden backgrounds.
 */
export const TEXT_SHADOW_STYLE: TextStyle = {
  textShadowColor: '#ffffff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 12,
};
