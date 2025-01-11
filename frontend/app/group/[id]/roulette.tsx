import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { getBalances } from '@database/getBalances'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { beginNewSplit } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { TranslatableError, User, UserWithBalanceChange } from 'shared'

interface RouletteProps {
  groupId: number
  setResult: (result: UserWithBalanceChange[]) => void
  user: User
}

function Roulette({ groupId, setResult, user }: RouletteProps) {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<PersonEntry[]>([
    { userOrEmail: user },
    { userOrEmail: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useTranslatedError()

  async function submit() {
    setError(null)
    const filledEmails = entries
      .filter((entry) => typeof entry.userOrEmail !== 'string')
      .map((entry) => (entry.userOrEmail as User).email)

    if (filledEmails.length < 2) {
      setError(new TranslatableError('roulette.youNeedToAddAtLeastTwoUsers'))
      return
    }

    setLoading(true)
    try {
      const balances = await getBalances(groupId, filledEmails)

      console.log(balances)

      if (balances.length !== entries.length - 1) {
        // TODO: show which user was not found
        throw new TranslatableError('api.notFound.user')
      }

      setResult(balances)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps='handled'
      >
        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ gap: 16, padding: 16, paddingTop: 8 }}
        >
          <Form autofocus onSubmit={submit}>
            <PeoplePicker groupId={groupId} entries={entries} onEntriesChange={setEntries} />
          </Form>
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <Button
          leftIcon='check'
          title={t('roulette.submit')}
          onPress={submit}
          isLoading={loading}
        />
      </View>
    </View>
  )
}

function Result({ result, groupId }: { result: UserWithBalanceChange[]; groupId: number }) {
  const theme = useTheme()
  const router = useRouter()
  const { data: permissions } = useGroupPermissions(groupId)
  const { t } = useTranslation()

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
      <ScrollView style={{ flex: 1 }}>
        <Pane
          containerStyle={{ padding: 16, paddingTop: 4 }}
          icon='listNumbered'
          title={t('roulette.result')}
          textLocation='start'
        >
          {result.map((user, index) => {
            const balanceNum = parseFloat(user.change)
            const balanceColor =
              balanceNum === 0
                ? theme.colors.balanceNeutral
                : balanceNum > 0
                  ? theme.colors.balancePositive
                  : theme.colors.balanceNegative

            return (
              <View
                key={user.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: index === result.length - 1 ? 0 : 1,
                  borderColor: theme.colors.outlineVariant,
                  paddingVertical: 16,
                  gap: 8,
                }}
              >
                <ProfilePicture userId={user.id} size={28} />
                <Text style={{ fontSize: 18, fontWeight: 800, color: theme.colors.onSurface }}>
                  {user.name}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 18, color: balanceColor }}>{user.change}</Text>
              </View>
            )
          })}
        </Pane>
      </ScrollView>

      {permissions?.canCreateSplits() && (
        <Button
          leftIcon='split'
          title={t('roulette.createSplit')}
          onPress={() => {
            beginNewSplit({
              participants: result.map((user) => ({ user: user })),
              paidById: result[0].id,
            })
            router.navigate(`/group/${groupId}/addSplit`)
          }}
        />
      )}
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const { data: permissions } = useGroupPermissions(Number(id))
  const [result, setResult] = useState<UserWithBalanceChange[] | null>(null)

  const canAccessRoulette = permissions?.canAccessRoulette() ?? false

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.roulette')} maxWidth={500}>
      {!user && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {user && (
        <>
          {!canAccessRoulette && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: theme.colors.outline, fontSize: 20, textAlign: 'center' }}>
                {t('api.insufficientPermissions.group.accessRoulette')}
              </Text>
            </View>
          )}
          {canAccessRoulette && result === null && (
            <Roulette groupId={Number(id)} setResult={setResult} user={user} />
          )}
          {canAccessRoulette && result !== null && <Result groupId={Number(id)} result={result} />}
        </>
      )}
    </ModalScreen>
  )
}
