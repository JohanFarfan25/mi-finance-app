import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { registerAppIcons } from './app/core/icons/app-icons';
import { applyAndroidKeyboardPolyfill } from './app/core/utils/keyboard-android-polyfill';

registerAppIcons();
applyAndroidKeyboardPolyfill();

window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', event.error ?? event.message, event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[GLOBAL UNHANDLED REJECTION]', event.reason, event);
});

if (Capacitor.isNativePlatform()) {
  document.body.classList.add('capacitor-native');
  document.querySelector('jeep-sqlite')?.remove();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ animated: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
