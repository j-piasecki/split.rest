import React from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector, PanGesture } from 'react-native-gesture-handler'
import Animated, {
  AnimatedScrollViewProps,
  FlatListPropsWithLayout,
  SharedValue,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const ENABLE_PAN_DRAGGING = Platform.OS === 'android'

export interface PullableFlatListProps<T> extends FlatListPropsWithLayout<T> {
  renderPullableHeader?: (pullValue: SharedValue<number>) => React.ReactNode
}

export function PullableFlatList<T>(props: PullableFlatListProps<T>) {
  const enablePull = props.refreshControl === undefined

  const animatedRef = useAnimatedRef<Animated.FlatList<T>>()
  const scrollOffset = useScrollViewOffset(animatedRef as unknown as null)
  const scrollEnabled = useSharedValue(true)
  const dragDistance = useSharedValue(0)

  const normalizedDrag = useDerivedValue(() => {
    if (!enablePull) {
      return 0
    }

    if (ENABLE_PAN_DRAGGING) {
      return -Math.pow(Math.max(-dragDistance.value, 0), 0.85)
    }

    return scrollOffset.value
  })

  function enableScroll() {
    'worklet'
    scrollEnabled.value = true
  }

  const dragGesture = Gesture.Pan()
    .enabled(ENABLE_PAN_DRAGGING && enablePull)
    .onChange((e) => {
      if (scrollOffset.value <= 0) {
        dragDistance.value -= e.changeY

        if (scrollOffset.value < 0) {
          scrollEnabled.value = false
        } else {
          enableScroll()
        }
      } else {
        enableScroll()
      }
    })
    .onFinalize(() => {
      if (scrollOffset.value <= 0) {
        dragDistance.set(withSpring(0, { damping: 50, stiffness: 500 }))
        enableScroll()
      }
    })

  const Header = props.renderPullableHeader?.(normalizedDrag)

  return (
    <GestureDetector gesture={dragGesture} touchAction='none'>
      <View style={{ flex: 1 }}>
        {Header}
        <Animated.FlatList
          ref={animatedRef}
          // scroll offset on ios is used to animate header, everywhere else to collapse/expand fab
          // low values on android kill framerate on scroll when header is animating
          scrollEventThrottle={Platform.OS === 'ios' ? 1 : 100}
          {...props}
          renderScrollComponent={(props) => {
            return (
              <ScrollComponent
                enablePull={enablePull}
                scrollEnabledSV={scrollEnabled}
                dragGesture={dragGesture}
                dragDistance={normalizedDrag}
                {...props}
              />
            )
          }}
        />
      </View>
    </GestureDetector>
  )
}

interface ScrollComponentProps extends AnimatedScrollViewProps {
  enablePull: boolean
  scrollEnabledSV: SharedValue<boolean>
  dragGesture: PanGesture
  dragDistance: SharedValue<number>
}

const ScrollComponent = React.forwardRef<Animated.ScrollView, ScrollComponentProps>(
  function ScrollComponent(
    {
      enablePull,
      scrollEnabledSV,
      dragGesture,
      dragDistance,
      style,
      ...rest
    }: ScrollComponentProps,
    ref
  ) {
    const scrollGesture = Gesture.Native()
      .enabled(ENABLE_PAN_DRAGGING ? enablePull : true)
      .disallowInterruption(true)
      .simultaneousWithExternalGesture(dragGesture)

    const scrollProps = useAnimatedProps(() => {
      return {
        scrollEnabled: scrollEnabledSV.value,
      }
    })

    const scrollStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: ENABLE_PAN_DRAGGING ? Math.max(-dragDistance.value, 0) : 0 }],
      }
    })

    return (
      <GestureDetector gesture={scrollGesture}>
        <Animated.ScrollView
          ref={ref}
          style={[style, scrollStyle]}
          {...rest}
          animatedProps={scrollProps}
        />
      </GestureDetector>
    )
  }
)
