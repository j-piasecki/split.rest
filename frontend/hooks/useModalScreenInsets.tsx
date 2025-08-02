import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useModalScreenInsets() {
  const insets = useSafeAreaInsets()
  const isSmallScreen = useDisplayClass() <= DisplayClass.Expanded

  return {
    top: 0,
    bottom: isSmallScreen ? insets.bottom + (Platform.OS !== 'ios' ? 16 : 0) : 0,
    left: isSmallScreen ? insets.left : 0,
    right: isSmallScreen ? insets.right : 0,
  }
}
