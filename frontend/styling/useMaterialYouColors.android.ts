import {
  MaterialYouPalette,
  deviceSupportsMaterialYou,
  useMaterialYou,
} from '@assembless/react-native-material-you'
import { MaterialColors } from '@type/theme'
import { useEffect } from 'react'
import { AppState } from 'react-native'

// tone to index in palette
const toneIndexMap: Record<number, number> = {
  100: 0,
  99: 1,
  95: 2,
  90: 3,
  80: 4,
  70: 5,
  60: 6,
  50: 7,
  40: 8,
  30: 9,
  20: 10,
  10: 11,
  0: 12,
}

const availableTones = Object.keys(toneIndexMap).map(Number)

function closestTone(target: number): number {
  return availableTones.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )
}

const tone = (arr: string[], target: number) => {
  const t = closestTone(target)
  const index = toneIndexMap[t]
  return arr[index]
}

function paletteToColors(palette: MaterialYouPalette | null) {
  if (!palette) {
    return null
  }

  const {
    system_accent1: a1,
    system_accent2: a2,
    system_accent3: a3,
    system_neutral1: n1,
    system_neutral2: n2,
  } = palette

  const light: MaterialColors = {
    primary: tone(a1, 40),
    onPrimary: tone(a1, 100),
    primaryContainer: tone(a1, 90),
    onPrimaryContainer: tone(a1, 10),

    secondary: tone(a2, 40),
    onSecondary: tone(a2, 100),
    secondaryContainer: tone(a2, 90),
    onSecondaryContainer: tone(a2, 10),

    tertiary: tone(a3, 40),
    onTertiary: tone(a3, 100),
    tertiaryContainer: tone(a3, 90),
    onTertiaryContainer: tone(a3, 10),

    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffb2ab',
    onErrorContainer: '#410002',

    surfaceDim: tone(n1, 87),
    surface: tone(n1, 98),
    surfaceBright: tone(n1, 98),
    surfaceContainerLowest: tone(n1, 100),
    surfaceContainerLow: tone(n1, 96),
    surfaceContainer: tone(n1, 90),
    surfaceContainerHigh: tone(n1, 80),
    surfaceContainerHighest: tone(n1, 70),

    onSurface: tone(n1, 10),
    onSurfaceVariant: tone(n2, 30),
    outline: tone(n2, 50),
    outlineVariant: tone(n2, 80),

    inverseSurface: tone(n1, 20),
    inversePrimary: tone(a1, 80),
    inverseOnSurface: tone(n1, 95),
  }

  const dark: MaterialColors = {
    primary: tone(a1, 80),
    onPrimary: tone(a1, 20),
    primaryContainer: tone(a1, 30),
    onPrimaryContainer: tone(a1, 90),

    secondary: tone(a2, 80),
    onSecondary: tone(a2, 20),
    secondaryContainer: tone(a2, 30),
    onSecondaryContainer: tone(a2, 90),

    tertiary: tone(a3, 80),
    onTertiary: tone(a3, 20),
    tertiaryContainer: tone(a3, 30),
    onTertiaryContainer: tone(a3, 90),

    error: '#ed5555',
    onError: '#eeeeee',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',

    surfaceDim: tone(n1, 6),
    surface: tone(n1, 6),
    surfaceBright: tone(n1, 24),
    surfaceContainerLowest: tone(n1, 0),
    surfaceContainerLow: tone(n1, 10),
    surfaceContainer: tone(n1, 20),
    surfaceContainerHigh: tone(n1, 30),
    surfaceContainerHighest: tone(n1, 40),

    onSurface: tone(n1, 90),
    onSurfaceVariant: tone(n2, 80),
    outline: tone(n2, 60),
    outlineVariant: tone(n2, 30),

    inverseSurface: tone(n1, 90),
    inversePrimary: tone(a1, 40),
    inverseOnSurface: tone(n1, 20),
  }

  return { light, dark }
}

export function isMaterialYouSupported(): boolean {
  return deviceSupportsMaterialYou()
}

export function useMaterialYouColors(): {
  dark: MaterialColors
  light: MaterialColors
} | null {
  const materialYou = useMaterialYou({})

  // TODO: refreshing doesn't work in some cases
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        materialYou._refresh()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [materialYou])

  return paletteToColors(materialYou.palette)
}
