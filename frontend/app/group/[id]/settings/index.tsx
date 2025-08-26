import { Button } from '@components/Button'
import {
  ButtonSecondaryAction,
  ButtonWithSecondaryActions,
} from '@components/ButtonWithSecondaryActions'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { GroupIcon } from '@components/GroupIcon'
import { Icon } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { PaneButton } from '@components/PaneButton'
import { RoundIconButton } from '@components/RoundIconButton'
import { useSnack } from '@components/SnackBar'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSetGroupLockedMutation } from '@hooks/database/useSetGroupLocked'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useSettleUpGroup } from '@hooks/database/useSettleUpGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import ImageEditor from '@react-native-community/image-editor'
import { useTheme } from '@styling/theme'
import { HapticFeedback } from '@utils/hapticFeedback'
import { ApiError, makeRequest, makeRequestWithFile } from '@utils/makeApiRequest'
import { invalidateGroupInfo } from '@utils/queryClient'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native'
import {
  GroupUserInfo,
  SetGroupIconArguments,
  SplitType,
  TranslatableError,
  isTranslatableError,
} from 'shared'

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
              HapticFeedback.reject()
              throw e
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

function GroupNameInput({ info }: { info: GroupUserInfo }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [name, setName] = useState(info.name)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)

  const canEditName = info.permissions.canRenameGroup()

  function saveName() {
    if (name === null || name === info.name) {
      return
    }

    if (name.length === 0) {
      alert(t('groupValidation.nameCannotBeEmpty'))
      return
    }

    if (name.length > 128) {
      alert(t('groupValidation.nameIsTooLong'))
      return
    }

    setGroupName(name)
  }

  return (
    <View>
      <LargeTextInput
        icon='title'
        placeholder={t('groupSettings.groupName')}
        value={name}
        onChangeText={setName}
        disabled={!canEditName}
        containerStyle={{ flex: 1, paddingRight: 56 }}
        onSubmit={saveName}
      />

      <View
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {canEditName && name !== null && name !== (info.name ?? '') && (
          <RoundIconButton
            opaque
            color={theme.colors.secondary}
            icon='saveAlt'
            onPress={saveName}
            size={32}
            isLoading={isSettingName}
          />
        )}
      </View>
    </View>
  )
}

function GroupIconInput({ info }: { info: GroupUserInfo }) {
  const theme = useTheme()
  const snack = useSnack()
  const { t } = useTranslation()
  const [isChangingIcon, setIsChangingIcon] = useState(false)

  async function changeGroupIcon() {
    try {
      setIsChangingIcon(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (result.canceled) {
        return
      }

      if (result.assets.length === 0 || !result.assets[0].uri) {
        throw new TranslatableError('settings.groupIcon.noImageSelected')
      }

      const width = result.assets[0].width
      const height = result.assets[0].height
      const size = Math.min(width, height)

      const image = await ImageEditor.cropImage(result.assets[0].uri, {
        offset: { x: (width - size) / 2, y: (height - size) / 2 },
        size: { width: size, height: size },
        displaySize: { width: 128, height: 128 },
      })

      if (Platform.OS === 'web') {
        await makeRequest<SetGroupIconArguments, void>('POST', 'setGroupIcon', {
          groupId: info.id,
          file: {
            type: image.type,
            uri: image.uri,
          },
        })
      } else {
        await makeRequestWithFile<SetGroupIconArguments, void>('POST', 'setGroupIcon', {
          groupId: info.id,
          file: {
            name: image.name,
            type: image.type,
            uri: image.uri,
          },
        })
      }

      await invalidateGroupInfo(info.id)

      snack.show({ message: t('settings.groupIcon.groupIconChanged') })
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.statusCode === 429) {
          alert(t('settings.groupIcon.tooManyRequests'))
          return
        }

        alert(t(e.message, e.args))
      } else if (isTranslatableError(e)) {
        alert(t(e.message, e.args))
      } else {
        alert(t('api.auth.tryAgain'))
      }
    } finally {
      setIsChangingIcon(false)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable
        style={{
          width: 128,
          height: 128,
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 32,
        }}
        disabled={!info.permissions.canManageGroupIcon()}
        onPress={changeGroupIcon}
      >
        <GroupIcon info={info} size={128} />
        {info.permissions.canManageGroupIcon() && (
          <View
            style={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              backgroundColor: theme.colors.surfaceContainerHighest,
              borderRadius: 24,
              padding: 4,
            }}
          >
            {isChangingIcon ? (
              <ActivityIndicator size='small' color={theme.colors.tertiary} />
            ) : (
              <Icon name='upload' size={24} color={theme.colors.tertiary} />
            )}
          </View>
        )}
      </Pressable>
    </View>
  )
}

function Form({ info }: { info: GroupUserInfo }) {
  const router = useRouter()
  const { t } = useTranslation()
  const snack = useSnack()
  const insets = useModalScreenInsets()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
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
        <GroupIconInput info={info} />
        <GroupNameInput info={info} />

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
