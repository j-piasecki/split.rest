/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Get all arguments passed to the script
const args = process.argv.slice(2)

function ensureFullDebugSymbols() {
  const filePath = path.join(process.cwd(), 'android', 'app', 'build.gradle')
  const append = `android.buildTypes.release.ndk.debugSymbolLevel = 'full'`

  if (!fs.existsSync(filePath)) {
    console.error(`build.gradle file not found at ${filePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  if (!fileContent.includes(append)) {
    fs.appendFileSync(filePath, `\n${append}\n`)
    console.log('full debug symbols set for Android')
  } else {
    console.log('full debug symbols are already set for Android')
  }
}

function fixIconColor() {
  const filePath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
  const content = fs.readFileSync(filePath, 'utf8')
  const newContent = content.replace(
    '<meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/iconBackground"/>',
    '<meta-data tools:replace="android:resource" android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/iconBackground"/>'
  )
  fs.writeFileSync(filePath, newContent)
  console.log('icon color fixed for Android')
}

function fixSentryScriptPath() {
  const filePath = path.join(process.cwd(), 'ios', 'Split.xcodeproj', 'project.pbxproj')
  const content = fs.readFileSync(filePath, 'utf8')
  const newContent = content.replace(
    'shellScript = "/bin/sh ../node_modules/@sentry/react-native/scripts/sentry-xcode-debug-files.sh";',
    'shellScript = "/bin/sh ../../node_modules/@sentry/react-native/scripts/sentry-xcode-debug-files.sh";'
  )
  fs.writeFileSync(filePath, newContent)
  console.log('sentry script path fixed for iOS')
}

// Run the `npx expo prebuild` command with passed arguments
const expoPrebuild = spawn('npx', ['expo', 'prebuild', ...args], { stdio: 'inherit' })

expoPrebuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`expo prebuild failed with exit code ${code}`)
    process.exit(code)
  }

  console.log('expo prebuild completed successfully.')

  ensureFullDebugSymbols()
  fixIconColor()
  fixSentryScriptPath()
})
