import { Colors, Theme, ThemeType } from '@type/theme'
import React from 'react'

const ThemeContext = React.createContext<Theme | null>(null)

const darkColors: Colors = {
  // background: '#121212',
  // backgroundElevated: '#181818',
  // text: '#ffffff',
  // highlight: '#ffffff33',

  // tabHeader: 'transparent',
  // tabHeaderPressed: '#333333',
  // tabHeaderSelected: '#222222',

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

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  surfaceDim: '#191113',
  surface: '#191113',
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
  inversePrimary: '#372e30',
  inverseOnSurface: '#8c4a60',
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeType>('dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: darkColors }}>
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
