import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { resetSplitQueryConfig, useSplitQueryConfig } from '@hooks/useSplitQueryConfig'
import { useTheme } from '@styling/theme'
import { defaultQueryConfig } from '@utils/splitQueryConfig'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export function SplitQueryButton() {
  const theme = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const groupId = Number(id)
  const query = useSplitQueryConfig(groupId)
  const [pressed, setPressed] = useState(false)

  const queryApplied = query !== defaultQueryConfig

  const longPress = Gesture.LongPress()
    .runOnJS(true)
    .onStart(() => {
      resetSplitQueryConfig(groupId)
    })

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(queryApplied ? theme.colors.primary : 'transparent', {
        duration: 250,
      }),
    }
  })

  const innerBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(pressed ? `${theme.colors.onPrimary}40` : 'transparent', {
        duration: 250,
      }),
    }
  })

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View
        layout={Platform.OS !== 'web' ? LinearTransition : undefined}
        style={[backgroundStyle, { borderRadius: 24, overflow: 'hidden' }]}
      >
        <Animated.View
          layout={Platform.OS !== 'web' ? LinearTransition : undefined}
          style={innerBackgroundStyle}
        >
          <Pressable
            disabled={!queryApplied}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={() => router.navigate(`/group/${groupId}/filter`)}
            style={{
              paddingHorizontal: queryApplied ? 4 : 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {queryApplied && (
              <Icon
                name='check'
                size={24}
                color={theme.colors.onPrimary}
                style={{ marginLeft: 8 }}
              />
            )}
            <Animated.View layout={Platform.OS !== 'web' ? LinearTransition : undefined}>
              <RoundIconButton
                icon='filter'
                disabled={queryApplied}
                color={queryApplied ? theme.colors.onPrimary : undefined}
                onPress={() => router.navigate(`/group/${groupId}/filter`)}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
