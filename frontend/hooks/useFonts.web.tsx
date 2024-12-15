import { useFonts as useFontsExpo } from 'expo-font'

export function useFonts() {
  return useFontsExpo({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Nunito: require('../assets/fonts/Nunito-VariableFont_wght.ttf'),
  })
}
