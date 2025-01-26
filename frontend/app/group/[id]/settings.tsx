import { Button } from '@components/Button'
import { EditableText, EditableTextRef } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useCreateGroupJoinLink } from '@hooks/database/useCreateGroupJoinLink'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useDeleteGroupJoinLink } from '@hooks/database/useDeleteGroupJoinLink'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupJoinLink } from '@hooks/database/useGroupJoinLink'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { GroupPermissions } from '@utils/GroupPermissions'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { GroupUserInfo } from 'shared'

function JoinLinkManager({
  info,
  permissions,
}: {
  info: GroupUserInfo
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
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
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

interface DeleteConfirmationModalProps {
  isOpen: boolean
  isDeleting: boolean
  onSubmit: () => void
  onClose: () => void
}

function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  onClose,
  onSubmit,
}: DeleteConfirmationModalProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Modal navigationBarTranslucent statusBarTranslucent transparent visible={isOpen}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 16,
            margin: 16,
            maxWidth: 500,
          }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 22 }}>
            {t('groupSettings.deleteGroupConfirmationText')}
          </Text>

          <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}
          >
            <Button
              title={t('groupSettings.deleteGroupCancel')}
              leftIcon='close'
              onPress={onClose}
            />
            <Button
              title={t('groupSettings.deleteGroupConfirm')}
              leftIcon='check'
              isLoading={isDeleting}
              destructive
              onPress={onSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

function Form({ info }: { info: GroupUserInfo }) {
  const router = useRouter()
  const { t } = useTranslation()
  const snack = useSnack()
  const nameInputRef = React.useRef<EditableTextRef>(null)
  const insets = useModalScreenInsets()
  const [name, setName] = useState(info.name)
  const [isEditingName, setIsEditingName] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 16,
        flexGrow: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 16 }}>
        <Pane
          icon='home'
          title={t('groupSettings.groupName')}
          textLocation='start'
          collapsed={false}
          containerStyle={{ padding: 16 }}
          collapsible={permissions?.canRenameGroup()}
          collapseIcon={isEditingName ? 'close' : 'editAlt'}
          wholeHeaderInteractive={false}
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
      {permissions?.canDeleteGroup() && (
        <>
          <DeleteConfirmationModal
            isOpen={deleteModalVisible}
            isDeleting={isDeletingGroup}
            onClose={() => setDeleteModalVisible(false)}
            onSubmit={() => {
              deleteGroup(info.id).then(() => {
                router.replace(`/home`)
                snack.show(t('groupSettings.deleteGroupSuccess', { name: info.name }))
              })
            }}
          />
          <Button
            destructive
            leftIcon='deleteForever'
            title={t('groupSettings.deleteGroup')}
            isLoading={isDeletingGroup}
            style={{ marginTop: 32 }}
            onPress={() => {
              setDeleteModalVisible(true)
            }}
          />
        </>
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
