import { Platform, TextStyle } from 'react-native'

export function resolveFontName(style?: TextStyle) {
  if (Platform.OS === 'web') {
    return 'Nunito'
  }

  let name = 'Nunito-'

  if (style?.fontWeight) {
    switch (style.fontWeight) {
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
  } else {
    name += 'Regular'
  }

  if (style?.fontStyle === 'italic') {
    name += 'Italic'
  }

  return name
}
