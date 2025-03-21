import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { EditableText, EditableTextRef } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PaneButton } from '@components/PaneButton'
import { useSnack } from '@components/SnackBar'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GroupUserInfo } from 'shared'

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

        {(permissions?.canSeeJoinLink() || permissions?.canManageDirectInvites()) && (
          <PaneButton
            icon='addMember'
            title={t('settings.invitations.manageInvitations')}
            onPress={() => {
              router.navigate(`/group/${info.id}/settings/invitations`)
            }}
          />
        )}
      </View>
      {permissions?.canDeleteGroup() && (
        <>
          <ConfirmationModal
            visible={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
            onConfirm={async () => {
              await deleteGroup(info.id)
              router.replace(`/home`)
              snack.show({ message: t('groupSettings.deleteGroupSuccess', { name: info.name }) })
            }}
            title='groupSettings.deleteGroupConfirmationText'
            cancelText='groupSettings.deleteGroupCancel'
            cancelIcon='close'
            confirmText='groupSettings.deleteGroupConfirm'
            confirmIcon='check'
            destructive
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
      title={t('screenName.groupSettings.index')}
      maxWidth={500}
      maxHeight={600}
      opaque={false}
    >
      {info && <Form info={info} />}
    </ModalScreen>
  )
}
