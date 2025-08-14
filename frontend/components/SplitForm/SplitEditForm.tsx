import { SplitForm, SplitFormProps } from './SplitForm'
import { CurrencyUtils, Member } from 'shared'
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
      const backfilledMember: Member = {
        ...user,
        balance: user.balance ?? '0.00',
        isAdmin: user.isAdmin ?? false,
        hasAccess: user.hasAccess ?? true,
      }

      if (splitInfo.type === SplitType.BalanceChange) {
        return {
          user: backfilledMember,
          entry: user.email ?? '',
          amount: CurrencyUtils.format(Number(user.change)),
        }
      }

      if (splitInfo.type === SplitType.Delayed) {
        return {
          user: backfilledMember,
          entry: user.email ?? '',
          amount: '0.00',
        }
      }

      if (user.id === splitInfo.paidById) {
        return {
          user: backfilledMember,
          entry: user.email ?? '',
          amount: CurrencyUtils.format(Number(splitInfo.total) - Number(user.change)),
        }
      }
      return {
        user: backfilledMember,
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
