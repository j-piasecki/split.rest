import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { DrawerLayoutContext } from '@components/DrawerLayout'
import { GroupIcon } from '@components/GroupIcon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { useTheme } from '@styling/theme'
import { getBalanceColor } from '@utils/getBalanceColor'
import { router } from 'expo-router'
import React, { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import { CurrencyUtils } from 'shared'
import { GroupUserInfo } from 'shared'

export const GROUP_ROW_HEIGHT = 64

export interface GroupRowProps {
  info: GroupUserInfo
  style?: StyleProp<ViewStyle>
}

export function GroupRow({ info, style }: GroupRowProps) {
  const theme = useTheme()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { t } = useTranslation()
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info?.id)
  const drawerContext = useContext(DrawerLayoutContext)

  const balanceColor = getBalanceColor(Number(info.balance), theme)

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
        router.replace(`/group/${info.id}`)
        drawerContext?.closeDrawer()
      }}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
        },
        style,
      ]}
    >
      <View
        style={{
          paddingLeft: 8,
          paddingRight: 4,
          height: GROUP_ROW_HEIGHT,
          opacity: info.hidden ? 0.7 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <GroupIcon info={info} size={48} style={{ marginRight: 8 }} />
        <View style={{ flex: 1, marginRight: 4 }}>
          <Text style={{ fontSize: 18, color: theme.colors.onSurface }} numberOfLines={1}>
            {info.name}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: balanceColor }}>
            {CurrencyUtils.format(info.balance, info.currency, true, true)}
          </Text>
        </View>

        <RoundIconButton
          icon='moreVertical'
          onPress={(e) => {
            contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
          }}
          containerStyle={{ marginLeft: 4 }}
        />
      </View>
    </ContextMenu>
  )
}
