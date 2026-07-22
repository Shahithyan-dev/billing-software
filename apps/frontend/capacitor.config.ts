import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servewell.pos',
  appName: 'ServeWell POS',
  webDir: 'out',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      updateUrl: 'https://raw.githubusercontent.com/Shahithyan-dev/billing-software/main/apps/frontend/latest.json',
    }
  }
};

export default config;
