import { RoundIconButton } from './RoundIconButton'
import { useSnack } from './SnackBar'
import { Icon, IconName } from '@components/Icon'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useCompleteSplitEntryMutation } from '@hooks/database/useCompleteSplitEntryMutation'
import { useUncompleteSplitEntryMutation } from '@hooks/database/useUncompleteSplitEntryMutation'
import { useUserById } from '@hooks/database/useUserById'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getBalanceColor } from '@utils/getBalanceColor'
import { getSplitDisplayName } from '@utils/getSplitDisplayName'
import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, RefreshControl, ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import {
  CurrencyUtils,
  isBalanceChangeSplit,
  isInversedSplit,
  isSettleUpSplit,
  isTranslatableError,
} from 'shared'
import {
  GroupUserInfo,
  LanguageTranslationKey,
  SplitType,
  SplitWithUsers,
  UserWithPendingBalanceChange,
} from 'shared'

function getVisibleBalanceChange(user: UserWithPendingBalanceChange, splitInfo: SplitWithUsers) {
  const paidByThis = splitInfo.paidById === user.id
  let paidInThisSplit = user.change

  if (isInversedSplit(splitInfo.type)) {
    if (paidByThis) {
      const total = Number(splitInfo.total)
      const remainder = total + Number(paidInThisSplit)

      paidInThisSplit = remainder.toFixed(2)
    }
  } else {
    if (paidByThis) {
      const total = Number(splitInfo.total)
      const remainder = total - Number(paidInThisSplit)

      paidInThisSplit = remainder.toFixed(2)
    } else if (paidInThisSplit.startsWith('-')) {
      paidInThisSplit = paidInThisSplit.substring(1)
    }
  }

  return paidInThisSplit
}

function PaidAmount({
  user,
  splitInfo,
  groupInfo,
}: {
  user: UserWithPendingBalanceChange
  splitInfo: SplitWithUsers
  groupInfo?: GroupUserInfo
}) {
  const theme = useTheme()
  const paidByThis = splitInfo.paidById === user.id
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()

  const isSettleUp = isSettleUpSplit(splitInfo.type)
  const isInverse = isInversedSplit(splitInfo.type)
  const isBalanceChange = isBalanceChangeSplit(splitInfo.type)

  const paidInThisSplit = getVisibleBalanceChange(user, splitInfo)
  const balanceChange = Number(user.change)
  const changeColor = isSettleUp
    ? isInverse
      ? theme.colors.balanceNegative
      : theme.colors.balancePositive
    : isBalanceChange
      ? getBalanceColor(balanceChange, theme)
      : theme.colors.onSurfaceVariant

  return (
    <View
      style={
        isSmallScreen
          ? { flexDirection: 'column', alignItems: 'flex-end' }
          : { flexDirection: 'row', alignItems: 'center', gap: 8 }
      }
    >
      {!paidByThis && isSettleUp && (
        <Text style={{ color: changeColor, fontSize: isSmallScreen ? 14 : 16 }}>
          {isInverse
            ? user.pending
              ? t('splitInfo.willGiveBack')
              : t('splitInfo.gaveBack')
            : user.pending
              ? t('splitInfo.willGetBack')
              : t('splitInfo.gotBack')}
        </Text>
      )}
      <Text style={{ color: changeColor, fontSize: 20 }}>
        {CurrencyUtils.format(paidInThisSplit, groupInfo?.currency)}
      </Text>
    </View>
  )
}

function UserRow({
  user,
  groupInfo,
  splitInfo,
  isNameUnique,
  last = false,
  showCompleteButton = true,
}: {
  user: UserWithPendingBalanceChange
  splitInfo: SplitWithUsers
  groupInfo: GroupUserInfo | undefined
  isNameUnique: boolean
  last?: boolean
  showCompleteButton?: boolean
}) {
  const appUser = useAuth()
  const theme = useTheme()
  const snack = useSnack()
  const { t } = useTranslation()
  const { mutateAsync: completeEntry, isPending: isCompleting } = useCompleteSplitEntryMutation(
    groupInfo?.id,
    splitInfo.id
  )
  const { mutateAsync: uncompleteEntry } = useUncompleteSplitEntryMutation(
    groupInfo?.id,
    splitInfo.id
  )

  const paidByThis = splitInfo.paidById === user.id
  const canCompleteSplit =
    showCompleteButton &&
    user.pending &&
    (appUser?.id === splitInfo.paidById || appUser?.id === user.id)

  return (
    <>
      <View
        style={[
          {
            backgroundColor: theme.colors.surfaceContainer,
            paddingTop: 12,
            paddingBottom: canCompleteSplit ? 4 : 12,
            paddingHorizontal: 16,
            gap: 4,
            borderRadius: 4,
          },
          last && {
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            opacity: user.pending ? 0.85 : 1,
          }}
        >
          <View>
            <ProfilePicture userId={user.id} size={32} />

            {user.pending && showCompleteButton && (
              <View
                style={[
                  {
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    backgroundColor: theme.colors.surfaceContainerHighest,
                    borderRadius: 11,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  styles.paneShadow,
                ]}
              >
                <Icon name='schedule' size={18} color={theme.colors.tertiary} />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: paidByThis ? theme.colors.primary : theme.colors.onSurface,
                fontSize: 20,
                fontWeight: paidByThis ? 700 : 400,
              }}
            >
              {user.displayName ?? user.name}
            </Text>
            {user.displayName && (
              <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{user.name}</Text>
            )}
            {(user.deleted || (!isNameUnique && user.email)) && (
              <Text style={{ color: theme.colors.outline, fontSize: 12 }}>
                {user.deleted ? t('deletedUser') : user.email}
              </Text>
            )}
          </View>
          <PaidAmount user={user} splitInfo={splitInfo} groupInfo={groupInfo} />
        </View>

        {canCompleteSplit && (
          <View style={{ alignItems: 'flex-end' }}>
            <RoundIconButton
              icon='check'
              isLoading={isCompleting}
              text={t('splitInfo.markCompleted')}
              onPress={() => {
                completeEntry(user.id)
                  .then(() => {
                    snack.show({
                      message: t('split.completed'),
                      actionText: t('undo'),
                      action: async () => {
                        await uncompleteEntry(user.id)
                      },
                    })
                  })
                  .catch((error) => {
                    if (isTranslatableError(error)) {
                      alert(t(error.message, error.args))
                    } else {
                      alert(t('unknownError'))
                    }
                  })
              }}
            />
          </View>
        )}
      </View>
      {!last && <View style={{ height: 2, backgroundColor: 'transparent' }} />}
    </>
  )
}

interface EditInfoTextProps {
  icon: IconName
  translationKey: LanguageTranslationKey
  values: Record<string, string>
  userIdPhoto?: string
}

function IconInfoText({ icon, translationKey, values, userIdPhoto }: EditInfoTextProps) {
  const theme = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
      <Icon name={icon} size={20} color={theme.colors.outline} style={{ marginRight: 12 }} />
      {userIdPhoto && <ProfilePicture userId={userIdPhoto} size={20} style={{ marginRight: 8 }} />}
      <Text style={{ color: theme.colors.onSurface, fontSize: 18, flex: 1 }}>
        <Trans
          // typescript broke :(
          i18nKey={translationKey as never}
          values={values}
          components={{ Styled: <Text style={{ color: theme.colors.primary, fontWeight: 600 }} /> }}
        />
      </Text>
    </View>
  )
}

enum EditHistoryItemType {
  First,
  Middle,
  Last,
  Only,
}

function EditHistoryItem({
  split,
  isSelected,
  onSelect,
  onRestore,
  isRestoringVersion,
  type,
}: {
  split: SplitWithUsers
  isSelected: boolean
  onSelect: () => void
  onRestore: () => void
  isRestoringVersion?: boolean
  type: EditHistoryItemType
}) {
  const theme = useTheme()
  const { data: createdBy } = useUserById(split.createdById)
  const { t } = useTranslation()

  const indicatorStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isSelected ? theme.colors.tertiary : theme.colors.outline, {
      duration: 250,
    }),
  }))

  const infoContainerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected ? 1 : 0.65, {
      duration: 250,
    }),
  }))

  return (
    <Pressable
      style={({ pressed, hovered }) => ({
        backgroundColor: hovered
          ? theme.colors.surfaceContainerHigh
          : pressed
            ? theme.colors.surfaceContainerHighest
            : 'transparent',
      })}
      onPress={onSelect}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          gap: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {type !== EditHistoryItemType.Only && (
          <View
            style={{
              width: 16,
              alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 6,
                top: type === EditHistoryItemType.First ? '50%' : 0,
                width: 4,
                height: type === EditHistoryItemType.Middle ? '100%' : '50%',
                backgroundColor: theme.colors.outlineVariant,
              }}
            />
            <Animated.View
              style={[
                indicatorStyle,
                {
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Icon
                name={
                  type === EditHistoryItemType.Last
                    ? 'split'
                    : type === EditHistoryItemType.First
                      ? 'check'
                      : 'editAlt'
                }
                size={10}
                color={isSelected ? theme.colors.onTertiary : theme.colors.outlineVariant}
              />
            </Animated.View>
          </View>
        )}
        <Animated.View
          style={[
            infoContainerStyle,
            {
              flex: 1,
              paddingTop: type === EditHistoryItemType.First ? 0 : 4,
              paddingBottom: type === EditHistoryItemType.Last ? 0 : 4,
            },
          ]}
        >
          <IconInfoText
            icon='calendar'
            translationKey={
              type === EditHistoryItemType.Last || type === EditHistoryItemType.Only
                ? 'splitInfo.createTimeText'
                : 'splitInfo.editTimeText'
            }
            values={{ date: new Date(split.updatedAt).toLocaleString() }}
          />
          {createdBy && (
            <IconInfoText
              icon='edit'
              translationKey='splitInfo.createAuthorText'
              values={{ editor: createdBy.name }}
              userIdPhoto={createdBy.id}
            />
          )}
          {isSelected &&
            type !== EditHistoryItemType.Only &&
            type !== EditHistoryItemType.First && (
              <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
                <RoundIconButton
                  icon='undo'
                  isLoading={isRestoringVersion}
                  text={t('splitInfo.restoreVersion')}
                  onPress={onRestore}
                />
              </View>
            )}
        </Animated.View>
      </View>
    </Pressable>
  )
}

function EditHistory({
  splitHistory,
  hasMoreHistory,
  isLoadingHistory,
  onLoadMoreHistory,
  onRestoreVersion,
  isRestoringVersion,
  selectedVersion,
  setSelectedVersion,
}: {
  splitHistory: SplitWithUsers[]
  hasMoreHistory?: boolean
  isLoadingHistory?: boolean
  onLoadMoreHistory?: () => void
  onRestoreVersion?: (version: number) => Promise<void>
  isRestoringVersion?: boolean
  selectedVersion: number
  setSelectedVersion: (version: number) => void
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Pane
      icon='timeline'
      title={t('splitInfo.editHistory')}
      textLocation='start'
      containerStyle={{ paddingVertical: 16 }}
      style={{ overflow: 'hidden' }}
      collapsible
      startCollapsed
    >
      {splitHistory.map((item, index) => (
        <EditHistoryItem
          key={item.version}
          split={item}
          isSelected={item.version === selectedVersion}
          onSelect={() => setSelectedVersion(item.version)}
          onRestore={() => onRestoreVersion?.(item.version)}
          isRestoringVersion={isRestoringVersion}
          type={
            splitHistory.length === 1
              ? EditHistoryItemType.Only
              : item.version === 1
                ? EditHistoryItemType.Last
                : index === 0
                  ? EditHistoryItemType.First
                  : EditHistoryItemType.Middle
          }
        />
      ))}

      {hasMoreHistory && (
        <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 16 }}>
          <View
            style={{ width: 16, alignSelf: 'stretch', alignItems: 'center', gap: 6, paddingTop: 4 }}
          >
            <View
              style={{
                width: 4,
                height: 4,
                backgroundColor: theme.colors.outlineVariant,
                borderRadius: 2,
              }}
            />
            <View
              style={{
                width: 4,
                height: 4,
                backgroundColor: theme.colors.outlineVariant,
                borderRadius: 2,
              }}
            />
            <View
              style={{
                width: 4,
                height: 4,
                backgroundColor: theme.colors.outlineVariant,
                borderRadius: 2,
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RoundIconButton
              icon='arrowDown'
              isLoading={isLoadingHistory}
              text={t('splitInfo.loadMoreHistory')}
              onPress={() => onLoadMoreHistory?.()}
            />
          </View>
        </View>
      )}
    </Pane>
  )
}

function getNameKey(user: UserWithPendingBalanceChange) {
  if (user.displayName === null) {
    return user.name
  }

  return user.name + user.displayName
}

export function SplitInfo({
  splitHistory,
  groupInfo,
  style,
  showCompleteButton = true,
  isRefreshing = false,
  onRefresh,
  hasMoreHistory = false,
  onLoadMoreHistory,
  isLoadingHistory = false,
  onRestoreVersion,
  isRestoringVersion,
}: {
  splitHistory: SplitWithUsers[]
  groupInfo: GroupUserInfo
  style?: StyleProp<ViewStyle>
  showCompleteButton?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
  hasMoreHistory?: boolean
  isLoadingHistory?: boolean
  onLoadMoreHistory?: () => void
  onRestoreVersion?: (version: number) => Promise<void>
  isRestoringVersion?: boolean
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  const [selectedVersion, setSelectedVersion] = useState(splitHistory[0].version)

  const splitInfo = splitHistory.find((split) => split.version === selectedVersion)
  if (!splitInfo) {
    throw new Error(
      `Split version ${selectedVersion} not found in history for split ${splitHistory[0].id} in group ${groupInfo.id}`
    )
  }

  const latestVersion = splitHistory[0].version
  useEffect(() => {
    setSelectedVersion(latestVersion)
  }, [latestVersion])

  const paidBy = splitInfo.users.find((user) => user.id === splitInfo.paidById)

  const isSettleUp = isSettleUpSplit(splitInfo.type)
  const usersToShow = splitInfo.users.filter((user) => {
    if (isSettleUp && user.id === splitInfo.paidById) {
      return false
    }

    const changeToShow = getVisibleBalanceChange(user, splitInfo)
    return changeToShow !== '0.00'
  })

  const nameCounts = usersToShow.reduce(
    (acc, user) => {
      const key = getNameKey(user)
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={style}
      refreshControl={
        onRefresh && <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ gap: 12 }}>
        <Pane
          icon='receipt'
          title={t('splitInfo.details')}
          textLocation='start'
          containerStyle={{ padding: 16, paddingTop: 12 }}
          style={{ overflow: 'hidden' }}
          collapsible
        >
          <Text style={{ color: theme.colors.onSurface, fontSize: 24, marginBottom: 8 }}>
            {getSplitDisplayName(splitInfo)}
          </Text>

          {/* TODO: Update text for inverse splits? */}
          {paidBy && (
            <IconInfoText
              icon='payments'
              translationKey={
                isSettleUpSplit(splitInfo.type)
                  ? isInversedSplit(splitInfo.type)
                    ? splitInfo.pending
                      ? 'splitInfo.hasSettledUpWillGetBack'
                      : 'splitInfo.hasSettledUpGetsBack'
                    : splitInfo.pending
                      ? 'splitInfo.hasSettledUpWillGiveBack'
                      : 'splitInfo.hasSettledUpGaveBack'
                  : 'splitInfo.hasPaidText'
              }
              values={{
                payer: paidBy.name,
                amount: CurrencyUtils.format(splitInfo.total, groupInfo.currency),
              }}
              userIdPhoto={paidBy.id}
            />
          )}
          <IconInfoText
            icon='calendar'
            translationKey='splitInfo.splitTimeText'
            values={{ date: new Date(splitInfo.timestamp).toLocaleDateString() }}
          />
        </Pane>

        <EditHistory
          splitHistory={splitHistory}
          hasMoreHistory={hasMoreHistory}
          isLoadingHistory={isLoadingHistory}
          onLoadMoreHistory={onLoadMoreHistory}
          onRestoreVersion={onRestoreVersion}
          isRestoringVersion={isRestoringVersion}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
        />

        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ paddingBottom: 8, backgroundColor: 'transparent' }}
          style={{ overflow: 'hidden' }}
          collapsible
        >
          {usersToShow.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              groupInfo={groupInfo}
              splitInfo={splitInfo}
              isNameUnique={nameCounts[getNameKey(user)] === 1}
              last={index === usersToShow.length - 1}
              showCompleteButton={showCompleteButton}
            />
          ))}
        </Pane>
      </View>
    </ScrollView>
  )
}
