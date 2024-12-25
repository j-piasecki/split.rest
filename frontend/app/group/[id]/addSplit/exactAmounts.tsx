import ModalScreen from '@components/ModalScreen'
import { FormData, SplitEntryData, SplitForm } from '@components/SplitForm'
import { useCreateSplit } from '@hooks/database/useCreateSplit'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getSplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { BalanceChange, GroupInfo, User } from 'shared'

function initialEntriesFromContext(currentUser: User): SplitEntryData[] {
  const splitContext = getSplitCreationContext()

  const initialEntries =
    splitContext.participants === null
      ? [{ email: currentUser.email, amount: '', user: currentUser }]
      : splitContext.participants.map((participant) => ({
          email:
            typeof participant.userOrEmail === 'string'
              ? participant.userOrEmail
              : participant.userOrEmail.email,
          amount: '',
          user: typeof participant.userOrEmail === 'string' ? undefined : participant.userOrEmail,
        }))

  initialEntries.push({ email: '', amount: '', user: undefined })

  return initialEntries
}

function Form({ groupInfo, user }: { groupInfo: GroupInfo; user: User }) {
  const router = useRouter()
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)
  const { mutateAsync: createSplit } = useCreateSplit()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange } = await validateSplitForm(form)

      await createSplit({
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave,
        // TODO: allow to change date
        timestamp: Date.now(),
        balances: balanceChange as BalanceChange[],
      })

      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <SplitForm
        initialEntries={initialEntriesFromContext(user)}
        initialPaidByIndex={getSplitCreationContext().paidByIndex}
        initialTitle={getSplitCreationContext().title}
        titleEditable={!getSplitCreationContext().title}
        groupInfo={groupInfo}
        onSubmit={save}
        waiting={waiting}
        error={error}
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

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.exactAmounts')}
      maxWidth={500}
      opaque={false}
    >
      {(!user || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {user && groupInfo && <Form user={user} groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
