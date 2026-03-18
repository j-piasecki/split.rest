import { useAppLayout } from '@utils/dimensionUtils'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useModalScreenInsets() {
  const insets = useSafeAreaInsets()
  const { modalsInRightPanel } = useAppLayout()

  return {
    top: 0,
    bottom: insets.bottom + (Platform.OS !== 'ios' || !insets.bottom ? 16 : 0),
    left: modalsInRightPanel ? 0 : insets.left,
    right: modalsInRightPanel ? 0 : insets.right,
  }
}
