/* eslint-disable @typescript-eslint/no-require-imports */
const { copyFileSync } = require('fs')
const { join } = require('path')
const glob = require('glob')

const { withDangerousMod } = require('@expo/config-plugins')

const androidResPath = ['app', 'src', 'main', 'res']

module.exports = (expoConfig) =>
  withDangerousMod(expoConfig, [
    'android',
    (modConfig) => {
      if (modConfig.modRequest.platform === 'android') {
        const androidDwarablePath = join(
          modConfig.modRequest.platformProjectRoot,
          ...androidResPath
        )
        const files = glob.sync('assets/res/**/*', {
          cwd: modConfig.modRequest.projectRoot,
          nodir: true,
          dot: true,
        })

        files.forEach((file) => {
          const targetPath = join(androidDwarablePath, file.replace(/^assets\/res\//, ''))
          copyFileSync(file, targetPath)
        })
      }
      return modConfig
    },
  ])
