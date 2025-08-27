import { Button } from '@components/Button'
import Modal from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { SplitInfo } from '@components/SplitInfo'
import { Text } from '@components/Text'
import { restoreSplit } from '@database/restoreSplit'
import { useDeleteSplit } from '@hooks/database/useDeleteSplit'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSplitHistory } from '@hooks/database/useSplitHistory'
import { useUpdateSplit } from '@hooks/database/useUpdateSplit'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getSplitDisplayName } from '@utils/getSplitDisplayName'
import { measure } from '@utils/measure'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native'
import {
  DEFAULT_BALANCE_WHEN_NOT_SET,
  DEFAULT_HAS_ACCESS_WHEN_NOT_SET,
  DEFAULT_IS_ADMIN_WHEN_NOT_SET,
  SplitMethod,
  isDelayedSplit,
  isTranslatableError,
} from 'shared'

const DelayedSplitResolutionAllowedSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.Shares,
  SplitMethod.BalanceChanges,
]

export default function SplitInfoScreen() {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const snack = useSnack()
  const { id, splitId } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { mutateAsync: updateSplit, isPending: isRestoring } = useUpdateSplit()
  const { mutateAsync: deleteSplit, isPending: isDeleting } = useDeleteSplit(Number(id))
  const {
    history,
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useSplitHistory(Number(id), Number(splitId))
  const containerRef = useRef<View>(null)
  const scrollableRef = useRef<FlatList | ScrollView | null>(null)
  const [maxWidth, setMaxWidth] = useState(500)
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false)

  const canResolveDelayedSplit = groupInfo?.allowedSplitMethods.some((method) =>
    DelayedSplitResolutionAllowedSplitMethods.includes(method)
  )

  const interactionDisabled = isRestoring || isDeleting

  useLayoutEffect(() => {
    if (containerRef.current) {
      const size = measure(containerRef.current)
      setMaxWidth(size.width)
    }
  }, [isLoadingHistory, groupInfo])

  async function restoreSplitVersion(version: number) {
    const split = history.find((split) => split.version === version)
    if (!split) {
      throw new Error(
        `Split version ${version} not found in history for split ${splitId} in group ${id} when restoring version`
      )
    }

    try {
      if (!groupInfo) {
        throw new Error(`Tried to restore split version while group info hasn't loaded yet`)
      }

      await updateSplit({
        groupId: Number(id),
        splitId: split.id,
        paidBy: split.paidBy?.id,
        title: split.title,
        total: split.total,
        timestamp: split.timestamp,
        balances: split.users.map((user) => ({
          id: user.id,
          change: user.change,
          pending: user.pending,
        })),
        currency: groupInfo.currency,
      })

      if ((scrollableRef.current as FlatList)?.scrollToIndex) {
        ;(scrollableRef.current as FlatList).scrollToIndex({ index: 0, animated: true })
      } else if ((scrollableRef.current as ScrollView)?.scrollTo) {
        ;(scrollableRef.current as ScrollView).scrollTo(0)
      }
    } catch (e) {
      if (isTranslatableError(e)) {
        alert(t(e.message, e.args))
      } else {
        alert(t('unknownError'))
      }
    }
  }

  return (
    <Modal title={t('screenName.splitInfo')} returnPath={`/group/${id}`} maxWidth={600}>
      {(isLoadingHistory || groupInfo === undefined) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
        </View>
      )}

      {!isLoadingHistory && groupInfo === null && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
            {t('splitInfo.splitNotFound')}
          </Text>
        </View>
      )}

      {!isLoadingHistory && groupInfo && (
        <View ref={containerRef} style={{ flex: 1, paddingBottom: insets.bottom }}>
          <View
            style={{
              flex: 1,
              width: maxWidth,
            }}
          >
            <SplitInfo
              splitHistory={history}
              groupInfo={groupInfo}
              style={{
                paddingTop: insets.top + 16,
                paddingBottom: 16,
                paddingLeft: insets.left + 12,
                paddingRight: insets.right + 12,
              }}
              isRefreshing={showRefreshIndicator}
              onRefresh={() => {
                setShowRefreshIndicator(true)
                refetch().then(() => {
                  setShowRefreshIndicator(false)
                })
              }}
              hasMoreHistory={hasNextPage && history[history.length - 1].version !== 1}
              onLoadMoreHistory={fetchNextPage}
              isLoadingHistory={isLoadingHistory || isFetchingNextPage}
              onRestoreVersion={
                groupInfo.permissions.canUpdateSplit(user?.id, history[0])
                  ? restoreSplitVersion
                  : undefined
              }
              isRestoringVersion={isRestoring}
            />
          </View>

          <View style={{ gap: 12 }}>
            {isDelayedSplit(history[0].type) &&
              groupInfo.permissions.canResolveDelayedSplit(user?.id, history[0]) &&
              !groupInfo?.locked &&
              canResolveDelayedSplit && (
                <Button
                  title={t('split.resolveDelayed')}
                  style={{ marginLeft: insets.left + 12, marginRight: insets.right + 12 }}
                  disabled={interactionDisabled}
                  leftIcon='chronic'
                  onPress={() => {
                    SplitCreationContext.create()
                      .resolveDelayedSplit(Number(splitId))
                      .setAllowedSplitMethods(DelayedSplitResolutionAllowedSplitMethods)
                      .setParticipants(
                        history[0].users.map((user) => ({
                          user: {
                            ...user,
                            balance: user?.balance ?? DEFAULT_BALANCE_WHEN_NOT_SET,
                            isAdmin: user?.isAdmin ?? DEFAULT_IS_ADMIN_WHEN_NOT_SET,
                            hasAccess: user?.hasAccess ?? DEFAULT_HAS_ACCESS_WHEN_NOT_SET,
                          },
                          value: user.change,
                        }))
                      )
                      .setPaidById(history[0].paidBy?.id ?? null)
                      .setTitle(history[0].title)
                      .setTotalAmount(history[0].total)
                      .setTimestamp(history[0].timestamp)
                      .begin()
                    router.navigate(`/group/${groupInfo?.id}/addSplit`)
                  }}
                />
              )}

            {groupInfo.permissions.canUpdateSplit(user?.id, history[0]) && !groupInfo.locked && (
              <Button
                title={t('split.edit')}
                style={{ marginLeft: insets.left + 12, marginRight: insets.right + 12 }}
                disabled={interactionDisabled}
                leftIcon='edit'
                onPress={() =>
                  router.navigate(`/group/${groupInfo?.id}/split/${history[0].id}/edit`)
                }
              />
            )}

            {groupInfo.permissions.canDeleteSplit(user?.id, history[0]) && !groupInfo.locked && (
              <Button
                destructive
                title={t('split.delete')}
                style={{ marginLeft: insets.left + 12, marginRight: insets.right + 12 }}
                disabled={interactionDisabled}
                leftIcon='delete'
                isLoading={isDeleting}
                onPress={() =>
                  deleteSplit(Number(splitId))
                    .then(() => {
                      router.dismissTo(`/group/${groupInfo.id}`)
                      snack.show({
                        message: t('split.deletedToast', {
                          title: getSplitDisplayName(history[0]),
                        }),
                        actionText: t('undo'),
                        action: async () => {
                          await restoreSplit(Number(splitId), groupInfo.id)
                        },
                      })
                    })
                    .catch((e) => {
                      if (isTranslatableError(e)) {
                        alert(t(e.message, e.args))
                      } else {
                        alert(t('unknownError'))
                      }
                    })
                }
              />
            )}
          </View>
        </View>
      )}
    </Modal>
  )
}
