import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useAuth } from '@utils/auth'
import { getSplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { TranslatableError, User } from 'shared'

function getInitialEntries(user: User): PersonEntry[] {
  const savedParticipants = getSplitCreationContext().participants

  if (savedParticipants) {
    const result = savedParticipants.map(
      (participant, index): PersonEntry => ({
        userOrEmail: participant.user,
        selected: index === getSplitCreationContext().paidByIndex,
      })
    )

    result.push({ userOrEmail: '', selected: false })

    if (getSplitCreationContext().paidByIndex === undefined) {
      result[0].selected = true
    }

    return result
  }

  return [{ userOrEmail: user, selected: true }, { userOrEmail: '' }]
}

function ParticipansPicker({ user }: { user: User }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  const [entries, setEntries] = useState<PersonEntry[]>(getInitialEntries(user))
  const [error, setError] = useTranslatedError()

  function submit() {
    const userEntries = entries.filter((entry) => typeof entry.userOrEmail !== 'string')

    if (userEntries.length < 2) {
      setError(new TranslatableError('splitValidation.atLeastTwoEntries'))
      return
    }

    const payer = userEntries.find((entry) => entry.selected)?.userOrEmail as User | undefined
    const payerEmail = payer?.email

    if (!payerEmail) {
      setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    getSplitCreationContext().participants = userEntries
      .map((entry) => ({
        user: entry.userOrEmail as User,
      }))
      .filter((entry) => entry.user)

    getSplitCreationContext().paidByEmail = payerEmail

    router.navigate(`/group/${id}/addSplit/summary`)
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
        keyboardShouldPersistTaps='handled'
      >
        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ gap: 16, padding: 16, paddingTop: 8 }}
        >
          <Form autofocus={getSplitCreationContext().participants === null} onSubmit={submit}>
            <PeoplePicker
              groupId={Number(id)}
              entries={entries}
              selectable
              onEntriesChange={(entries) => {
                setEntries(entries)
                setError(null)
              }}
            />
          </Form>
        </Pane>
      </ScrollView>

      <View style={{ gap: 8, paddingHorizontal: 16 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <Button rightIcon='chevronForward' title={t('splitType.buttonNext')} onPress={submit} />
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const user = useAuth()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitParticipants')}
      maxWidth={500}
      opaque={false}
    >
      {user && <ParticipansPicker user={user} />}
    </ModalScreen>
  )
}
