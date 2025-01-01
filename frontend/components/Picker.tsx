import { Picker as RNPicker } from '@react-native-picker/picker'
import { useTheme } from '@styling/theme'
import { resolveFontName } from '@utils/resolveFontName'
import { Platform, StyleProp, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const AnimatedRNPicker = Animated.createAnimatedComponent(RNPicker)

export interface PickerItem {
  label: string
  value: string
}

export interface PickerProps {
  items: PickerItem[]
  selectedItem: string
  onSelectionChange: (item: string) => void
  hint?: string
  style?: StyleProp<ViewStyle>
}

export function Picker({ hint, items, selectedItem, onSelectionChange, style }: PickerProps) {
  const theme = useTheme()
  const isFocused = useSharedValue(false)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: -4,
      color: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  const wrapperStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  return (
    <View style={style}>
      {hint && (
        <Animated.Text
          style={[
            {
              position: 'absolute',
              fontFamily: resolveFontName(),
              fontSize: Platform.OS === 'ios' ? 16 : 10,
            },
            animatedStyle,
          ]}
        >
          {hint}
        </Animated.Text>
      )}
      <AnimatedRNPicker
        mode='dropdown'
        onFocus={() => {
          isFocused.value = true
        }}
        onBlur={() => {
          isFocused.value = false
        }}
        style={[
          {
            width: '100%',
            backgroundColor: 'transparent',
            color: theme.colors.onSurface,
            borderWidth: 0,
            borderBottomWidth: Platform.OS !== 'ios' ? 1 : 0,
            borderRadius: 2,
            paddingBottom: 8,
            paddingTop: 16,
            fontFamily: resolveFontName(),
          },
          wrapperStyle,
        ]}
        selectedValue={selectedItem}
        onValueChange={(itemValue) => {
          onSelectionChange(itemValue as string)
        }}
      >
        {items.map((item) => (
          <RNPicker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </AnimatedRNPicker>
    </View>
  )
}
