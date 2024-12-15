import { useMemo } from 'react'
// eslint-disable-next-line no-restricted-imports
import { Platform, StyleSheet, Text as TextNative, TextProps } from 'react-native'

export function Text({ style, ...props }: TextProps) {
  const styles = useMemo(() => {
    const styles = StyleSheet.flatten(style)

    if (styles.fontFamily === undefined) {
      let name = 'Nunito-'

      if (styles.fontWeight) {
        switch (styles.fontWeight) {
          case '100':
          case 100:
            name += 'ExtraLight'
            break
          case '200':
          case 200:
            name += 'ExtraLight'
            break
          case '300':
          case 300:
            name += 'Light'
            break
          case '400':
          case 400:
            name += 'Regular'
            break
          case '500':
          case 500:
            name += 'Medium'
            break
          case '600':
          case 600:
            name += 'SemiBold'
            break
          case '700':
          case 700:
            name += 'Bold'
            break
          case '800':
          case 800:
            name += 'ExtraBold'
            break
          case '900':
          case 900:
            name += 'Black'
            break
        }
      }

      if (styles.fontStyle === 'italic') {
        name += 'Italic'
      }

      styles.fontFamily = name

      if (Platform.OS === 'android') {
        delete styles.fontWeight
        delete styles.fontStyle
      }
    }

    return styles
  }, [style])

  return <TextNative {...props} style={[styles]} />
}
