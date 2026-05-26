import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.johanfarfan.myfinanceapp',
  appName: 'my-finance-app',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      androidIsEncrypted: false,
      androidDatabaseLocation: 'default',
    },
  },
};

export default config;
