/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  name: 'Meal Fit',
  slug: 'meal-fit-app',
  scheme: 'mealfit',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#10B981',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mealfit.app',
    buildNumber: '1',
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'Profil fotoğrafı seçmek için galeri erişimi gerekir.',
      NSCameraUsageDescription: 'Profil fotoğrafı çekmek için kamera erişimi gerekir.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.mealfit.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.CAMERA',
      'android.permission.READ_MEDIA_IMAGES',
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-notifications',
      {
        color: '#10B981',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Profil fotoğrafı seçmek için galeri erişimi gerekir.',
        cameraPermission: 'Profil fotoğrafı çekmek için kamera erişimi gerekir.',
      },
    ],
    'expo-font',
  ],
  ...(process.env.EXPO_ACCOUNT ? { owner: process.env.EXPO_ACCOUNT } : {}),
  extra: {
    ...(process.env.EAS_PROJECT_ID
      ? {
          eas: {
            projectId: process.env.EAS_PROJECT_ID,
          },
        }
      : {}),
    privacyPolicyUrl:
      process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ||
      'https://sebahattinozdemir.github.io/Meal-fit-app/privacy.html',
    termsUrl:
      process.env.EXPO_PUBLIC_TERMS_URL ||
      'https://sebahattinozdemir.github.io/Meal-fit-app/terms.html',
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@mealfit.app',
  },
};
