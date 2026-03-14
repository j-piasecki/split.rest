import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useModalScreenInsets() {
  const insets = useSafeAreaInsets()
  const isSmallScreen = useDisplayClass() <= DisplayClass.Expanded

  return {
    top: 0,
    bottom: insets.bottom + 16,
    left: isSmallScreen ? insets.left : 0,
    right: isSmallScreen ? insets.right : 0,
  }
}
