import { Dimensions } from 'react-native'

export function isSmallScreen(width?: number): boolean {
  if (width) {
    return width < 768
  }

  return Dimensions.get('window').width < 768
}
