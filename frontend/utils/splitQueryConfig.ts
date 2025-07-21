import { SplitType, UserWithDisplayName } from 'shared'

export interface SplitQueryConfig {
  titleFilter?: string
  titleCaseSensitive: boolean
  titleRegex: boolean
  participants?: UserWithDisplayName[]
  participantsMode?: 'all' | 'oneOf'
  orderBy: 'timestamp' | 'createdAt' | 'total' | 'balanceChange' | 'updatedAt'
  orderDirection: 'asc' | 'desc'
  paidBy?: UserWithDisplayName[]
  lastUpdateBy?: UserWithDisplayName[]
  beforeTimestamp?: number
  afterTimestamp?: number
  lastUpdateBeforeTimestamp?: number
  lastUpdateAfterTimestamp?: number
  // undefined is all, true is edited, false is not edited
  edited?: boolean
  pending?: boolean
  splitTypes?: SplitType[]
}

export const defaultQueryConfig: SplitQueryConfig = {
  titleCaseSensitive: false,
  titleRegex: false,
  orderBy: 'createdAt',
  orderDirection: 'desc',
  splitTypes: [
    SplitType.Normal,
    SplitType.SettleUp,
    SplitType.SettleUp | SplitType.Inversed,
    SplitType.BalanceChange,
    SplitType.Lend,
    SplitType.Delayed,
  ],
}
