import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Cross-platform alert that works on both web and mobile
 * @param title - Alert title
 * @param message - Alert message
 * @param onOk - Optional callback when OK is pressed
 */
export const showAlert = (title: string, message: string, onOk?: () => void): void => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

/**
 * Cross-platform confirmation dialog that works on both web and mobile
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Optional callback when cancelled
 * @param options - Optional button text customization
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'default' | 'destructive';
  },
): void => {
  const confirmText = options?.confirmText || 'OK';
  const cancelText = options?.cancelText || 'Cancel';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: options?.confirmStyle || 'default', onPress: onConfirm },
    ]);
  }
};

/**
 * Cross-platform alert with custom buttons (mobile-style API)
 * On web, only supports up to 2 buttons (confirm dialog) or 1 button (alert)
 * @param title - Alert title
 * @param message - Alert message
 * @param buttons - Array of button configurations
 */
export const showAlertWithButtons = (title: string, message: string, buttons: AlertButton[]): void => {
  if (Platform.OS === 'web') {
    // Web only supports confirm (2 buttons) or alert (1 button)
    if (buttons.length <= 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0]?.onPress?.();
    } else {
      // Find cancel and confirm buttons
      const cancelButton = buttons.find((b) => b.style === 'cancel');
      const confirmButton = buttons.find((b) => b.style !== 'cancel') || buttons[1];

      if (window.confirm(`${title}\n\n${message}`)) {
        confirmButton?.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
