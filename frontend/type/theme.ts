export type ThemeType = 'dark' | 'light'

export interface Colors {
  transparent: string

  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string

  secondary: string
  onSecondary: string
  secondaryContainer: string
  onSecondaryContainer: string

  tertiary: string
  onTertiary: string
  tertiaryContainer: string
  onTertiaryContainer: string

  error: string
  onError: string
  errorContainer: string
  onErrorContainer: string

  surfaceDim: string
  surface: string
  surfaceBright: string
  surfaceContainerLowest: string
  surfaceContainerLow: string
  surfaceContainer: string
  surfaceContainerHigh: string
  surfaceContainerHighest: string

  onSurface: string
  onSurfaceVariant: string
  outline: string
  outlineVariant: string

  inverseSurface: string
  inversePrimary: string
  inverseOnSurface: string

  balancePositive: string
  balanceNegative: string
  balanceNeutral: string
}

export interface Theme {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  colors: Colors
  ready: boolean
}
