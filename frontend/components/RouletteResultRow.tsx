import { Icon } from '@components/Icon'
import { FullPaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { UserWithMaybeBalance } from '@hooks/useRouletteQuery'
import { useTheme } from '@styling/theme'
import { getBalanceColor } from '@utils/getBalanceColor'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { CurrencyUtils, GroupUserInfo } from 'shared'

export interface RouletteResultRowProps {
  user: UserWithMaybeBalance | null
  index: number
  result: (UserWithMaybeBalance | null)[]
  groupInfo: GroupUserInfo
  isSelected?: boolean
  onSelect?: () => void
}

export function RouletteResultRow({
  user,
  index,
  result,
  groupInfo,
  isSelected = false,
  onSelect,
}: RouletteResultRowProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const borderOpacity = useSharedValue(0)

  const isFirst = index === 0 && user?.maybeBalance
  const isSecond = index === 1 && user?.maybeBalance
  const isThird = index === 2 && user?.maybeBalance
  const isOnPodium = isFirst || isSecond || isThird
  const color = isFirst
    ? theme.colors.podiumGold
    : isSecond
      ? theme.colors.podiumSilver
      : theme.colors.podiumBronze

  const [pressed, setPressed] = useState(false)
  const [hover, setHover] = useState(false)

  const hoverAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: theme.colors.surfaceContainerHighest,
      opacity: withTiming(isSelected ? 1 : pressed ? 0.5 : hover ? 0.3 : 0, { duration: 200 }),
    }
  })

  useEffect(() => {
    if (isOnPodium) {
      borderOpacity.value = withTiming(255, { duration: 450 }, (finished) => {
        if (finished) {
          borderOpacity.value = withRepeat(withTiming(168, { duration: 2000 }), -1, true)
        }
      })
    }
  }, [borderOpacity, isOnPodium])

  const borderAnimatedStyle = useAnimatedStyle(() => {
    let alpha = Math.floor(borderOpacity.value).toString(16)
    if (alpha.length === 1) {
      alpha = '0' + alpha
    }
    return {
      borderColor: `${color}${alpha}`,
    }
  })

  if (!user) {
    if (index === result.length - 1) {
      return null
    }

    return (
      <Animated.View
        key={'header'}
        style={{ marginTop: index !== 0 ? 16 : 0 }}
        layout={
          Platform.OS !== 'web'
            ? LinearTransition.springify().damping(100).stiffness(750)
            : undefined
        }
        exiting={Platform.OS !== 'web' ? FadeOut : undefined}
      >
        <FullPaneHeader
          icon='listNumbered'
          title={index === 0 ? t('roulette.result') : t('roulette.others')}
          textLocation='start'
        />
      </Animated.View>
    )
  }

  const balanceNum = parseFloat(user.balance ?? '')
  const balanceColor = getBalanceColor(balanceNum, theme)

  return (
    <Animated.View
      key={user.id}
      layout={
        Platform.OS !== 'web'
          ? LinearTransition.springify()
              .damping(100)
              .stiffness(750)
              .delay(50 * index)
          : undefined
      }
      style={[
        {
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: isOnPodium ? 16 : 4,
          marginBottom: isFirst ? 16 : isOnPodium ? 8 : 2,
          borderWidth: isOnPodium ? 1 : 0,
          borderColor: color,
          overflow: 'hidden',
        },
        borderAnimatedStyle,
        index === result.length - 1 && {
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      ]}
    >
      <Pressable
        onPress={onSelect}
        disabled={!onSelect}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: isFirst ? 24 : 16,
          gap: 8,
        }}
      >
        {onSelect && <Animated.View style={[StyleSheet.absoluteFillObject, hoverAnimatedStyle]} />}

        {isFirst && (
          <View style={{ marginBottom: 4 }}>
            <ProfilePicture user={user} size={96} />
            <View
              style={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                backgroundColor: theme.colors.surfaceContainerHighest,
                borderRadius: 24,
                padding: 8,
              }}
            >
              <Icon name='trophy' size={28} color={color} />
            </View>
          </View>
        )}
        <View
          style={{
            flex: 1,
            flexDirection: isFirst ? 'column' : 'row',
            alignItems: isFirst ? 'flex-end' : 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {(index !== 0 || !user.maybeBalance) && (
            <View>
              <ProfilePicture user={user} size={32} />
              {!isFirst && isOnPodium && (
                <View
                  style={{
                    position: 'absolute',
                    backgroundColor: theme.colors.surfaceContainerHighest,
                    borderRadius: 12,
                    bottom: -8,
                    right: -8,
                    padding: 4,
                  }}
                >
                  <Icon name='trophy' size={16} color={color} />
                </View>
              )}
            </View>
          )}
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: isFirst ? 'flex-end' : 'flex-start',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: isFirst ? 26 : 18,
                fontWeight: 700,
                color: theme.colors.onSurface,
              }}
            >
              {user.displayName ?? user.name}
            </Text>

            {user.displayName && (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: isFirst ? 16 : 12,
                  fontWeight: 600,
                  color: theme.colors.outline,
                }}
              >
                {user.name}
              </Text>
            )}
          </View>

          <ShimmerPlaceholder argument={user.maybeBalance} shimmerStyle={{ width: 64, height: 24 }}>
            <Text
              style={{
                fontSize: isFirst ? 28 : 18,
                fontWeight: isFirst ? 700 : 500,
                color: balanceColor,
              }}
            >
              {CurrencyUtils.format(balanceNum, groupInfo.currency, true)}
            </Text>
          </ShimmerPlaceholder>
        </View>
        {onSelect && (
          <View style={{ position: 'absolute', bottom: 4, right: 8 }}>
            <Icon
              name='check'
              size={24}
              color={isSelected ? theme.colors.onSurface : 'transparent'}
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}
