import { Colors, Theme, ThemeType } from '@type/theme'
import React from 'react'
import { Appearance, Platform } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'

const ThemeContext = React.createContext<Theme | null>(null)

const darkColors: Colors = {
  transparent: 'transparent',

  primary: '#ffb1c8',
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

  error: '#ba1a1a',
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

  balancePositive: '#1fc24d',
  balanceNegative: '#C62828',
  balanceNeutral: '#9e8c90',
}

const lightColors: Colors = {
  transparent: 'transparent',

  primary: '#8c4a60',
  onPrimary: '#ffffff',
  primaryContainer: '#ffd9e2',
  onPrimaryContainer: '#3a071d',

  secondary: '#74565f',
  onSecondary: '#ffffff',
  secondaryContainer: '#ffd9e2',
  onSecondaryContainer: '#2b151c',

  tertiary: '#7c5635',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffdcc1',
  onTertiaryContainer: '#2e1500',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
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

  balancePositive: '#00C853',
  balanceNegative: '#D32F2F',
  balanceNeutral: '#9e8c90',
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeType>('dark')

  if (Platform.OS !== 'web') {
    Appearance.setColorScheme(theme)
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, colors: theme === 'dark' ? darkColors : lightColors }}
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
