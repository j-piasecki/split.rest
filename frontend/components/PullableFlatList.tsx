import { DrawerLayoutContext } from './DrawerLayout'
import React, { useContext, useRef } from 'react'
import { LayoutRectangle, Platform, View } from 'react-native'
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
  const { panGesture } = useContext(DrawerLayoutContext) ?? {}
  const enablePull = props.refreshControl === undefined

  const containerLayout = useRef<LayoutRectangle | null>(null)
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
        dragDistance.set(withSpring(0, { duration: 500 }))
        enableScroll()
      }
    })

  if (panGesture?.current) {
    dragGesture.simultaneousWithExternalGesture(panGesture.current)
  }

  const Header = props.renderPullableHeader?.(normalizedDrag)

  return (
    <GestureDetector gesture={dragGesture} touchAction='none'>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          containerLayout.current = e.nativeEvent.layout
        }}
      >
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
          onContentSizeChange={(_width, height) => {
            if (props.onContentSizeChange && typeof props.onContentSizeChange !== 'function') {
              throw new Error('onContentSizeChange must be a function')
            }
            props.onContentSizeChange?.(_width, height)

            if (containerLayout.current) {
              const distanceFromEnd = height - containerLayout.current.height

              if (distanceFromEnd < 80 && typeof props.onEndReached === 'function') {
                props.onEndReached?.({ distanceFromEnd })
              }
            }
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
