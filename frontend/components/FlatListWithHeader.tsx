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
  > {
  refreshing?: boolean
  onRefresh?: () => void
  scrollHandler?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  showBackButton?: boolean
  hideHeader?: boolean
}

export function FlatListWithHeader<T>({
  refreshing,
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
      opacity: withSpring(headerVisible.value ? 1 : 0, { damping: 100, stiffness: 400 }),
      transform: [
        {
          translateY: withSpring(headerVisible.value ? 0 : -headerHeight, {
            damping: 100,
            stiffness: 500,
          }),
        },
      ],
      pointerEvents: headerVisible.value ? 'auto' : 'none',
    }
  })

  function scrollHandlerWrapper(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollHandler?.(e)

    if (hideHeader || displayClass <= DisplayClass.Medium) {
      if (e.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
        headerVisible.value = true
      } else {
        const diff = e.nativeEvent.contentOffset.y - lastScrollY.value

        if (diff > 0) {
          headerVisible.value = false
        } else if (
          diff < 0 &&
          e.nativeEvent.contentSize.height >
            e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y
        ) {
          headerVisible.value = true
        }
      }

      lastScrollY.value = e.nativeEvent.contentOffset.y
    }
  }

  return (
    <PullableFlatList
      {...props}
      contentContainerStyle={[
        contentContainerStyle,
        !hideHeader && { paddingTop: headerHeight + (displayClass <= DisplayClass.Medium ? 8 : 0) },
      ]}
      onScroll={scrollHandlerWrapper}
      onScrollBeginDrag={scrollHandlerWrapper}
      onScrollEndDrag={scrollHandlerWrapper}
      onMomentumScrollBegin={scrollHandlerWrapper}
      onMomentumScrollEnd={scrollHandlerWrapper}
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
                    isWaiting={refreshing}
                    onPull={onRefresh}
                  />
                </Animated.View>
              </View>
            )
      }
      refreshControl={
        hideHeader ? (
          <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  )
}
