import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.31b89bf6a75f4ae088a17bc5d26ffe27',
  appName: 'collecto-buddy',
  webDir: 'dist',
  server: {
    url: 'https://31b89bf6-a75f-4ae0-88a1-7bc5d26ffe27.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;