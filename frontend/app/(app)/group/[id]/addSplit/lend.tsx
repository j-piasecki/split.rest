import ModalScreen from '@components/ModalScreen'
import { FormData, SplitEntryData, SplitForm } from '@components/SplitForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useSplitCreationFlow } from '@hooks/useSplitCreationFlow'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, Member, SplitMethod, TranslatableError } from 'shared'

function initialEntriesFromContext(user: Member): SplitEntryData[] {
  const participants = SplitCreationContext.current.participants
  const lender = participants?.[0]?.user ?? user

  let initialEntries: SplitEntryData[] =
    participants === null
      ? []
      : participants.map(
          (participant): SplitEntryData => ({
            user: participant.user,
            entry: participant.user.email ?? '',
            amount: participant.value ?? '',
          })
        )

  initialEntries.push({ entry: '', amount: '' })
  initialEntries = initialEntries.filter((entry) => entry.user?.id !== lender.id)
  initialEntries.unshift({ entry: lender.email ?? '', amount: '0.00', user: lender })

  if (lender.id !== user.id && !initialEntries.some((entry) => entry.user?.id === user.id)) {
    initialEntries.splice(1, 0, { entry: user.email ?? '', amount: '', user })
  }

  return initialEntries
}

function Form({ groupInfo, user }: { groupInfo: GroupUserInfo; user: Member }) {
  const { navigateToNextScreen } = useSplitCreationFlow()
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)

  async function save(form: FormData) {
    try {
      setWaiting(true)

      const formWithPayer = {
        ...form,
        paidByIndex: 0,
        entries: [...form.entries],
      }

      const { sumToSave } = await validateSplitForm(formWithPayer, false, true, true)
      const paidBy = formWithPayer.entries[formWithPayer.paidByIndex]

      if (paidBy.user === undefined) {
        setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
        return
      }

      const userEntries = formWithPayer.entries
        .filter((entry) => entry.user !== undefined)
        .map((entry) => ({
          user: entry.user!,
          value: entry.amount,
        }))

      SplitCreationContext.current.setParticipants(userEntries)
      SplitCreationContext.current.setPaidById(paidBy.user.id)
      SplitCreationContext.current.setTitle(form.title)
      SplitCreationContext.current.setTotalAmount(sumToSave.toFixed(2))

      navigateToNextScreen()
    } catch (error) {
      setError(error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}
    >
      <SplitForm
        splitMethod={SplitMethod.Lend}
        style={{
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
        initialEntries={initialEntriesFromContext(user)}
        initialPaidByIndex={0}
        initialTitle={SplitCreationContext.current.title}
        showDetails={false}
        showCalendar={false}
        groupInfo={groupInfo}
        onSubmit={save}
        waiting={waiting}
        error={error}
        cleanError={() => setError(null)}
        buttonTitle='form.buttonNext'
        buttonIcon='chevronForward'
        buttonIconLocation='right'
        showAddAllMembers={false}
        showPayerSelector={false}
        entriesTitle={SplitCreationContext.current.isBorrow ? 'form.lenders' : 'form.borrowers'}
      />
    </View>
  )
}

export default function Modal() {
  const { user } = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t(SplitCreationContext.current.isBorrow ? 'screenName.borrow' : 'screenName.lend')}
    >
      {(!memberInfo || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {memberInfo && groupInfo && <Form user={memberInfo} groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
