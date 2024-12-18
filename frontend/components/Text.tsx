import { resolveFontName } from '@utils/resolveFontName'
import { useMemo } from 'react'
// eslint-disable-next-line no-restricted-imports
import { Platform, StyleSheet, Text as TextNative, TextProps } from 'react-native'

export function Text({ style, ...props }: TextProps) {
  const styles = useMemo(() => {
    const styles = StyleSheet.flatten(style)

    if (!styles) {
      return {
        fontFamily: resolveFontName(styles),
      }
    }

    if (styles?.fontFamily === undefined) {
      styles.fontFamily = resolveFontName(styles)

      if (Platform.OS === 'android') {
        delete styles.fontWeight
        delete styles.fontStyle
      }
    }

    return styles
  }, [style])

  return <TextNative {...props} style={[styles]} />
}
