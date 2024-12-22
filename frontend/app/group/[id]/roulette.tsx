import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
import { getBalances } from '@database/getBalances'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { TranslatableError, UserWithBalanceChange } from 'shared'

interface FormProps {
  groupId: number
  setResult: (result: UserWithBalanceChange[]) => void
}

function Form({ groupId, setResult }: FormProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [emails, setEmails] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useTranslatedError()

  function cleanupEmails() {
    setEmails((prev) => {
      const newEmails = prev.filter((email) => email.trim() !== '')
      if (newEmails.length === 0) {
        newEmails.push('')
      }
      if (newEmails[newEmails.length - 1] !== '') {
        newEmails.push('')
      }
      return newEmails
    })
  }

  async function submit() {
    setError(null)

    if (emails.length < 2) {
      setError(new TranslatableError('roulette.youNeedToAddAtLeastTwoUsers'))
      return
    }

    setLoading(true)
    try {
      const balances = await getBalances(
        groupId,
        emails.filter((email) => email.trim() !== '')
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
        {emails.map((email, index) => (
          <TextInputWithUserSuggestions
            key={index}
            groupId={groupId}
            value={email}
            onChangeText={(val) => {
              setEmails((prev) => {
                const newEmails = [...prev]
                newEmails[index] = val
                return newEmails
              })
              cleanupEmails()
            }}
            onSuggestionSelect={(user) => {
              setEmails((prev) => {
                const newEmails = [...prev]
                newEmails[index] = user.email
                return newEmails
              })
              cleanupEmails()
            }}
            style={{ zIndex: emails.length - index }}
          />
        ))}
      </ScrollView>

      {!loading && <Button leftIcon='check' title={t('roulette.submit')} onPress={submit} />}
      {loading && <ActivityIndicator color={theme.colors.onSurface} />}
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
    </View>
  )
}

function Result({ result }: { result: UserWithBalanceChange[] }) {
  const theme = useTheme()
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
      {canAccessRoulette && result !== null && <Result result={result} />}
    </ModalScreen>
  )
}
