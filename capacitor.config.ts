import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tfit.app', // Replace with your actual App ID
  appName: 'The Treasured Collective', // Replace with your actual App Name
  webDir: 'out',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF", // White background for the splash screen
      androidSplashResourceName: "tf_head", // Updated to use tf_head (expects tf_head.png in drawables)
      androidScaleType: "CENTER_CROP", // How the splash screen image is displayed
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // For iOS, you'll need to configure the launch screen storyboard and add images to Assets.xcassets
      // iosSpinnerStyle: "small",
      // spinnerColor: "#999999",
    }
  }
};

export default config;
