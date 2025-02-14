import { SplitForm, SplitFormProps } from './SplitForm'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { SplitType, SplitWithUsers } from 'shared'

export interface SplitEditFormProps
  extends Omit<
    SplitFormProps,
    'initialTitle' | 'initialEntries' | 'initialPaidByIndex' | 'initialTimestamp'
  > {
  splitInfo: SplitWithUsers
}

export function SplitEditForm({ splitInfo, ...rest }: SplitEditFormProps) {
  const initialEntries = [
    ...splitInfo.users.map((user) => {
      if (splitInfo.type === SplitType.BalanceChange) {
        return {
          user: user,
          entry: user.email ?? '',
          amount: CurrencyUtils.format(Number(user.change)),
        }
      }

      if (user.id === splitInfo.paidById) {
        return {
          user: user,
          entry: user.email ?? '',
          amount: CurrencyUtils.format(Number(splitInfo.total) - Number(user.change)),
        }
      }
      return {
        user: user,
        entry: user.email ?? '',
        amount: CurrencyUtils.format(-Number(user.change)),
      }
    }),
    { entry: '', amount: '' },
  ]

  const initialPaidByIndex = splitInfo.users.findIndex((user) => user.id === splitInfo.paidById)

  return (
    <SplitForm
      initialTitle={splitInfo.title}
      initialEntries={initialEntries}
      initialPaidByIndex={initialPaidByIndex}
      initialTimestamp={splitInfo.timestamp}
      {...rest}
    />
  )
}
