import { Platform, View } from 'react-native'

export type Rect = { x: number; y: number; width: number; height: number }

export function measure(ref: React.RefObject<View>) {
  if (!ref.current) {
    throw new Error('Tried to measure null reference')
  }

  let frame!: Rect

  if (Platform.OS === 'web') {
    // @ts-expect-error - getBoundingClientRect will not work on mobile
    frame = ref.current?.getBoundingClientRect()
  } else {
    ref.current?.measureInWindow((x, y, width, height) => {
      frame = { x, y, width, height }
    })
  }

  return frame
}
