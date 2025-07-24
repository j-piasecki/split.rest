import { LanguageTranslationKey } from '.'
import { SplitMethod } from './types'

export function validateAllowedSplitMethods(
  allowedSplitMethods: SplitMethod[]
): LanguageTranslationKey | null {
  if (allowedSplitMethods.length === 0) {
    return 'groupValidation.atLeastOneSplitMethodMustBeAllowed'
  }

  if (
    !allowedSplitMethods.includes(SplitMethod.Equal) &&
    !allowedSplitMethods.includes(SplitMethod.ExactAmounts) &&
    !allowedSplitMethods.includes(SplitMethod.Shares)
  ) {
    return 'groupValidation.atLeastOneNormalSplitMethodMustBeAllowed'
  }

  return null
}
