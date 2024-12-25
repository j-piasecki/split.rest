import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { getBalances } from '@database/getBalances'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { beginNewSplit } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { TranslatableError, User, UserWithBalanceChange } from 'shared'

interface FormProps {
  groupId: number
  setResult: (result: UserWithBalanceChange[]) => void
}

interface Entry {
  email: string
  user?: User
}

function Form({ groupId, setResult }: FormProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [entries, setEntries] = useState<Entry[]>([{ email: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useTranslatedError()

  function cleanupEntries() {
    setEntries((prev) => {
      const newEntries = prev.filter((entry) => entry.email.trim() !== '')
      if (newEntries.length === 0) {
        newEntries.push({ email: '' })
      }
      if (newEntries[newEntries.length - 1].email !== '') {
        newEntries.push({ email: '' })
      }
      return newEntries
    })
  }

  async function submit() {
    setError(null)

    // there's always an empty entry at the end
    if (entries.length < 3) {
      setError(new TranslatableError('roulette.youNeedToAddAtLeastTwoUsers'))
      return
    }

    setLoading(true)
    try {
      const balances = await getBalances(
        groupId,
        entries.filter((entry) => entry.email.trim() !== '').map((entry) => entry.email)
      )
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
          {entries.map((entry, index) => {
            const deleteVisible = entry.email.trim().length > 0
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  zIndex: entries.length - index,
                }}
              >
                <TextInputUserPicker
                  key={index}
                  groupId={groupId}
                  value={entry.email}
                  user={entry.user}
                  selectTextOnFocus
                  filterSuggestions={(suggestions) =>
                    suggestions.filter(
                      (s) =>
                        s.email === entry.email ||
                        entries.find((e) => e.email === s.email) === undefined
                    )
                  }
                  onChangeText={(val) => {
                    setEntries((prev) => {
                      const newEmails = [...prev]
                      newEmails[index] = { email: val, user: undefined }
                      return newEmails
                    })
                    cleanupEntries()
                  }}
                  onSuggestionSelect={(user) => {
                    setEntries((prev) => {
                      const newEmails = [...prev]
                      newEmails[index] = { email: user.email, user }
                      return newEmails
                    })
                    cleanupEntries()
                  }}
                  onClearSelection={() => {
                    setEntries((prev) => {
                      const newEmails = [...prev]
                      newEmails[index] = { email: entry.email, user: undefined }
                      return newEmails
                    })
                    cleanupEntries()
                  }}
                  containerStyle={{ flex: 1 }}
                />
                <View
                  style={{
                    width: 20,
                    height: 20,
                    marginHorizontal: 4,
                    marginBottom: 4,
                    opacity: deleteVisible ? 1 : 0,
                  }}
                >
                  <RoundIconButton
                    disabled={!deleteVisible}
                    icon='close'
                    size={20}
                    onPress={() => {
                      setEntries((prev) => prev.filter((_, i) => i !== index))
                      cleanupEntries()
                    }}
                    style={{ position: 'absolute' }}
                  />
                </View>
              </View>
            )
          })}
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

      <Button
        leftIcon='split'
        title={t('roulette.createSplit')}
        onPress={() => {
          beginNewSplit({
            participants: result.map((user) => ({ userOrEmail: user })),
            paidByEmail: result[0].email,
          })
          router.navigate(`/group/${groupId}/addSplit`)
        }}
      />
    </View>
  )
}

export default function Roulette() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: permissions } = useGroupPermissions(Number(id))
  const [result, setResult] = useState<UserWithBalanceChange[] | null>(null)

  const canAccessRoulette = permissions?.canAccessRoulette() ?? false

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.roulette')} maxWidth={400}>
      {!canAccessRoulette && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: theme.colors.outline, fontSize: 20, textAlign: 'center' }}>
            {t('api.insufficientPermissions.group.accessRoulette')}
          </Text>
        </View>
      )}
      {canAccessRoulette && result === null && <Form groupId={Number(id)} setResult={setResult} />}
      {canAccessRoulette && result !== null && <Result groupId={Number(id)} result={result} />}
    </ModalScreen>
  )
}
