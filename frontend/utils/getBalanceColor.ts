import { Theme } from '@type/theme'

export function getBalanceColor(balance: number, theme: Theme) {
  if (balance === 0) {
    return theme.colors.balanceNeutral
  } else if (balance > 0) {
    return theme.colors.balancePositive
  } else {
    return theme.colors.balanceNegative
  }
}
