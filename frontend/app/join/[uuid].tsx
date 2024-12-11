import React from 'react'
import { Button } from '@components/Button'
import Header from '@components/Header'
import { useGroupMetadataByLink } from '@hooks/database/useGroupMetadataByLink'
import { useJoinGroupByLink } from '@hooks/database/useJoinGroupByLink'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

function JoinForm() {
  const theme = useTheme()
  const router = useRouter()
  const { uuid } = useLocalSearchParams()
  const { data: group, isLoading: isLoadingGroup } = useGroupMetadataByLink(uuid as string)
  const { mutateAsync: joinGroup, isPending: isJoiningGroup } = useJoinGroupByLink()
  const [error, setError] = useState<Error | null>(null)

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
      {isLoadingGroup && <ActivityIndicator color={theme.colors.primary} />}
      {!isLoadingGroup && group && (
        <>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            You've been invited to join
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {group.name}
          </Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {group.memberCount} members{' '}
            <Text style={{ color: theme.colors.outline }}>({group.currency})</Text>
          </Text>
          <View style={{ flexDirection: 'row', paddingTop: 24 }}>
            {isJoiningGroup ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Button
                title='Join'
                onPress={() => {
                  joinGroup(uuid as string)
                    .then(() => {
                      router.replace(`/group/${group.id}`)
                    })
                    .catch((error) => {
                      setError(error)
                    })
                }}
              />
            )}
          </View>
          {error && (
            <Text style={{ color: theme.colors.error, fontSize: 16, textAlign: 'center' }}>
              {error.message}
            </Text>
          )}
        </>
      )}
      {!isLoadingGroup && !group && (
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 'bold' }}>
          No group found for this join link
        </Text>
      )}
    </View>
  )
}

export default function JoinPage() {
  const auth = useAuth(false)
  const theme = useTheme()
  const { uuid } = useLocalSearchParams()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      {auth && <Header />}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {auth === undefined && <ActivityIndicator color={theme.colors.primary} />}
        {auth === null && <Redirect href={`/?join=${uuid}`} withAnchor />}
        {auth && <JoinForm />}
      </View>
    </View>
  )
}
