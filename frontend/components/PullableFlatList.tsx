import { View } from 'react-native'
import Animated, {
  FlatListPropsWithLayout,
  SharedValue,
  useAnimatedRef,
  useScrollViewOffset,
} from 'react-native-reanimated'

export interface PullableFlatListProps<T> extends FlatListPropsWithLayout<T> {
  renderPullableHeader?: (pullValue: SharedValue<number>) => React.ReactNode
}

export function PullableFlatList<T>(props: PullableFlatListProps<T>) {
  const animatedRef = useAnimatedRef<Animated.FlatList<T>>()
  const scrollOffset = useScrollViewOffset(animatedRef as unknown as null)

  const Header = props.renderPullableHeader?.(scrollOffset)

  return (
    <View style={{ flex: 1 }}>
      {Header}
      <Animated.FlatList ref={animatedRef} scrollEventThrottle={1} {...props} />
    </View>
  )
}
