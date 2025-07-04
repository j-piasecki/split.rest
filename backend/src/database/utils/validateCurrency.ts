import { BadRequestException } from '../../errors/BadRequestException'
import { CurrencyUtils } from 'shared'

export function validateCurrency(currency: string) {
  if (!CurrencyUtils.supportedCurrencies.some((item) => item === currency)) {
    throw new BadRequestException('api.unsupportedCurrency')
  }
}
