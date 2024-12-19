import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'

export interface PaneHeaderProps {
  icon: IconName
  title: string
  rightComponent?: React.ReactNode
  rightComponentVisible?: boolean
  textVisible?: boolean
  textLocation?: 'center' | 'start'
  showSeparator?: boolean
}

export function PaneHeader({
  icon,
  title,
  rightComponentVisible = true,
  rightComponent,
  textVisible = true,
  textLocation = 'center',
  showSeparator = true,
}: PaneHeaderProps) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()

  return (
    <View
      style={{
        width: '100%',
        borderBottomWidth: showSeparator ? 1 : 0,
        paddingHorizontal: threeBarLayout ? 16 : 24,
        borderBottomColor: theme.colors.outlineVariant,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      {textVisible && (
        <View
          style={[
            { flexDirection: 'row', gap: 16 },
            textLocation === 'center' ? { flex: 1, justifyContent: 'center' } : {},
          ]}
        >
          <Icon name={icon} size={threeBarLayout ? 20 : 24} color={theme.colors.secondary} />
          <Text
            style={{
              color: theme.colors.secondary,
              fontSize: threeBarLayout ? 16 : 20,
              fontWeight: 600,
            }}
          >
            {title}
          </Text>
        </View>
      )}

      <View style={textLocation === 'start' && { flex: 1, alignItems: 'flex-end' }}>
        {rightComponentVisible && rightComponent}
      </View>
    </View>
  )
}

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
      <PaneHeader
        icon={icon}
        title={title}
        rightComponent={
          <RoundIconButton
            icon={collapsed ? 'openRightPanel' : 'closeRightPanel'}
            size={24}
            onPress={() => {
              onCollapseChange?.(!collapsed)
            }}
            color={theme.colors.secondary}
          />
        }
        rightComponentVisible={collapsible}
        textVisible={!collapsible || !collapsed}
      />
      <Pressable
        disabled={!collapsed || !collapsible}
        style={{ flex: 1 }}
        onPress={() => {
          onCollapseChange?.(false)
        }}
      >
        {children}
      </Pressable>
    </View>
  )
}
