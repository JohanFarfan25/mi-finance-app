# My Finance App

## Descripción del proyecto

My Finance App es una aplicación híbrida móvil desarrollada con:
- **Ionic 8**
- **Angular 20** (Standalone Components)
- **Capacitor 8**
- **Stencil / Web Components**
- **Android WebView**
- **Overlay Controllers** (`ModalController`, `AlertController`, `LoadingController`, `PopoverController`, `ToastController`, `ActionSheetController`)
- **Lazy Loading** y **Tree Shaking**
- **Esbuild** a través del pipeline de Angular CLI

La aplicación permite gestionar finanzas personales con presupuestos, categorías, transacciones, reportes y configuraciones de usuario.

## Autor

- **Desarrollador**: Johan Alexander Farfán Sierra
- **Email**: johanfarfan25@gmail.com

## Tecnologías utilizadas

- Angular 20
- Ionic 8
- Capacitor 8
- @capacitor/android 8.3.4
- @capacitor/core 8.3.4
- @ionic/angular 8.8.8
- @ionic/core 8.8.8
- Zone.js 0.15.1
- TypeScript 5.2.2
- RxJS 7.8.0
- Apache Cordova SQLite para persistencia local
- Jeep SQLite y `@capacitor-community/sqlite`

## Requerimientos previos

Antes de instalar y ejecutar el proyecto necesitas:

- **Node.js** v18+ (de preferencia LTS)
- **npm** (v10+ con Node.js)
- **Java JDK 17+** para compilación Android
- **Android SDK** y herramientas de línea de comandos
- **Android Studio** para abrir el proyecto Android y generar APKs
- **Capacitor CLI** (`npm install -g @capacitor/cli`) opcional, pero recomendado
- **Git** si vas a clonar el repositorio

## Cómo descargar el proyecto

```bash
# Clonar el repositorio
git clone https://github.com/JohanFarfan25/mi-finance-app.git
cd mi-finance-app
```

> Si descargaste el ZIP, descomprime y abre la carpeta `mi-finance-app`.

## Instalación de dependencias

```bash
npm install
```

## Comandos principales

```bash
npm run start          # Inicia servidor de desarrollo Angular
npm run build          # Genera la aplicación en www/
npm run watch          # Build en modo watch para desarrollo local
```

## Ejecutar en el navegador

```bash
npm run start
```

Luego abre `http://localhost:4200`.

## Generar y preparar Android

1. Compilar la app web:

```bash
npm run build
# o alternativamente
ng build
```

2. Copiar los assets de la app web al proyecto Android:

```bash
npx cap copy android
# o alternativamente
npx cap sync android
```

3. Ejecutar la app en un emulador o dispositivo Android (requiere Android SDK/Android Studio instalados):

```bash
npx cap run android
```

4. O abrir el proyecto en Android Studio para ejecutar o generar APKs:

```bash
npx cap open android
```

5. En Android Studio, seleccionar dispositivo/emulador y ejecutar.

## Generar y preparar iOS

1. Compilar la app web:

```bash
npm run build
# o alternativamente
ng build
```

2. Copiar los assets de la app web al proyecto iOS:

```bash
npx cap copy ios
# o alternativamente
npx cap sync ios
```

3. Ejecutar la app en simulador o dispositivo iOS (requiere macOS y Xcode instalados):

```bash
npx cap run ios
```

4. O abrir el proyecto en Xcode:

```bash
npx cap open ios
```

## Generar APKs de Android

### Debug APK

```bash
cd android
./gradlew assembleDebug
```

### Release APK

```bash
cd android
./gradlew assembleRelease
```

### Ubicación del APK generado

Los APKs se generan dentro de la carpeta del proyecto Android en:

- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release.apk`

En otras palabras, el directorio raíz donde se encuentra el paquete es:

- `android/app/build/outputs/apk/`

## Estructura principal del proyecto

```text
.
├── README.md
├── android
├── angular.json
├── capacitor.config.ts
├── ionic.config.json
├── karma.conf.js
├── package-lock.json
├── package.json
├── src
│   ├── app
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── core
│   │   ├── features
│   │   └── shared
│   ├── assets
│   │   ├── icon
│   │   └── shapes.svg
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── global.scss
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── test.ts
│   ├── theme
│   │   └── variables.scss
│   └── zone-flags.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
└── www
```