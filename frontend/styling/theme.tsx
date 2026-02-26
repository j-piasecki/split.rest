import { isMaterialYouSupported, useMaterialYouColors } from './useMaterialYouColors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors, CustomColors, MaterialColors, Theme, ThemeType } from '@type/theme'
import React, { useEffect, useMemo } from 'react'
import { Appearance, Platform, useColorScheme } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'

const ThemeContext = React.createContext<Theme | null>(null)

const darkMaterialColors: MaterialColors = {
  primary: '#fcc0d2',
  onPrimary: '#650033',
  primaryContainer: '#8e004a',
  onPrimaryContainer: '#ffd9e2',

  secondary: '#e3bdc6',
  onSecondary: '#422931',
  secondaryContainer: '#5a3f47',
  onSecondaryContainer: '#ffd9e2',

  tertiary: '#efbd94',
  onTertiary: '#48290b',
  tertiaryContainer: '#613f20',
  onTertiaryContainer: '#ffdcc1',

  error: '#ed5555',
  onError: '#eeeeee',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  surfaceDim: '#191113',
  surface: '#1c1416',
  surfaceBright: '#413739',
  surfaceContainerLowest: '#140c0e',
  surfaceContainerLow: '#22191c',
  surfaceContainer: '#261d20',
  surfaceContainerHigh: '#31282a',
  surfaceContainerHighest: '#3c3235',

  onSurface: '#efdfe1',
  onSurfaceVariant: '#d5c2c6',
  outline: '#9e8c90',
  outlineVariant: '#514347',

  inverseSurface: '#efdfe1',
  inversePrimary: '#ad4065',
  inverseOnSurface: '#372e30',
}

const darkCustomColors: CustomColors = {
  transparent: 'transparent',
  balancePositive: '#1dd150',
  balanceNegative: '#eb4646',
  balanceNeutral: '#9e8c90',

  podiumGold: '#D4AF37',
  podiumSilver: '#C0C0C0',
  podiumBronze: '#CD7F32',
}

const darkColors: Colors = {
  ...darkMaterialColors,
  ...darkCustomColors,
}

const lightMaterialColors: MaterialColors = {
  primary: '#a8074f',
  onPrimary: '#ffffff',
  primaryContainer: '#fcb8c9',
  onPrimaryContainer: '#4a0825',

  secondary: '#6e3a49',
  onSecondary: '#ffffff',
  secondaryContainer: '#ffd9e2',
  onSecondaryContainer: '#2b151c',

  tertiary: '#7c5635',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffdcc1',
  onTertiaryContainer: '#2e1500',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffb2ab',
  onErrorContainer: '#410002',

  surfaceDim: '#e6d6d9',
  surface: '#fff8f8',
  surfaceBright: '#fff8f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff0f2',
  surfaceContainer: '#faeaed',
  surfaceContainerHigh: '#f5e4e7',
  surfaceContainerHighest: '#efdfe1',

  onSurface: '#22191c',
  onSurfaceVariant: '#514347',
  outline: '#837377',
  outlineVariant: '#d5c2c6',

  inverseSurface: '#372e30',
  inversePrimary: '#ffb1c8',
  inverseOnSurface: '#fdedef',
}

const lightCustomColors: CustomColors = {
  transparent: 'transparent',
  balancePositive: '#00C853',
  balanceNegative: '#D32F2F',
  balanceNeutral: '#9e8c90',

  podiumGold: '#D4AF37',
  podiumSilver: '#888888',
  podiumBronze: '#CD7F32',
}

const lightColors: Colors = {
  ...lightMaterialColors,
  ...lightCustomColors,
}

const THEME_KEY = 'application_theme'
const MATERIAL_YOU_KEY = 'should_use_material_you'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)
  const [theme, setTheme] = React.useState<ThemeType>('dark')
  const [userTheme, setUserTheme] = React.useState<ThemeType | null>('dark')
  const [shouldUseMaterialYou, setShouldUseMaterialYou] = React.useState(false)
  const materialYouColors = useMaterialYouColors()
  const systemTheme = useColorScheme()

  const colorsToUse = useMemo(() => {
    if (materialYouColors && shouldUseMaterialYou) {
      const customColors = theme === 'dark' ? darkCustomColors : lightCustomColors
      return {
        ...materialYouColors[theme],
        ...customColors,
      }
    }
    return theme === 'dark' ? darkColors : lightColors
  }, [materialYouColors, theme, shouldUseMaterialYou])

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(userTheme ?? 'unspecified')
    }
  }, [userTheme])

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if ((value && value === 'dark') || value === 'light') {
          setTheme(value)
          setUserTheme(value)
        } else {
          setTheme(systemTheme === 'unspecified' ? 'dark' : systemTheme)
          setUserTheme(null)
        }
      })
      .finally(() => {
        setReady(true)
      })
  }, [systemTheme])

  useEffect(() => {
    AsyncStorage.getItem(MATERIAL_YOU_KEY).then((value) => {
      setShouldUseMaterialYou(value === 'true')
    })
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (theme: ThemeType | null) => {
          setTheme(theme ?? (systemTheme === 'unspecified' ? 'dark' : systemTheme))
          setUserTheme(theme)

          if (theme) {
            AsyncStorage.setItem(THEME_KEY, theme)
          } else {
            AsyncStorage.removeItem(THEME_KEY)
          }
        },
        shouldUseMaterialYou,
        isMaterialYouSupported: isMaterialYouSupported,
        setShouldUseMaterialYou: (shouldUseMaterialYou: boolean) => {
          setShouldUseMaterialYou(shouldUseMaterialYou)
          AsyncStorage.setItem(MATERIAL_YOU_KEY, shouldUseMaterialYou.toString())
        },
        ready,
        userSelectedTheme: userTheme,
        colors: colorsToUse,
      }}
    >
      <SystemBars style={theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const theme = React.useContext(ThemeContext)

  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return theme
}
