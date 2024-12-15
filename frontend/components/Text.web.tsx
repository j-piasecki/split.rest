// eslint-disable-next-line no-restricted-imports
import { Text as TextNative, TextProps } from 'react-native'

export function Text({ style, ...props }: TextProps) {
  return <TextNative {...props} style={[{ fontFamily: 'Nunito' }, style]} />
}
