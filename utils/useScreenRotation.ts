import { useState, useEffect, JSX } from 'react';
import { Screen } from './defs';

interface UseScreenRotationProps {
  screens: Screen[];
  defaultDisplayTime: number;
}

interface UseScreenRotationReturn {
  currentScreenIndex: number;
  CurrentScreenComponent: (() => JSX.Element | null) | undefined;
  isValid: boolean;
}

export const useScreenRotation = ({ screens, defaultDisplayTime }: UseScreenRotationProps): UseScreenRotationReturn => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const verifyAtLeastOneScreenIsEnabled = (): boolean => {
    return screens.some((screen) => screen.content() !== null);
  };

  useEffect(() => {
    if (screens.length === 0) return;

    const getNextValidIndex = (currentIndex: number): number => {
      let nextIndex = (currentIndex + 1) % screens.length;
      let loopCount = 0;

      while (screens[nextIndex]?.content() === null) {
        nextIndex = (nextIndex + 1) % screens.length;
        loopCount++;
        if (loopCount >= screens.length) return currentIndex; // Prevent infinite loop
      }

      return nextIndex;
    };

    const interval = setInterval(
      () => {
        setCurrentScreenIndex((prevIndex) => getNextValidIndex(prevIndex));
      },
      1000 * (screens[currentScreenIndex]?.presentTime || defaultDisplayTime),
    );

    return () => clearInterval(interval);
  }, [currentScreenIndex, screens, defaultDisplayTime]);

  return {
    currentScreenIndex,
    CurrentScreenComponent: screens[currentScreenIndex]?.content,
    isValid: verifyAtLeastOneScreenIsEnabled(),
  };
};
