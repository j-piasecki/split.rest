import { BalanceChange } from 'shared'

export interface TargetedBalanceChange extends BalanceChange {
  targetId: string
}

export interface Transaction {
  from: string
  to: string
  amount: string
}

export interface GroupedSettlement {
  targetId: string
  payments: Array<{
    from: string
    amount: string
  }>
}
