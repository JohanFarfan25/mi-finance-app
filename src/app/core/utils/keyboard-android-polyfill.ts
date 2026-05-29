import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

/** Android no implementa getResizeMode; Ionic lo consulta al iniciar inputs. */
export function applyAndroidKeyboardPolyfill(): void {
  if (Capacitor.getPlatform() !== 'android') {
    return;
  }

  Keyboard.getResizeMode = async () => ({ mode: KeyboardResize.Native });
}
