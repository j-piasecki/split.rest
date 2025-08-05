import { MaterialPalette } from './MaterialColors.types'
import { NativeModule, requireNativeModule } from 'expo'

declare class MaterialColorsModule extends NativeModule {
  supported: boolean
  getMaterialColors(): MaterialPalette
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MaterialColorsModule>('MaterialColors')
