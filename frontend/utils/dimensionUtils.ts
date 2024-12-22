import { Dimensions, useWindowDimensions } from 'react-native'

export enum DisplayClass {
  Small = 0,
  Expanded = 1,
  Medium = 2,
  Large = 3,
  ExtraLarge = 4,
}

export function getDisplayClass(width?: number): DisplayClass {
  if (width === undefined) {
    width = Dimensions.get('window').width
  }

  if (width < 660) {
    return DisplayClass.Small
  } else if (width < 800) {
    return DisplayClass.Expanded
  } else if (width < 1100) {
    return DisplayClass.Medium
  } else if (width < 1600) {
    return DisplayClass.Large
  } else {
    return DisplayClass.ExtraLarge
  }
}

export function useDisplayClass() {
  return getDisplayClass(useWindowDimensions().width)
}

export function useThreeBarLayout() {
  return useDisplayClass() > DisplayClass.Medium
}
