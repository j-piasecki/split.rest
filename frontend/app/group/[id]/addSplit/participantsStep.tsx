import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
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
        user: participant.user,
        selected: index === getSplitCreationContext().paidByIndex,
        entry: participant.user?.email ?? '',
      })
    )

    result.push({ entry: '', selected: false })

    if (getSplitCreationContext().paidByIndex === undefined) {
      result[0].selected = true
    }

    return result
  }

  return [{ user: user, entry: user.email ?? '', selected: true }, { entry: '' }]
}

function ParticipansPicker({ user }: { user: User }) {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  const [entries, setEntries] = useState<PersonEntry[]>(getInitialEntries(user))
  const [error, setError] = useTranslatedError()

  function submit() {
    const userEntries = entries
      .filter((entry) => entry.user !== undefined)
      .map((entry) => ({
        user: entry.user!,
        selected: entry.selected,
      }))

    if (userEntries.length < 2) {
      setError(new TranslatableError('splitValidation.atLeastTwoEntries'))
      return
    }

    const payer = userEntries.find((entry) => entry.selected)?.user
    if (!payer) {
      setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    getSplitCreationContext().participants = userEntries.filter((entry) => entry.user)

    getSplitCreationContext().paidById = payer.id

    router.navigate(`/group/${id}/addSplit/summary`)
  }

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
          paddingTop: insets.top + 16,
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
        <Button rightIcon='chevronForward' title={t('form.buttonNext')} onPress={submit} />
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
      slideAnimation={false}
    >
      {user && <ParticipansPicker user={user} />}
    </ModalScreen>
  )
}
