import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magnusjerono.memoryjournal',
  appName: 'Memory Journal',
  webDir: 'dist',
  // Route magic-link callbacks and deep links to the native app.
  server: {
    // When set, use a trusted https:// scheme for cookies / OAuth redirects.
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Memory Journal',
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'default',
    },
  },
};

export default config;
