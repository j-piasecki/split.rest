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
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useTheme } from '@styling/theme'
import { GroupPermissions } from '@utils/GroupPermissions'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupInfo } from 'shared'

function JoinLinkManager({
  info,
  permissions,
}: {
  info: GroupInfo
  permissions: GroupPermissions
}) {
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
          {!link && permissions.canCreateJoinLink() && (
            <Button
              leftIcon='addLink'
              isLoading={isCreatingJoinLink}
              title={t('groupSettings.joinLink.create')}
              onPress={() => createJoinLink(info.id)}
            />
          )}
          {link && (
            <View>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontSize: 20,
                  fontWeight: 800,
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
                {permissions.canDeleteJoinLink() && (
                  <Button
                    leftIcon='deleteLink'
                    isLoading={isDeletingJoinLink}
                    onPress={() => deleteJoinLink(info.id)}
                  />
                )}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  )
}

function Form({ info }: { info: GroupInfo }) {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const [name, setName] = useState(info.name)
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 16 }}>
        <EditableText
          value={name}
          placeholder={t('groupSettings.groupName')}
          disabled={!permissions?.canRenameGroup()}
          onSubmit={(newName) => {
            setGroupName(newName).then(() => {
              setName(newName)
            })
          }}
          isPending={isSettingName}
        />

        {permissions?.canSeeJoinLink() && (
          <>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.outlineVariant,
                marginHorizontal: 16,
              }}
            />
            <JoinLinkManager info={info} permissions={permissions} />
          </>
        )}
      </View>
      {/* TODO: add confirmation dialog */}
      {permissions?.canDeleteGroup() && (
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
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings')}
      maxWidth={400}
      maxHeight={500}
    >
      {info && <Form info={info} />}
    </ModalScreen>
  )
}
