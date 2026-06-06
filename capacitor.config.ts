import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitsquad.app',
  appName: 'FitSquad',
  webDir: 'out',
  server: {
    url: 'https://fitsquad-kappa.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
