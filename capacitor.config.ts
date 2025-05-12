import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.treasurefitness.com',
  appName: 'TTC',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#EDF6F9", 
      androidSplashResourceName: "splash.png", 
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      // For iOS:
      // 1. App Icon: Add your 'tf_head.png' (and its different sizes) to the AppIcon set in Assets.xcassets in Xcode.
      // 2. Splash Screen Image: Add 'tf_head.png' to Assets.xcassets in Xcode.
      // 3. Launch Screen Storyboard: Modify your LaunchScreen.storyboard in Xcode to display this image.
      //    Capacitor uses the default 'LaunchScreen' storyboard unless 'iosSplashResourceName' is set.
      // iosSplashResourceName: "LaunchScreen", // Default. Change if you use a custom storyboard name.
    }
  }
};

export default config;
