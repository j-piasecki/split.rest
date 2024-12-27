import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import Header from '@components/Header'
import { Text } from '@components/Text'
import { useGroupMetadataByLink } from '@hooks/database/useGroupMetadataByLink'
import { useJoinGroupByLink } from '@hooks/database/useJoinGroupByLink'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'

function JoinForm() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { uuid } = useLocalSearchParams()
  const { data: group, isLoading: isLoadingGroup } = useGroupMetadataByLink(uuid as string)
  const { mutateAsync: joinGroup, isPending: isJoiningGroup } = useJoinGroupByLink()
  const [error, setError] = useTranslatedError()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
      {isLoadingGroup && <ActivityIndicator color={theme.colors.primary} />}
      {!isLoadingGroup && group && (
        <>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {t('joinGroup.youveBeenInvitedToJoin')}
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: 24,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {group.name}
          </Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {t('joinGroup.memberCount', { count: group.memberCount })}
            <Text style={{ color: theme.colors.outline }}>
              {t('joinGroup.currency', { currency: group.currency })}
            </Text>
          </Text>
          <View style={{ flexDirection: 'row', paddingTop: 24 }}>
            {isJoiningGroup ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Button
                title={t('joinGroup.join')}
                onPress={() => {
                  joinGroup(uuid as string)
                    .then(() => {
                      router.replace(`/group/${group.id}`)
                    })
                    .catch(setError)
                }}
              />
            )}
          </View>
          {error && <ErrorText>{error}</ErrorText>}
        </>
      )}
      {!isLoadingGroup && !group && (
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 800 }}>
          {t('joinGroup.noGroupFoundForThisJoinLink')}
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
      <Header showBackButton />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {auth === undefined && <ActivityIndicator color={theme.colors.primary} />}
        {auth === null && <Redirect href={`/?join=${uuid}`} withAnchor />}
        {auth && <JoinForm />}
      </View>
    </View>
  )
}
