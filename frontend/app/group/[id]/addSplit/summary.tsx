import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { SplitInfo } from '@components/SplitInfo'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { HapticFeedback } from '@utils/hapticFeedback'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, SplitMethod, SplitWithUsers } from 'shared'

function Content({ groupInfo, split }: { groupInfo: GroupUserInfo; split: SplitWithUsers }) {
  const router = useRouter()
  const snack = useSnack()
  const insets = useModalScreenInsets()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useTranslatedError()
  const { t } = useTranslation()

  async function save() {
    setIsPending(true)
    try {
      await SplitCreationContext.current.saveSplit({
        groupId: groupInfo.id,
        paidBy: split.paidById,
        title: split.title,
        total: split.total,
        timestamp: split.timestamp,
        balances: split.users.map((user) => ({
          id: user.id,
          change: user.change,
          pending: false,
        })),
        type: split.type,
        currency: groupInfo.currency,
      })

      HapticFeedback.confirm()
      snack.show({ message: t('split.created') })
      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
      HapticFeedback.reject()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
      }}
    >
      <SplitInfo
        groupInfo={groupInfo}
        splitHistory={[split]}
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        showNoAccessWarning
      />

      <View style={{ gap: 16 }}>
        {error && <ErrorText>{error}</ErrorText>}
        {groupInfo.permissions.canCreateSplits() && (
          <>
            {/* Show the edit button only for equal splits not to show the same form twice */}
            {(SplitCreationContext.current.splitMethod === SplitMethod.Equal ||
              SplitCreationContext.current.splitMethod === SplitMethod.Shares) && (
              <Button
                leftIcon='edit'
                title={t('form.edit')}
                disabled={isPending}
                onPress={() => {
                  router.navigate(`/group/${groupInfo.id}/addSplit/edit`)
                }}
              />
            )}
            <Button leftIcon='save' title={t('form.save')} isLoading={isPending} onPress={save} />
          </>
        )}
        {!groupInfo.permissions.canCreateSplits() && (
          <ErrorText translationKey='api.insufficientPermissions.group.createSplit' />
        )}
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const [error, setError] = useTranslatedError()
  const [split, setSplit] = useState<SplitWithUsers | null>(null)

  useFocusEffect(() => {
    try {
      setSplit(SplitCreationContext.current.buildSplitPreview())
    } catch (e) {
      setError(e)
    }
  })

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitSummary')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
    >
      {error && (
        <View
          style={{
            flex: 1,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErrorText>{error}</ErrorText>
          </View>
          <Button
            leftIcon='chevronBack'
            title={t('form.back')}
            onPress={() => {
              if (router.canGoBack()) {
                router.back()
              } else {
                router.replace(`/group/${id}`)
              }
            }}
          />
        </View>
      )}
      {!groupInfo && !error && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {!error && groupInfo && split && <Content groupInfo={groupInfo} split={split} />}
    </ModalScreen>
  )
}
