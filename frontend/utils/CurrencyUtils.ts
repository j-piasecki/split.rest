const formatters: Record<string, (amount: string) => string> = {
  pln: (amount: string) => `${amount} zł`,
  usd: (amount: string) => `$${amount}`,
}

// TODO: no intl support in hermes :sadge:

export class CurrencyUtils {
  static format(amount: number | string, currency?: string, includePositiveSign = false): string {
    const stringAmount = typeof amount === 'number' ? amount.toFixed(2) : amount
    const formattedNumber = stringAmount.startsWith('-') ? stringAmount.substring(1) : stringAmount
    let signToAdd = includePositiveSign && Number(amount) > 0 ? '+' : ''

    if (Number(amount) < 0) {
      signToAdd = '-'
    }

    const formatter = currency ? formatters[currency.toLocaleLowerCase()] : undefined
    let withCurrency = formattedNumber

    if (formatter) {
      withCurrency = formatter(formattedNumber)
    } else if (currency) {
      withCurrency = `${formattedNumber} ${currency}`
    }

    if (signToAdd.length > 0) {
      return `${signToAdd}${withCurrency}`
    }

    return withCurrency
  }
}