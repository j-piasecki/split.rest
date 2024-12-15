import { Button } from '@components/Button'
import { EditableText } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useCreateGroupJoinLink } from '@hooks/database/useCreateGroupJoinLink'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useDeleteGroupJoinLink } from '@hooks/database/useDeleteGroupJoinLink'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupJoinLink } from '@hooks/database/useGroupJoinLink'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupInfo } from 'shared'

function JoinLinkManager({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: link, isLoading: isLoadingLink } = useGroupJoinLink(info.id)
  const { mutateAsync: createJoinLink, isPending: isCreatingJoinLink } = useCreateGroupJoinLink()
  const { mutateAsync: deleteJoinLink, isPending: isDeletingJoinLink } = useDeleteGroupJoinLink()

  const linkText = __DEV__
    ? `http://localhost:8081/join/${link?.uuid}`
    : `https://split.rest/join/${link?.uuid}`

  return (
    <View>
      {isLoadingLink && <ActivityIndicator color={theme.colors.primary} />}
      {!isLoadingLink && (
        <>
          {!link && (
            <Button
              isLoading={isCreatingJoinLink}
              title={t('groupSettings.joinLink.create')}
              onPress={() => createJoinLink(info.id)}
            />
          )}
          {link && (
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {t('groupSettings.joinLink.joinLink')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={linkText}
                  editable={false}
                  style={{ flex: 1 }}
                  selectTextOnFocus
                />
                <Button
                  leftIcon='copy'
                  onPress={() => {
                    Clipboard.setStringAsync(linkText)
                  }}
                />
              </View>
              <Button
                leftIcon='delete'
                isLoading={isDeletingJoinLink}
                title={t('groupSettings.joinLink.delete')}
                onPress={() => deleteJoinLink(info.id)}
              />
            </View>
          )}
        </>
      )}
    </View>
  )
}

function Form({ info }: { info: GroupInfo }) {
  const user = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState(info.name)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        paddingBottom: 32,
      }}
    >
      <EditableText
        value={name}
        placeholder={t('groupSettings.groupName')}
        onSubmit={(newName) => {
          setGroupName(newName).then(() => {
            setName(newName)
          })
        }}
        isPending={isSettingName}
      />
      {!isDeletingGroup && (
        <>
          <JoinLinkManager info={info} />
        </>
      )}
      {/* TODO: add confirmation dialog */}
      {info.owner === user?.id && (
        <Button
          destructive
          leftIcon='deleteForever'
          title={t('groupSettings.deleteGroup')}
          isLoading={isDeletingGroup}
          onPress={async () => {
            await deleteGroup(info.id)
            router.replace(`/`)
          }}
        />
      )}
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const user = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))

  const isAdmin = info?.isAdmin || info?.owner === user?.id

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings')}
      maxWidth={400}
      maxHeight={500}
    >
      {isAdmin && info && <Form info={info} />}
      {!isAdmin && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {(!user || !info) && <ActivityIndicator color={theme.colors.primary} />}
          {user && info && (
            <Text style={{ color: theme.colors.error }}>{t('groupSettings.notAnAdmin')}</Text>
          )}
        </View>
      )}
    </ModalScreen>
  )
}
