import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { Text } from '@components/Text'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
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
    const result = savedParticipants.map((participant, index) => ({
      user: typeof participant.userOrEmail === 'string' ? undefined : participant.userOrEmail,
      email:
        typeof participant.userOrEmail === 'string'
          ? participant.userOrEmail
          : participant.userOrEmail.email,
      selected: index === getSplitCreationContext().paidByIndex,
    }))

    result.push({ email: '', user: undefined, selected: false })

    if (getSplitCreationContext().paidByIndex === undefined) {
      result[0].selected = true
    }

    return result
  }

  return [{ user, email: user.email, selected: true }, { email: '' }]
}

function ParticipansPicker({ user }: { user: User }) {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  const [entries, setEntries] = useState<PersonEntry[]>(getInitialEntries(user))
  const [error, setError] = useTranslatedError()

  function submit() {
    if (entries.length < 3) {
      setError(new TranslatableError('splitValidation.atLeastTwoEntries'))
      return
    }

    const payerEmail = entries.find((entry) => entry.selected)?.email

    if (!payerEmail) {
      setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    getSplitCreationContext().participants = entries
      .map((entry) => ({
        userOrEmail: entry.user ?? entry.email,
      }))
      .filter((entry) => entry.userOrEmail)

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
          <PeoplePicker
            groupId={Number(id)}
            entries={entries}
            selectable
            onEntriesChange={(entries) => {
              setEntries(entries)
              setError(null)
            }}
          />
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
        {error && (
          <Text
            style={{
              color: theme.colors.error,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {error}
          </Text>
        )}
        <Button leftIcon='arrowForward' title={t('splitType.buttonNext')} onPress={submit} />
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
