import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
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
  adjustsFontSizeToFit?: boolean
  headerOffset?: number
  color?: string
}

export function PaneHeader({
  icon,
  title,
  rightComponentVisible = true,
  rightComponent,
  textVisible = true,
  textLocation = 'center',
  adjustsFontSizeToFit = false,
  headerOffset = 0,
  color,
}: PaneHeaderProps) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()

  const foregroundColor = color ?? theme.colors.secondary

  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: threeBarLayout ? 16 : 24,
        borderBottomColor: theme.colors.outlineVariant,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {textVisible && (
        <View
          style={[
            { flexDirection: 'row', gap: 16 },
            textLocation === 'center'
              ? { justifyContent: 'center' }
              : { paddingLeft: headerOffset },
            adjustsFontSizeToFit ? { flex: 1 } : { flexGrow: 1, flexShrink: 0 },
          ]}
        >
          <Icon name={icon} size={threeBarLayout ? 20 : 24} color={foregroundColor} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={adjustsFontSizeToFit}
            style={{
              flexShrink: 1,
              color: foregroundColor,
              fontSize: threeBarLayout ? 16 : 20,
              fontWeight: 600,
            }}
          >
            {title}
          </Text>
        </View>
      )}

      {rightComponentVisible && rightComponent}
    </View>
  )
}

export interface PaneProps {
  children?: React.ReactNode
  icon?: IconName
  title?: string
  style?: StyleProp<ViewStyle>
  rightComponent?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
  collapsible?: boolean
  collapsed?: boolean
  startCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  wholeHeaderInteractive?: boolean
  textLocation?: 'center' | 'start'
  headerOffset?: number
  expandIcon?: IconName
  collapseIcon?: IconName
  orientation?: 'vertical' | 'horizontal'
  headerHidden?: boolean
  onLayout?: (event: LayoutChangeEvent) => void
  color?: string
}

export function Pane({
  children,
  icon,
  title,
  style,
  rightComponent,
  containerStyle,
  collapsible = false,
  collapsed,
  startCollapsed,
  wholeHeaderInteractive = true,
  onCollapseChange,
  textLocation = 'center',
  headerOffset,
  expandIcon,
  collapseIcon,
  orientation = 'horizontal',
  headerHidden = false,
  onLayout,
  color,
}: PaneProps) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const [innerCollapsed, setInnerCollapsed] = useState(startCollapsed ?? false)

  const foregroundColor = color ?? theme.colors.secondary
  const isCollapsed = collapsed ?? innerCollapsed

  return (
    <View
      onLayout={onLayout}
      style={[
        // styles.paneShadow,
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
          style={[
            {
              backgroundColor: theme.colors.surfaceContainer,
              borderRadius: 16,
            },
            (!isCollapsed || orientation === 'vertical') && {
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              marginBottom: 2,
            },
          ]}
        >
          <PaneHeader
            icon={icon}
            title={title}
            rightComponent={
              <View style={{ position: 'absolute', right: threeBarLayout ? 16 : 24 }}>
                {rightComponent ? (
                  rightComponent
                ) : (
                  <RoundIconButton
                    icon={
                      isCollapsed
                        ? (expandIcon ??
                          (orientation === 'vertical' ? 'openRightPanel' : 'arrowDown'))
                        : (collapseIcon ??
                          (orientation === 'vertical' ? 'closeRightPanel' : 'arrowUp'))
                    }
                    size={24}
                    onPress={() => {
                      setInnerCollapsed(!isCollapsed)
                      onCollapseChange?.(!isCollapsed)
                    }}
                    color={theme.colors.secondary}
                  />
                )}
              </View>
            }
            rightComponentVisible={collapsible}
            textVisible={!collapsible || !isCollapsed || orientation === 'horizontal'}
            textLocation={textLocation}
            headerOffset={headerOffset}
            color={foregroundColor}
          />
        </Pressable>
      )}
      <Pressable
        disabled={!isCollapsed || !collapsible}
        style={[
          containerStyle,
          {
            backgroundColor: theme.colors.surfaceContainer,
            borderRadius: 16,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            overflow: 'hidden',
          },
        ]}
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
