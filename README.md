# My Finance App

## Capturas de pantalla

<table>
  <tr>
    <td><img width="180" alt="Pantalla 1" src="https://github.com/user-attachments/assets/6fa70487-3308-4922-9d8d-9d70556140f2" /></td>
    <td><img width="180" alt="Pantalla 2" src="https://github.com/user-attachments/assets/77b3d372-f753-4309-b3cb-3045f5eee46e" /></td>
    <td><img width="180" alt="Pantalla 3" src="https://github.com/user-attachments/assets/740e993a-0f01-4c93-95c1-8ea1c0891dfb" /></td>
    <td><img width="180" alt="Pantalla 4" src="https://github.com/user-attachments/assets/b318d681-0f70-473c-b7b2-25c4116b474b" /></td>
  </tr>
  <tr>
    <td><img width="180" alt="Pantalla 5" src="https://github.com/user-attachments/assets/09418f73-87f2-4c34-be8e-df88fa850ed7" /></td>
    <td><img width="180" alt="Pantalla 6" src="https://github.com/user-attachments/assets/f70d6bc1-0b1a-4e4b-acb3-5729da75cfd8" /></td>
    <td><img width="180" alt="Pantalla 7" src="https://github.com/user-attachments/assets/1138250f-6365-4e19-9daa-ee8d64bc1d1f" /></td>
    <td></td>
  </tr>
</table>

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
