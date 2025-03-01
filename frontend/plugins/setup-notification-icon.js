// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins')

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest

module.exports = (config) => {
  return withAndroidManifest(config, async (config) => {
    config.modResults = await setNotificationIcon(config, config.modResults)
    return config
  })
}

async function setNotificationIcon(config, androidManifest) {
  // Get the <application /> tag and assert if it doesn't exist.
  const mainApplication = getMainApplicationOrThrow(androidManifest)

  addMetaDataItemToMainApplication(
    mainApplication,
    // value for `android:name`
    'com.google.firebase.messaging.default_notification_icon',
    // value for `android:resource`
    '@drawable/ic_notification',
    'resource'
  )

  addMetaDataItemToMainApplication(
    mainApplication,
    // value for `android:name`
    'com.google.firebase.messaging.default_notification_color',
    // value for `android:resource`
    '@color/iconBackground',
    'resource'
  )

  return androidManifest
}
