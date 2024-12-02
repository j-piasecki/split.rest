import { Dimensions, useWindowDimensions } from 'react-native'

export function isSmallScreen(width?: number): boolean {
  if (width) {
    return width < 768
  }

  return Dimensions.get('window').width < 768
}

export function useIsSmallScreen() {
  return isSmallScreen(useWindowDimensions().width)
}

export function useThreeBarLayout() {
  return useWindowDimensions().width > 1024
}
