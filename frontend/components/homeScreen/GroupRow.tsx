import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export const GROUP_ROW_HEIGHT = 80

export interface GroupRowProps {
  info: GroupUserInfo
}

export function GroupRow({ info }: GroupRowProps) {
  const theme = useTheme()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info?.id)

  const balanceColor =
    Number(info.balance) === 0
      ? theme.colors.balanceNeutral
      : Number(info.balance) > 0
        ? theme.colors.balancePositive
        : theme.colors.balanceNegative

  return (
    <ContextMenu
      ref={contextMenuRef}
      items={[
        {
          label: info.hidden ? t('home.showGroup') : t('home.hideGroup'),
          icon: info.hidden ? 'visibility' : 'visibilityOff',
          onPress: () => {
            setGroupHiddenMutation(!info.hidden)
          },
        },
      ]}
      onPress={() => {
        router.navigate(`/group/${info.id}`)
      }}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
        },
        styles.paneShadow,
      ]}
    >
      <View
        style={{
          paddingLeft: 16,
          paddingRight: 8,
          height: GROUP_ROW_HEIGHT,
          opacity: info.hidden ? 0.7 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{ flex: 1, fontSize: 20, color: theme.colors.onSurface, marginRight: 8 }}
          numberOfLines={2}
        >
          {info.name}
        </Text>

        <View
          style={{
            flexDirection: isSmallScreen ? 'column' : 'row',
            gap: isSmallScreen ? 4 : 20,
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 600, color: balanceColor }}>
            {CurrencyUtils.format(info.balance, info.currency, true)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontSize: 16, color: theme.colors.outline }}>{info.memberCount}</Text>
              <Icon name='members' size={20} color={theme.colors.outline} />
            </View>

            {(!isSmallScreen || !info.hasAccess || info.isAdmin) && (
              <Icon
                name={info.isAdmin ? 'shield' : 'lock'}
                size={16}
                color={
                  info.hasAccess && !info.isAdmin ? theme.colors.transparent : theme.colors.outline
                }
                style={{ transform: [{ translateY: 2 }] }}
              />
            )}
          </View>
        </View>

        <RoundIconButton
          icon='moreVertical'
          onPress={(e) => {
            contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
          }}
          style={{ marginLeft: 8 }}
        />
      </View>
    </ContextMenu>
  )
}
