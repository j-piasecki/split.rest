import { materialYouSupported, useDynamicColors } from '@modules/material-colors'
import { MaterialColors } from '@type/theme'

export function isMaterialYouSupported(): boolean {
  return materialYouSupported
}

export function useMaterialYouColors(): {
  dark: MaterialColors
  light: MaterialColors
} | null {
  return useDynamicColors()
}
