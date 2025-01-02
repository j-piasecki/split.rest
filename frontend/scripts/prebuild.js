/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Get all arguments passed to the script
const args = process.argv.slice(2)

function ensureBuildFromSource() {
  const filePath = path.join(process.cwd(), 'android', 'settings.gradle')
  const append = `
    includeBuild('../../node_modules/react-native') {
      dependencySubstitution {
        substitute(module("com.facebook.react:react-android")).using(project(":packages:react-native:ReactAndroid"))
        substitute(module("com.facebook.react:react-native")).using(project(":packages:react-native:ReactAndroid"))
        substitute(module("com.facebook.react:hermes-android")).using(project(":packages:react-native:ReactAndroid:hermes-engine"))
        substitute(module("com.facebook.react:hermes-engine")).using(project(":packages:react-native:ReactAndroid:hermes-engine"))
      }
    }
  `

  if (!fs.existsSync(filePath)) {
    console.error(`settings.gradle file not found at ${filePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  if (!fileContent.includes(append)) {
    fs.appendFileSync(filePath, `\n${append}\n`)
    console.log('build from source enabled for Android')
  } else {
    console.log('build from source is already enabled for Android')
  }
}

// Run the `npx expo prebuild` command with passed arguments
const expoPrebuild = spawn('npx', ['expo', 'prebuild', ...args], { stdio: 'inherit' })

expoPrebuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`expo prebuild failed with exit code ${code}`)
    process.exit(code)
  }

  console.log('expo prebuild completed successfully.')

  ensureBuildFromSource()
})