import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servewell.pos',
  appName: 'ServeWell POS',
  webDir: 'out',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
    }
  }
};

export default config;
