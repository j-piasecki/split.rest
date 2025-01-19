import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { SplitInfo } from '@components/SplitInfo'
import { useCreateSplit } from '@hooks/database/useCreateSplit'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, SplitWithUsers } from 'shared'

function Content({ groupInfo, split }: { groupInfo: GroupUserInfo; split: SplitWithUsers }) {
  const { t } = useTranslation()
  const router = useRouter()
  const snack = useSnack()
  const [error, setError] = useTranslatedError()
  const { data: permissions } = useGroupPermissions(groupInfo.id)
  const { mutateAsync: createSplit, isPending } = useCreateSplit()

  function save() {
    createSplit({
      groupId: groupInfo.id,
      paidBy: split.paidById,
      title: split.title,
      total: split.total,
      timestamp: split.timestamp,
      balances: split.users.map((user) => ({
        id: user.id,
        change: user.change,
      })),
    })
      .then(() => {
        snack.show(t('split.created'))
        router.dismissTo(`/group/${groupInfo.id}`)
      })
      .catch(setError)
  }

  return (
    <View style={{ flex: 1 }}>
      <SplitInfo groupInfo={groupInfo} splitInfo={split} />

      <View style={{ gap: 16, paddingHorizontal: 16 }}>
        {error && <ErrorText>{error}</ErrorText>}
        {permissions?.canCreateSplits() && (
          <>
            {/* I don't think it makes sense to show edit button on splits by exact amounts, that's essentially the same form shown twice */}
            {getSplitCreationContext().splitType !== SplitMethod.ExactAmounts && (
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
        {!permissions?.canCreateSplits() && (
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
  const { data: groupInfo } = useGroupInfo(Number(id))
  const [error, setError] = useTranslatedError()
  const [split, setSplit] = useState<SplitWithUsers | null>(null)

  useFocusEffect(() => {
    try {
      setSplit(getSplitCreationContext().buildSplitPreview())
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
    >
      {error && (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
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
