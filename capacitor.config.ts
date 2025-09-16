import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.collecto.buddy',
  appName: 'collecto-buddy',
  webDir: 'dist',
  // Server config removed for local development
  // When building for production, this can be uncommented and configured
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;