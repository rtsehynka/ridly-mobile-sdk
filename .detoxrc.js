/** @type {import('detox').DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'apps/magento/ios/detox-build/Build/Products/Debug-iphonesimulator/RIDLYDemoStore.app',
      build: 'cd apps/magento && xcodebuild -workspace ios/RIDLYDemoStore.xcworkspace -scheme RIDLYDemoStore -configuration Debug -sdk iphonesimulator -derivedDataPath ios/detox-build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'apps/magento/ios/detox-build/Build/Products/Release-iphonesimulator/RIDLYDemoStore.app',
      build: 'cd apps/magento && xcodebuild -workspace ios/RIDLYDemoStore.xcworkspace -scheme RIDLYDemoStore -configuration Release -sdk iphonesimulator -derivedDataPath ios/detox-build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'apps/magento/android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd apps/magento/android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'apps/magento/android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd apps/magento/android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 17 Pro Max' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
    attached: {
      type: 'android.attached',
      device: { adbName: '.*' },
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
    },
    launchApp: 'auto',
    cleanup: {
      shutdownDevice: false,
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
  },
};
