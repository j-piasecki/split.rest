import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export class HapticFeedback {
  static async pullDownActive() {
    if (Platform.OS === 'web') {
      return
    }

    if (Platform.OS === 'android' && Platform.Version >= 30) {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_End)
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  static async longPress() {
    if (Platform.OS === 'web') {
      return
    }

    if (Platform.OS === 'android') {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press)
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  static async confirm() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  static async reject() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }

  static async tick() {
    if (Platform.OS === 'web') {
      return
    }

    if (Platform.OS === 'android') {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick)
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  static async rouletteFirst() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
  }

  static async rouletteSecond() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  static async rouletteThird() {
    if (Platform.OS === 'web') {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  static async rouletteRest() {
    if (Platform.OS === 'web') {
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }
}
