import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export class HapticFeedback {
  static async impactLight() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  static async impactMedium() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }
}
