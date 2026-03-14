import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSetGroupLockedMutation } from '@hooks/database/useSetGroupLocked'
import { useSettleUpGroup } from '@hooks/database/useSettleUpGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { HapticFeedback } from '@utils/hapticFeedback'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitType, isTranslatableError } from 'shared'

function WrapItUpButton({ info }: { info: GroupUserInfo }) {
  const theme = useTheme()
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

  const { members } = useGroupMembers(info.id, true) // sorted low to high
  const canSettleUp = members.length > 0 && Number(members[0].balance) !== 0

  return (
    <View style={{ gap: 16 }}>
      {info.permissions?.canResolveAllDelayedSplitsAtOnce() && hasDelayedSplits && (
        <Button
          title={t('groupSettings.resolveAllDelayed.resolveAllText')}
          leftIcon='chronic'
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          foregroundColor={theme.colors.onSecondaryContainer}
          onPress={() => {
            router.navigate(`/group/${info.id}/settings/resolveDelayed`)
          }}
        />
      )}

      {info.permissions?.canSettleUpGroup() && canSettleUp && (
        <Button
          title={t('groupSettings.settleUpGroup')}
          leftIcon='balance'
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          foregroundColor={theme.colors.onSecondaryContainer}
          onPress={() => {
            setSettleUpModalVisible(true)
          }}
        />
      )}

      {info.permissions?.canLockGroup() && (
        <Button
          title={info.locked ? t('groupSettings.unlockGroup') : t('groupSettings.lockGroup')}
          leftIcon={info.locked ? 'lockOpen' : 'lock'}
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          foregroundColor={theme.colors.onSecondaryContainer}
          onPress={async () => {
            try {
              await setGroupLocked(!info.locked)
            } catch (e) {
              if (isTranslatableError(e)) {
                snack.show({ message: t(e.message) })
              }
            }
          }}
        />
      )}

      {(() => {
        const canWrapUp =
          info.permissions?.canLockGroup() &&
          (info.permissions?.canResolveAllDelayedSplitsAtOnce() || !hasDelayedSplits) &&
          (info.permissions?.canSettleUpGroup() || !canSettleUp)

        return (
          <View
            style={{
              borderColor: theme.colors.primary,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              gap: 16,
            }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 500 }}>
              {t('groupSettings.wrapItUpExplanation')}
            </Text>
            <Button
              title={t('groupSettings.wrapItUp')}
              leftIcon='doneAll'
              disabled={!canWrapUp}
              onPress={() => {
                setWrapItUpModalVisible(true)
              }}
            />
          </View>
        )
      })()}

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
    </View>
  )
}

function Content({ info }: { info: GroupUserInfo }) {
  const theme = useTheme()
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
        gap: 24,
        flexGrow: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {info.permissions.canDeleteGroup() && (
        <View
          style={{
            borderColor: theme.colors.error,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            gap: 16,
          }}
        >
          <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: 500 }}>
            {t('groupSettings.deleteGroupExplanation')}
          </Text>
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
        </View>
      )}

      <View style={{ flex: 1 }} />

      <WrapItUpButton info={info} />
    </ScrollView>
  )
}

export default function Management() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}/settings`}
      title={t('screenName.groupSettings.management')}
    >
      {info && <Content info={info} />}
    </ModalScreen>
  )
}
