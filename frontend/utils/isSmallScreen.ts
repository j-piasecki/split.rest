import { Dimensions } from 'react-native'

export function isSmallScreen() {
  return Dimensions.get('window').width < 768
}
