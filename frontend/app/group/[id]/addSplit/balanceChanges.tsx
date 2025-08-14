import ModalScreen from '@components/ModalScreen'
import { FormData, SplitEntryData, SplitForm } from '@components/SplitForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, Member, SplitMethod, TranslatableError } from 'shared'

function initialEntriesFromContext(currentUser: Member): SplitEntryData[] {
  const initialEntries: SplitEntryData[] =
    SplitCreationContext.current.participants === null
      ? [{ user: currentUser, entry: currentUser.email ?? '', amount: '' }]
      : SplitCreationContext.current.participants.map(
          (participant): SplitEntryData => ({
            user: participant.user,
            entry: participant.user.email ?? '',
            amount: '',
          })
        )

  initialEntries.push({ entry: '', amount: '' })

  return initialEntries
}

function Form({ groupInfo, user }: { groupInfo: GroupUserInfo; user: Member }) {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { sumToSave, balanceChange } = await validateSplitForm(form, false, false)

      const userEntries = form.entries
        .filter((entry) => entry.user !== undefined)
        .map((entry) => ({
          user: entry.user!,
          value: entry.amount,
        }))

      const total = balanceChange.reduce((prev, current) => prev + Number(current.change), 0)

      if (total > 0.01) {
        setError(new TranslatableError('splitValidation.allEntriesMustSumToZero'))
        return
      }

      SplitCreationContext.current.setParticipants(userEntries)
      SplitCreationContext.current.setPaidById(null)
      SplitCreationContext.current.setTitle(form.title)
      SplitCreationContext.current.setTotalAmount(sumToSave.toFixed(2))

      router.navigate(`/group/${groupInfo.id}/addSplit/summary`)
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
        splitMethod={SplitMethod.BalanceChanges}
        style={{
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
        initialEntries={initialEntriesFromContext(user)}
        initialPaidByIndex={SplitCreationContext.current.paidByIndex}
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
        showAddAllMembers={groupInfo.permissions.canReadMembers()}
      />
    </View>
  )
}

export default function Modal() {
  const user = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.balanceChanges')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
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
