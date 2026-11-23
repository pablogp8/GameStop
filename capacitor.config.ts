import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pablogp8.gamestop',
  appName: 'STOP - Reto 10 segundos',
  webDir: 'dist/boton-stop/browser',
  backgroundColor: '#f4f1e8',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1_500,
      backgroundColor: '#f4f1e8',
      showSpinner: false,
    },
  },
};

export default config;
