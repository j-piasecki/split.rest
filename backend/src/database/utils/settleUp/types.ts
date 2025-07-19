import { BalanceChange } from 'shared'

export interface TargetedBalanceChange extends BalanceChange {
  targetId: string
}

export interface Transaction {
  from: string
  to: string
  amount: string
}
