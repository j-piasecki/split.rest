import { MaterialColors } from '@type/theme'

export function isMaterialYouSupported(): boolean {
  return false
}

export function useMaterialYouColors(): {
  dark: MaterialColors
  light: MaterialColors
} | null {
  return null
}
