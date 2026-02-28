import Header, { HEADER_HEIGHT } from './Header'
import { PullableFlatList } from './PullableFlatList'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, View } from 'react-native'
import Animated, {
  FlatListPropsWithLayout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface FlatListWithHeaderProps<T>
  extends Omit<
    FlatListPropsWithLayout<T>,
    | 'refreshControl'
    | 'onScroll'
    | 'onScrollBeginDrag'
    | 'onScrollEndDrag'
    | 'onMomentumScrollBegin'
    | 'onMomentumScrollEnd'
    | 'refreshing'
  > {
  isLoading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
  scrollHandler?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  showBackButton?: boolean
  hideHeader?: boolean
}

export function FlatListWithHeader<T>({
  isLoading,
  isRefreshing,
  onRefresh,
  contentContainerStyle,
  scrollHandler,
  showBackButton,
  hideHeader,
  ...props
}: FlatListWithHeaderProps<T>) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const displayClass = useDisplayClass()
  const headerVisible = useSharedValue(true)
  const lastScrollY = useSharedValue(0)

  const headerHeight = HEADER_HEIGHT + insets.top

  const headerWrapperStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(headerVisible.value ? 1 : 0, { duration: 400 }),
      transform: [
        {
          translateY: withSpring(headerVisible.value ? 0 : -headerHeight, {
            duration: 400,
          }),
        },
      ],
      pointerEvents: headerVisible.value ? 'auto' : 'none',
    }
  })

  function scrollHandlerWrapper(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollHandler?.(e)

    if (hideHeader || displayClass > DisplayClass.Medium) {
      return
    }

    if (e.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
      headerVisible.value = true
    } else {
      const diff = e.nativeEvent.contentOffset.y - lastScrollY.value

      if (diff > 16) {
        headerVisible.value = false
        lastScrollY.value = e.nativeEvent.contentOffset.y
      } else if (
        diff < -16 &&
        e.nativeEvent.contentSize.height >
          e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y
      ) {
        headerVisible.value = true
        lastScrollY.value = e.nativeEvent.contentOffset.y
      }
    }
  }

  return (
    <PullableFlatList
      {...props}
      contentContainerStyle={[contentContainerStyle, !hideHeader && { paddingTop: headerHeight }]}
      onScroll={scrollHandlerWrapper}
      onScrollBeginDrag={scrollHandlerWrapper}
      onScrollEndDrag={scrollHandlerWrapper}
      onMomentumScrollBegin={scrollHandlerWrapper}
      onMomentumScrollEnd={scrollHandlerWrapper}
      keyboardShouldPersistTaps='handled'
      renderPullableHeader={
        hideHeader
          ? undefined
          : (pullValue) => (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  pointerEvents: 'box-none',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: insets.top,
                    backgroundColor: theme.colors.surface,
                    opacity: 0.6,
                  }}
                />
                <Animated.View style={headerWrapperStyle}>
                  <Header
                    showBackButton={showBackButton}
                    offset={pullValue}
                    isWaiting={isLoading || isRefreshing}
                    onPull={onRefresh}
                  />
                </Animated.View>
              </View>
            )
      }
      refreshControl={
        hideHeader ? (
          <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  )
}
