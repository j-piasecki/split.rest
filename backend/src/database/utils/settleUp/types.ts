import { BalanceChange } from 'shared'

export interface TargetedBalanceChange extends BalanceChange {
  targetId: string
}
