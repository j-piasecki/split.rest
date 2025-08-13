import { Button } from '@components/Button'
import {
  ButtonSecondaryAction,
  ButtonWithSecondaryActions,
} from '@components/ButtonWithSecondaryActions'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { EditableText, EditableTextRef } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PaneButton } from '@components/PaneButton'
import { useSnack } from '@components/SnackBar'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSetGroupLockedMutation } from '@hooks/database/useSetGroupLocked'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useSettleUpGroup } from '@hooks/database/useSettleUpGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { HapticFeedback } from '@utils/hapticFeedback'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitType, isTranslatableError } from 'shared'

function WrapItUpButton({ info }: { info: GroupUserInfo }) {
  const { t } = useTranslation()
  const router = useRouter()
  const snack = useSnack()
  const [settleUpModalVisible, setSettleUpModalVisible] = useState(false)
  const [wrapItUpModalVisible, setWrapItUpModalVisible] = useState(false)
  const { mutateAsync: settleUpGroup } = useSettleUpGroup(info.id)
  const { mutateAsync: setGroupLocked } = useSetGroupLockedMutation(info.id)

  const { splits: delayedSplits } = useGroupSplitsQuery(info.id, {
    splitTypes: [SplitType.Delayed],
  })
  const hasDelayedSplits = delayedSplits.length > 0

  const { members } = useGroupMembers(info.id, true)
  const canSettleUp = members.length > 0 && Number(members[0].balance) !== 0

  const secondaryActions: ButtonSecondaryAction[] = []

  // Add resolve delayed splits action if applicable
  if (info.permissions?.canResolveAllDelayedSplitsAtOnce() && hasDelayedSplits) {
    secondaryActions.push({
      label: t('groupSettings.resolveAllDelayed.resolveAllText'),
      icon: 'chronic',
      onPress: () => {
        router.navigate(`/group/${info.id}/settings/resolveDelayed`)
      },
    })
  }

  // Add settle up action if applicable
  if (info.permissions?.canSettleUpGroup() && canSettleUp) {
    secondaryActions.push({
      label: t('groupSettings.settleUpGroup'),
      icon: 'balance',
      onPress: () => {
        // Delay until the menu modal is closed
        setTimeout(() => {
          setSettleUpModalVisible(true)
        }, 350)
      },
    })
  }

  // Add lock/unlock action if applicable
  if (info.permissions?.canLockGroup()) {
    secondaryActions.push({
      label: info.locked ? t('groupSettings.unlockGroup') : t('groupSettings.lockGroup'),
      icon: info.locked ? 'lockOpen' : 'lock',
      onPress: async () => {
        try {
          await setGroupLocked(!info.locked)
        } catch (e) {
          if (isTranslatableError(e)) {
            snack.show({ message: t(e.message) })
          }
        }
      },
    })
  }

  // Determine if the main "Wrap it up" button should be enabled
  const canWrapUp =
    info.permissions?.canLockGroup() &&
    (info.permissions?.canResolveAllDelayedSplitsAtOnce() || !hasDelayedSplits) &&
    (info.permissions?.canSettleUpGroup() || !canSettleUp)

  return (
    <>
      <ButtonWithSecondaryActions
        title={t('groupSettings.wrapItUp')}
        leftIcon='doneAll'
        disabled={!canWrapUp}
        onPress={() => {
          setWrapItUpModalVisible(true)
        }}
        secondaryActions={secondaryActions}
        animationDirection='above'
      />

      <ConfirmationModal
        visible={wrapItUpModalVisible}
        onClose={() => setWrapItUpModalVisible(false)}
        onConfirm={async () => {
          setWrapItUpModalVisible(false)
          router.navigate(`/group/${info.id}/settings/wrapGroup`)
        }}
        title='groupSettings.wrapItUpConfirmationText'
        message='groupSettings.wrapItUpConfirmationMessage'
        cancelText='groupSettings.wrapItUpCancel'
        cancelIcon='close'
        confirmText='groupSettings.wrapItUpConfirm'
        confirmIcon='check'
      />

      <ConfirmationModal
        visible={settleUpModalVisible}
        onClose={() => setSettleUpModalVisible(false)}
        onConfirm={async () => {
          await settleUpGroup()
            .then(() => {
              snack.show({ message: t('groupSettings.settleUpGroupSuccess') })
              HapticFeedback.confirm()
              if (router.canGoBack()) {
                router.back()
              } else {
                router.replace(`/group/${info.id}`)
              }
            })
            .catch((e) => {
              if (isTranslatableError(e)) {
                alert(t(e.message))
              }
              HapticFeedback.reject()
            })
        }}
        title='groupSettings.settleUpGroupConfirmationText'
        message='groupSettings.settleUpGroupConfirmationMessage'
        cancelText='groupSettings.settleUpGroupCancel'
        cancelIcon='close'
        confirmText='groupSettings.settleUpGroupConfirm'
        confirmIcon='check'
      />
    </>
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

  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)

  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps='handled'
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
          collapsible={info.permissions.canRenameGroup()}
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
            disabled={!info.permissions.canRenameGroup()}
            onSubmit={(newName) => {
              setGroupName(newName).then(() => {
                setName(newName)
              })
            }}
            isPending={isSettingName}
          />
        </Pane>

        {(info.permissions.canSeeJoinLink() || info.permissions.canManageDirectInvites()) && (
          <PaneButton
            icon='addMember'
            title={t('settings.invitations.manageInvitations')}
            onPress={() => {
              router.navigate(`/group/${info.id}/settings/invitations`)
            }}
          />
        )}

        {info.permissions.canManageAllowedSplitMethods() && (
          <PaneButton
            icon='split'
            title={t('group.allowedSplitMethods')}
            onPress={() => {
              router.navigate(`/group/${info.id}/settings/allowedSplitMethods`)
            }}
          />
        )}
      </View>
      <View style={{ marginTop: 32, gap: 16 }}>
        <WrapItUpButton info={info} />
        {info.permissions.canDeleteGroup() && (
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
              onPress={() => {
                setDeleteModalVisible(true)
              }}
            />
          </>
        )}
      </View>
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
      maxHeight={650}
      opaque={false}
    >
      {info && <Form info={info} />}
    </ModalScreen>
  )
}
