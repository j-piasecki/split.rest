export type ThemeType = 'dark'

export interface Colors {
  background: string
  backgroundElevated: string
  text: string
}

export interface Theme {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  colors: Colors
}
