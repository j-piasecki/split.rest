import { Colors, Theme, ThemeType } from '@type/theme'
import React from 'react'

const ThemeContext = React.createContext<Theme | null>(null)

const darkColors: Colors = {
  background: '#121212',
  backgroundElevated: '#181818',
  text: '#ffffff',
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
