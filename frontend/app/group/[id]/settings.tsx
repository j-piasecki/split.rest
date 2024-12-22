import { Button } from '@components/Button'
import { EditableText, EditableTextRef } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { TextInput } from '@components/TextInput'
import { Pane } from '@components/groupScreen/Pane'
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
import { ActivityIndicator, ScrollView, View } from 'react-native'
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
    <Pane
      icon='link'
      title={t('groupSettings.joinLink.joinLink')}
      textLocation='start'
      containerStyle={{ padding: 16 }}
    >
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
            <View style={{ gap: 16 }}>
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
              {permissions.canDeleteJoinLink() && (
                <Button
                  leftIcon='deleteLink'
                  title={t('groupSettings.joinLink.delete')}
                  isLoading={isDeletingJoinLink}
                  onPress={() => deleteJoinLink(info.id)}
                />
              )}
            </View>
          )}
        </>
      )}
    </Pane>
  )
}

function Form({ info }: { info: GroupInfo }) {
  const router = useRouter()
  const { t } = useTranslation()
  const nameInputRef = React.useRef<EditableTextRef>(null)
  const [name, setName] = useState(info.name)
  const [isEditingName, setIsEditingName] = useState(false)
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 16,
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 16 }}>
        <Pane
          icon='link'
          title={t('groupSettings.groupName')}
          textLocation='start'
          containerStyle={{ padding: 16 }}
          collapsible={permissions?.canRenameGroup()}
          collapseIcon={isEditingName ? 'close' : 'editAlt'}
          onCollapseChange={() => {
            if (isEditingName) {
              nameInputRef.current?.cancel()
            } else {
              nameInputRef.current?.edit()
            }
            setIsEditingName(!isEditingName)
          }}
        >
          <EditableText
            ref={nameInputRef}
            value={name}
            iconHidden
            placeholder={t('groupSettings.groupName')}
            disabled={!permissions?.canRenameGroup()}
            onSubmit={(newName) => {
              setGroupName(newName).then(() => {
                setName(newName)
              })
            }}
            isPending={isSettingName}
          />
        </Pane>

        {permissions?.canSeeJoinLink() && <JoinLinkManager info={info} permissions={permissions} />}
      </View>
      {/* TODO: add confirmation dialog */}
      {permissions?.canDeleteGroup() && (
        <Button
          destructive
          leftIcon='deleteForever'
          title={t('groupSettings.deleteGroup')}
          isLoading={isDeletingGroup}
          style={{ marginTop: 32 }}
          onPress={async () => {
            await deleteGroup(info.id)
            router.replace(`/`)
          }}
        />
      )}
    </ScrollView>
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
      maxWidth={500}
      maxHeight={600}
    >
      {info && <Form info={info} />}
    </ModalScreen>
  )
}
