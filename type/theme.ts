export type ThemeType = 'light' | 'dark'

export interface Theme {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}