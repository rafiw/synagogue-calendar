/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType } from 'react-native';
import { EventType } from './defs';

export const EVENT_TYPES: EventType[] = ['bar_mitzva', 'bat_mitzva', 'brit', 'brita', 'wedding'];

export const EVENT_IMAGES: Record<EventType, ImageSourcePropType> = {
  bar_mitzva: require('../assets/events/bar_mitzva.jpg'),
  bat_mitzva: require('../assets/events/bat_mitzva.jpg'),
  brit: require('../assets/events/brit.jpg'),
  brita: require('../assets/events/brita.jpg'),
  wedding: require('../assets/events/wedding.jpg'),
};

export function getEventImage(eventType?: EventType): ImageSourcePropType {
  if (eventType && EVENT_IMAGES[eventType]) {
    return EVENT_IMAGES[eventType];
  }
  return EVENT_IMAGES.bar_mitzva;
}
