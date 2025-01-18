import { Shimmer } from './Shimmer'
import { StyleProp, View, ViewStyle } from 'react-native'

export interface ShimmerPlaceholderProps<T> {
  children: React.ReactNode | ((arg: Exclude<T, undefined | null>) => React.ReactNode)
  argument: T
  color?: string
  style?: StyleProp<ViewStyle>
  shimmerStyle?: StyleProp<ViewStyle>
  offset?: number
}

export function ShimmerPlaceholder<T>({
  children,
  argument,
  color,
  style,
  shimmerStyle,
  offset,
}: ShimmerPlaceholderProps<T>) {
  const renderedChild =
    argument === undefined || argument === null
      ? null
      : typeof children === 'function'
        ? children(argument as Exclude<T, undefined | null>)
        : children

  return argument === undefined || argument === null ? (
    <View key='shimmer' style={[style, { flexDirection: 'column', justifyContent: 'center' }]}>
      <Shimmer
        color={color}
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius: 16,
          },
          shimmerStyle,
        ]}
        offset={offset}
      />
    </View>
  ) : renderedChild ? (
    <View key='content' style={style}>
      {renderedChild}
    </View>
  ) : null
}
