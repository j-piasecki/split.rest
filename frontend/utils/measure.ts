import { Platform, View } from 'react-native'

export type Rect = { x: number; y: number; width: number; height: number }

export function measure(ref: View) {
  let frame!: Rect

  if (Platform.OS === 'web') {
    frame = ref.getBoundingClientRect()
  } else {
    ref.measureInWindow((x, y, width, height) => {
      frame = { x, y, width, height }
    })
  }

  return frame
}
