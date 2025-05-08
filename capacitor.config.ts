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
      androidSplashResourceName: "tf_head_splash", // Name of the Ddrawable resource for Android (e.g., tf_head_splash.xml or your image name if directly in drawable)
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
