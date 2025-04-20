import { Button } from '@components/Button'
import Modal from '@components/ModalScreen'
import { SplitInfo } from '@components/SplitInfo'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSplitHistory } from '@hooks/database/useSplitHistory'
import { useUpdateSplit } from '@hooks/database/useUpdateSplit'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Platform, ScrollView, View } from 'react-native'
import { SplitWithUsers } from 'shared'

// TODO: this file is a joke

export default function SplitInfoScreen() {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { id, splitId } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(groupInfo?.id)
  const { mutateAsync: updateSplit, isPending: isRestoring } = useUpdateSplit()
  const {
    history,
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useSplitHistory(Number(id), Number(splitId))
  const containerRef = useRef<View>(null)
  const scrollableRef = useRef<FlatList | ScrollView | null>(null)
  const [maxWidth, setMaxWidth] = useState(500)

  const userScrollRef = useRef(false)
  const scrollContentWidth = useRef(0)

  useLayoutEffect(() => {
    if (containerRef.current) {
      const size = measure(containerRef.current)
      setMaxWidth(size.width)
    }
  }, [isLoadingHistory, groupInfo])

  async function restoreSplitVersion(split: SplitWithUsers) {
    try {
      await updateSplit({
        groupId: Number(id),
        splitId: split.id,
        paidBy: split.paidById,
        title: split.title,
        total: Number(split.total),
        timestamp: split.timestamp,
        balances: split.users.map((user) => ({
          id: user.id,
          change: user.change,
          pending: user.pending,
        })),
      })

      if ((scrollableRef.current as FlatList)?.scrollToIndex) {
        ;(scrollableRef.current as FlatList).scrollToIndex({ index: 0, animated: true })
      } else if ((scrollableRef.current as ScrollView)?.scrollTo) {
        ;(scrollableRef.current as ScrollView).scrollTo(0)
      }
    } catch {
      alert(t('unknownError'))
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
          {/* Paginated horizontal flatlist breaks vertical scroll on web */}
          {Platform.OS !== 'web' && (
            <FlatList
              // inverted flatlist breaks pagination on web, so we use scaleX to flip it
              // this reverses scroll direction on web but I guess it's better than not working at all
              horizontal
              style={{ transform: [{ scaleX: -1 }] }}
              data={history}
              keyExtractor={(item) => `${item.version}`}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!isFetchingNextPage && hasNextPage) {
                  fetchNextPage()
                }
              }}
              scrollEnabled={history.length > 1}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: maxWidth,
                    transform: [{ scaleX: -1 }],
                    paddingLeft: insets.left + 12,
                    paddingRight: insets.right + 12,
                  }}
                >
                  <SplitInfo
                    splitInfo={item}
                    groupInfo={groupInfo}
                    style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
                    isRefreshing={isRefetching}
                    onRefresh={refetch}
                  />
                  {index !== 0 && permissions?.canUpdateSplit(history[0]) && (
                    <Button
                      title={t('splitInfo.restoreVersion')}
                      style={{ marginBottom: 16 }}
                      leftIcon='undo'
                      onPress={() => restoreSplitVersion(item)}
                      isLoading={isRestoring}
                    />
                  )}
                </View>
              )}
              scrollEventThrottle={250}
              onScroll={() => {
                userScrollRef.current = true
              }}
              ref={(ref) => {
                scrollableRef.current = ref
                if (history.length > 0) {
                  // TODO: this is kinda scuffed (and doesn't work on web), should probably figure out something better
                  setTimeout(() => {
                    if (!userScrollRef.current) {
                      ref?.scrollToOffset({ offset: 30, animated: true })

                      setTimeout(() => {
                        ref?.scrollToIndex({ index: 0, animated: true })
                      }, 200)
                    }
                  }, 1000)
                }
              }}
            />
          )}

          {Platform.OS === 'web' && (
            <ScrollView
              horizontal
              style={{ transform: [{ scaleX: -1 }] }}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onContentSizeChange={(width) => {
                scrollContentWidth.current = width
              }}
              scrollEventThrottle={250}
              scrollEnabled={history.length > 1}
              onScroll={(e) => {
                userScrollRef.current = true

                if (
                  e.nativeEvent.contentOffset.x / scrollContentWidth.current > 0.5 &&
                  !isFetchingNextPage &&
                  hasNextPage
                ) {
                  fetchNextPage()
                }
              }}
              ref={(ref) => {
                scrollableRef.current = ref
                if (history.length > 0) {
                  // TODO: this is kinda scuffed (and doesn't work on web), should probably figure out something better
                  setTimeout(() => {
                    if (!userScrollRef.current) {
                      ref?.scrollTo({ x: 30, animated: true })

                      setTimeout(() => {
                        ref?.scrollTo({ x: 0, animated: true })
                      }, 200)
                    }
                  }, 1000)
                }
              }}
            >
              {history.map((split, index) => (
                <View
                  key={`${split.version}`}
                  style={{
                    flex: 1,
                    width: maxWidth,
                    transform: [{ scaleX: -1 }],
                    paddingLeft: insets.left + 12,
                    paddingRight: insets.right + 12,
                  }}
                >
                  <SplitInfo
                    splitInfo={split}
                    groupInfo={groupInfo}
                    style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
                    isRefreshing={isRefetching}
                    onRefresh={refetch}
                  />

                  {index !== 0 && permissions?.canUpdateSplit(history[0]) && (
                    <Button
                      title={t('splitInfo.restoreVersion')}
                      style={{ marginBottom: 16 }}
                      leftIcon='undo'
                      onPress={() => restoreSplitVersion(split)}
                      isLoading={isRestoring}
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {permissions?.canUpdateSplit(history[0]) && (
            <Button
              title={t('split.edit')}
              style={{ marginHorizontal: 16 }}
              disabled={isRestoring}
              leftIcon='edit'
              onPress={() => router.navigate(`/group/${groupInfo?.id}/split/${history[0].id}/edit`)}
            />
          )}
        </View>
      )}
    </Modal>
  )
}
