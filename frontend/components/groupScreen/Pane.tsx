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
  collapsible?: boolean
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export function Pane({
  children,
  icon,
  title,
  style,
  collapsible = false,
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
        collapsible && collapsed ? { width: 64 } : { flex: 1 },
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
        {(!collapsible || !collapsed) && (
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Icon name={icon} size={24} color={theme.colors.secondary} />
            <Text style={{ color: theme.colors.secondary, fontSize: 20, fontWeight: 700 }}>
              {title}
            </Text>
          </View>
        )}

        {collapsible && (
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
