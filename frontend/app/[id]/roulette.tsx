import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
import { getBalances } from '@database/getBalances'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { UserWithBalanceChange } from 'shared'

interface FormProps {
  groupId: number
  setResult: (result: UserWithBalanceChange[]) => void
}

function Form({ groupId, setResult }: FormProps) {
  const theme = useTheme()
  const [emails, setEmails] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError('You need to add at least 2 users')
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
      // @ts-expect-error wtf
      setError(e?.message)
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
        paddingBottom: 16,
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

      {!loading && <Button title='Submit' onPress={submit} />}
      {loading && <ActivityIndicator color={theme.colors.onSurface} />}
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
    </View>
  )
}

function Result({ result }: { result: UserWithBalanceChange[] }) {
  const theme = useTheme()
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
      <ScrollView style={{ flex: 1 }}>
        {result.map((user) => {
          const balanceNum = parseFloat(user.change)
          const balanceColor =
            balanceNum === 0 ? theme.colors.outline : balanceNum > 0 ? 'green' : 'red'

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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.onSurface }}>
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
  const [result, setResult] = useState<UserWithBalanceChange[] | null>(null)

  return (
    <ModalScreen returnPath={`/${id}`} title='Roulette' maxWidth={400}>
      {result === null && <Form groupId={Number(id)} setResult={setResult} />}
      {result !== null && <Result result={result} />}
    </ModalScreen>
  )
}
