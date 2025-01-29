import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
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
import { useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo, SplitInfo } from 'shared'

function LinearInfo({ split, info }: { split: SplitInfo; info: GroupUserInfo }) {
  const theme = useTheme()

  return (
    <>
      <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
          {CurrencyUtils.format(split.total, info?.currency)}
        </Text>
      </View>
      <View style={{ flex: 2, alignItems: 'center', overflow: 'hidden' }}>
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
    <View style={{ paddingHorizontal: 8, alignItems: 'flex-end' }}>
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
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { data: permissions } = useGroupPermissions(info.id)
  const displayClass = useDisplayClass()
  const { mutateAsync: deleteSplit, isPending } = useDeleteSplit(info.id)

  const isSmallScreen = displayClass === DisplayClass.Small

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
        return [
          {
            userSelect: 'none',
            backgroundColor:
              pressed && permissions?.canSeeSplitDetails(split)
                ? theme.colors.surfaceContainerHighest
                : hovered
                  ? theme.colors.surfaceContainerHigh
                  : theme.colors.surfaceContainer,
          },
          displayClass <= DisplayClass.Medium && styles.paneShadow,
        ]
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
              snack.show(t('split.deletedToast', { title: split.title }), t('undo'), async () => {
                await restoreSplit(split.id, info.id)
              })
            })
          },
        },
      ]}
    >
      <View
        style={{
          paddingVertical: 16,
          paddingLeft: 16,
          paddingRight: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ProfilePicture
          userId={split.paidById}
          size={32}
          style={{ marginRight: isSmallScreen ? 8 : 16 }}
        />
        <View style={{ flex: 2 }}>
          <Text
            style={{ fontSize: 18, fontWeight: 700, color: theme.colors.onSurface }}
            numberOfLines={3}
          >
            {split.title}
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

        {isSmallScreen && <StackedInfo split={split} info={info} />}
        {!isSmallScreen && <LinearInfo split={split} info={info} />}

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
