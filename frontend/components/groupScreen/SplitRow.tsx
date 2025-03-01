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
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getSplitDisplayName } from '@utils/getSplitDisplayName'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo, SplitInfo, SplitType } from 'shared'

function LinearInfo({ split, info }: { split: SplitInfo; info: GroupUserInfo }) {
  const theme = useTheme()

  return (
    <>
      <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, fontWeight: 600, color: theme.colors.onSurface }}>
          {CurrencyUtils.format(split.total, info?.currency)}
        </Text>
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
}

function LoadedSplitRow({ split, info }: LoadedSplitRowProps) {
  const theme = useTheme()
  const router = useRouter()
  const snack = useSnack()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const [width, setWidth] = useState(-1)
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutateAsync: deleteSplit, isPending } = useDeleteSplit(info.id)

  const isSettleUp = Boolean(split.type & SplitType.SettleUp)
  const isInverse = Boolean(split.type & SplitType.Inversed)
  const isBalanceChange = split.type === SplitType.BalanceChange
  const shouldUseStackedInfo = displayClass === DisplayClass.Small || (width < 660 && width > 0)

  const contextMenuDisabled =
    !permissions?.canSeeSplitDetails(split) &&
    !permissions?.canUpdateSplit(split) &&
    !permissions?.canDeleteSplit(split)

  return (
    <ContextMenu
      key={split.id}
      ref={contextMenuRef}
      disabled={contextMenuDisabled}
      style={({ pressed, hovered }) => {
        return {
          userSelect: 'none',
          backgroundColor:
            pressed && permissions?.canSeeSplitDetails(split)
              ? theme.colors.surfaceContainerHighest
              : hovered
                ? theme.colors.surfaceContainerHigh
                : theme.colors.surfaceContainer,
        }
      }}
      onPress={() => {
        if (permissions?.canSeeSplitDetails(split)) {
          router.navigate(`/group/${info?.id}/split/${split.id}`)
        }
      }}
      items={[
        {
          label: t('split.showDetails'),
          icon: 'visibility',
          disabled: !permissions?.canSeeSplitDetails(split),
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}`)
          },
        },
        {
          label: t('split.edit'),
          icon: 'edit',
          disabled: !permissions?.canUpdateSplit(split),
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}/edit`)
          },
        },
        {
          label: t('split.delete'),
          icon: 'delete',
          disabled: !permissions?.canDeleteSplit(split),
          destructive: true,
          onPress: () => {
            deleteSplit(split.id).then(() => {
              snack.show({
                message: t('split.deletedToast', { title: getSplitDisplayName(split) }),
                actionText: t('undo'),
                action: async () => {
                  await restoreSplit(split.id, info.id)
                },
              })
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
            paddingVertical: 16,
            paddingLeft: shouldUseStackedInfo ? 12 : 16,
            paddingRight: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          displayClass <= DisplayClass.Medium && styles.paneShadow,
        ]}
      >
        <View style={{ marginRight: shouldUseStackedInfo ? 10 : 16 }}>
          {isBalanceChange ? (
            <Icon name='barChart' size={24} color={theme.colors.tertiary} />
          ) : (
            <ProfilePicture userId={split.paidById} size={32} />
          )}

          {isSettleUp && (
            <View
              style={[
                {
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  backgroundColor: theme.colors.surfaceContainerHighest,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                styles.paneShadow,
              ]}
            >
              {isInverse ? (
                <Icon
                  name='merge'
                  size={14}
                  color={theme.colors.tertiary}
                  style={{
                    transform: [{ rotateZ: '-90deg' }],
                  }}
                />
              ) : (
                <Icon
                  name='split'
                  size={14}
                  color={theme.colors.tertiary}
                  style={{
                    transform: [{ rotateZ: '90deg' }],
                  }}
                />
              )}
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
                bottom: -12,
                fontSize: 10,
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
}

export function SplitRow({ split, info }: SplitRowProps) {
  if (!info) {
    return null
  }

  return <LoadedSplitRow split={split} info={info} />
}
