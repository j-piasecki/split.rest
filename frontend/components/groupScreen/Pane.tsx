import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { StyleProp, View, ViewStyle } from 'react-native'

export interface PaneProps {
  children: React.ReactNode
  icon: IconName
  title: string
  style?: StyleProp<ViewStyle>
  collapsable?: boolean
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export function Pane({
  children,
  icon,
  title,
  style,
  collapsable = false,
  collapsed = false,
  onCollapseChange,
}: PaneProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        {
          height: '100%',
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 16,
          overflow: 'hidden',
        },
        collapsable && collapsed ? { width: 64 } : { flex: 1 },
        style,
      ]}
    >
      <View
        style={{
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}
      >
        {(!collapsable || !collapsed) && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Icon name={icon} size={24} color={theme.colors.secondary} />
            <Text style={{ color: theme.colors.secondary, fontSize: 20 }}>{title}</Text>
          </View>
        )}

        {collapsable && (
          <RoundIconButton
            icon={collapsed ? 'openRightPanel' : 'closeRightPanel'}
            size={24}
            onPress={() => {
              onCollapseChange?.(!collapsed)
            }}
            color={theme.colors.secondary}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}
