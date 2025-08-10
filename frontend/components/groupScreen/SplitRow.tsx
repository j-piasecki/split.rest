import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { Icon } from '@components/Icon'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { restoreSplit } from '@database/restoreSplit'
import { useDeleteSplit } from '@hooks/database/useDeleteSplit'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { getBalanceColor } from '@utils/getBalanceColor'
import { getSplitDisplayName } from '@utils/getSplitDisplayName'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import {
  CurrencyUtils,
  isBalanceChangeSplit,
  isDelayedSplit,
  isLendSplit,
  isSettleUpSplit,
  isTranslatableError,
} from 'shared'
import { GroupUserInfo, SplitInfo } from 'shared'

function LinearInfo({ split, info }: { split: SplitInfo; info: GroupUserInfo }) {
  const theme = useTheme()

  return (
    <>
      <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 18, fontWeight: 600, color: theme.colors.onSurface }}>
          {CurrencyUtils.format(split.total, info?.currency)}
        </Text>

        {split.userChange && Number(split.userChange) !== 0 && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: getBalanceColor(Number(split.userChange), theme),
            }}
          >
            {CurrencyUtils.format(split.userChange, info?.currency, true, true)}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'center', overflow: 'hidden', paddingLeft: 48, paddingRight: 32 }}>
        <Text style={{ fontSize: 20, color: theme.colors.outline }}>
          {new Date(split.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </>
  )
}

function StackedInfo({ split, info }: { split: SplitInfo; info: GroupUserInfo }) {
  const theme = useTheme()

  return (
    <View style={{ paddingLeft: 8, paddingRight: 4, alignItems: 'flex-end' }}>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 18, fontWeight: 600, color: theme.colors.onSurface }}>
          {CurrencyUtils.format(split.total, info?.currency)}
        </Text>
        {split.userChange && Number(split.userChange) !== 0 && (
          <Text
            style={{
              fontWeight: 400,
              fontSize: 12,
              color: getBalanceColor(Number(split.userChange ?? '0'), theme),
            }}
          >
            {CurrencyUtils.format(split.userChange ?? '0', info?.currency, true, true)}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 14, color: theme.colors.outline }}>
          {new Date(split.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )
}

export interface LoadedSplitRowProps {
  split: SplitInfo
  info: GroupUserInfo
  style?: StyleProp<ViewStyle>
}

function LoadedSplitRow({ split, info, style }: LoadedSplitRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const snack = useSnack()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()
  const threeBarLayout = useThreeBarLayout()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const [width, setWidth] = useState(-1)
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutateAsync: deleteSplit, isPending } = useDeleteSplit(info.id)

  const isSettleUp = isSettleUpSplit(split.type)
  const isBalanceChange = isBalanceChangeSplit(split.type)
  const isLend = isLendSplit(split.type)
  const isDelayed = isDelayedSplit(split.type)
  const shouldUseStackedInfo = displayClass === DisplayClass.Small || (width < 660 && width > 0)

  const showBadge = isSettleUp || isLend || isDelayed

  const contextMenuDisabled =
    !permissions?.canSeeSplitDetails?.(user?.id, split) &&
    !permissions?.canUpdateSplit?.(user?.id, split) &&
    !permissions?.canDeleteSplit?.(user?.id, split)

  return (
    <ContextMenu
      key={split.id}
      ref={contextMenuRef}
      disabled={contextMenuDisabled}
      style={({ pressed, hovered }) => {
        return [
          style,
          {
            userSelect: 'none',
            backgroundColor:
              pressed && permissions?.canSeeSplitDetails?.(user?.id, split)
                ? theme.colors.surfaceContainerHighest
                : hovered
                  ? theme.colors.surfaceContainerHigh
                  : theme.colors.surfaceContainer,
          },
        ]
      }}
      onPress={() => {
        if (permissions?.canSeeSplitDetails?.(user?.id, split)) {
          router.navigate(`/group/${info?.id}/split/${split.id}`)
        }
      }}
      items={[
        {
          label: t('split.showDetails'),
          icon: 'visibility',
          disabled: !permissions?.canSeeSplitDetails?.(user?.id, split),
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}`)
          },
        },
        {
          label: t('split.edit'),
          icon: 'edit',
          disabled: !permissions?.canUpdateSplit?.(user?.id, split) || info.locked,
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}/edit`)
          },
        },
        {
          label: t('split.delete'),
          icon: 'delete',
          disabled: !permissions?.canDeleteSplit?.(user?.id, split) || info.locked,
          destructive: true,
          onPress: () => {
            deleteSplit(split.id)
              .then(() => {
                snack.show({
                  message: t('split.deletedToast', { title: getSplitDisplayName(split) }),
                  actionText: t('undo'),
                  action: async () => {
                    await restoreSplit(split.id, info.id)
                  },
                })
              })
              .catch((error) => {
                if (isTranslatableError(error)) {
                  snack.show({
                    message: t(error.message),
                  })
                }
              })
          },
        },
      ]}
    >
      <View
        onLayout={(e) => {
          if (displayClass !== DisplayClass.Small) {
            // Don't update the width if on a small screen, it wouldn't have any effect and we skip a render
            setWidth(e.nativeEvent.layout.width)
          }
        }}
        style={[
          {
            paddingVertical: 8,
            paddingLeft: (shouldUseStackedInfo ? 12 : 16) + (threeBarLayout ? 12 : 0),
            paddingRight: 4 + (threeBarLayout ? 12 : 0),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: split.pending ? 0.85 : 1,
            minHeight: 68,
            maxWidth: 1200,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
      >
        <View style={{ marginRight: shouldUseStackedInfo ? 10 : 16 }}>
          {isBalanceChange ? (
            <Icon name='barChart' size={24} color={theme.colors.tertiary} />
          ) : (
            <ProfilePicture userId={split.paidById} size={32} />
          )}

          {showBadge && (
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
              {isDelayed ? (
                <Icon name='schedule' size={16} color={theme.colors.tertiary} />
              ) : isLend ? (
                <Icon name='payment' size={16} color={theme.colors.tertiary} />
              ) : split.pending ? (
                <Icon name='hourglass' size={16} color={theme.colors.tertiary} />
              ) : isSettleUp ? (
                <Icon name='balance' size={14} color={theme.colors.tertiary} />
              ) : null}
            </View>
          )}
        </View>

        <View style={{ flex: 2 }}>
          <Text
            style={{ fontSize: 18, fontWeight: 700, color: theme.colors.onSurface }}
            numberOfLines={3}
          >
            {getSplitDisplayName(split)}
          </Text>
          {split.version !== 1 && (
            <Text
              style={{
                position: 'absolute',
                bottom: -8,
                fontSize: 8,
                color: theme.colors.outline,
              }}
            >
              {t('splitInfo.edited')}
            </Text>
          )}
        </View>

        {shouldUseStackedInfo && <StackedInfo split={split} info={info} />}
        {!shouldUseStackedInfo && <LinearInfo split={split} info={info} />}

        <View style={{ width: 40 }}>
          <RoundIconButton
            isLoading={isPending}
            disabled={contextMenuDisabled}
            icon='moreVertical'
            onPress={(e) => {
              contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
            }}
            style={{ opacity: contextMenuDisabled ? 0.4 : 1 }}
          />
        </View>
      </View>
    </ContextMenu>
  )
}

export interface SplitRowProps {
  split: SplitInfo
  info?: GroupUserInfo
  style?: StyleProp<ViewStyle>
}

export function SplitRow({ split, info, style }: SplitRowProps) {
  if (!info) {
    return null
  }

  return <LoadedSplitRow split={split} info={info} style={style} />
}
