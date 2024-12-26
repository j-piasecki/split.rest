import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { useState } from 'react'
import { LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native'

export interface PaneHeaderProps {
  icon?: IconName
  title?: string
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
  children?: React.ReactNode
  icon?: IconName
  title?: string
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  collapsible?: boolean
  collapsed?: boolean
  startCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  wholeHeaderInteractive?: boolean
  textLocation?: 'center' | 'start'
  expandIcon?: IconName
  collapseIcon?: IconName
  orientation?: 'vertical' | 'horizontal'
  headerHidden?: boolean
  onLayout?: (event: LayoutChangeEvent) => void
}

export function Pane({
  children,
  icon,
  title,
  style,
  containerStyle,
  collapsible = false,
  collapsed,
  startCollapsed,
  wholeHeaderInteractive = true,
  onCollapseChange,
  textLocation = 'center',
  expandIcon,
  collapseIcon,
  orientation = 'horizontal',
  headerHidden = false,
  onLayout,
}: PaneProps) {
  const theme = useTheme()
  const [innerCollapsed, setInnerCollapsed] = useState(startCollapsed ?? false)

  const isCollapsed = collapsed ?? innerCollapsed

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 16,
        },
        styles.paneShadow,
        collapsible && isCollapsed
          ? orientation === 'vertical'
            ? { width: 72 }
            : { height: 54 }
          : {},
        style,
      ]}
    >
      {!headerHidden && (
        <Pressable
          disabled={!wholeHeaderInteractive || !collapsible}
          onPress={() => {
            setInnerCollapsed(!isCollapsed)
            onCollapseChange?.(!isCollapsed)
          }}
        >
          <PaneHeader
            icon={icon}
            title={title}
            rightComponent={
              <RoundIconButton
                icon={
                  isCollapsed
                    ? (expandIcon ?? (orientation === 'vertical' ? 'openRightPanel' : 'arrowDown'))
                    : (collapseIcon ?? (orientation === 'vertical' ? 'closeRightPanel' : 'arrowUp'))
                }
                size={24}
                onPress={() => {
                  setInnerCollapsed(!isCollapsed)
                  onCollapseChange?.(!isCollapsed)
                }}
                color={theme.colors.secondary}
              />
            }
            rightComponentVisible={collapsible}
            textVisible={!collapsible || !isCollapsed || orientation === 'horizontal'}
            textLocation={textLocation}
            showSeparator={!isCollapsed || orientation === 'vertical'}
          />
        </Pressable>
      )}
      <Pressable
        disabled={!isCollapsed || !collapsible}
        style={containerStyle}
        onPress={() => {
          setInnerCollapsed(false)
          onCollapseChange?.(false)
        }}
      >
        {children}
      </Pressable>
    </View>
  )
}
