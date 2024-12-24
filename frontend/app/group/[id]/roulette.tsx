import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
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

    if (entries.length < 2) {
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 100 }}>
        {entries.map((entry, index) => (
          <TextInputUserPicker
            key={index}
            groupId={groupId}
            value={entry.email}
            user={entry.user}
            selectTextOnFocus
            filterSuggestions={(suggestions) =>
              suggestions.filter(
                (s) =>
                  s.email === entry.email || entries.find((e) => e.email === s.email) === undefined
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
            containerStyle={{ zIndex: entries.length - index }}
          />
        ))}
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
        {result.map((user) => {
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
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderColor: theme.colors.outline,
                paddingVertical: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 800, color: theme.colors.onSurface }}>
                {user.name}
              </Text>
              <Text style={{ fontSize: 18, color: balanceColor }}>{user.change}</Text>
            </View>
          )
        })}
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
