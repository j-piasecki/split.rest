import { Button } from '@components/Button'
import { Icon } from '@components/Icon'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View, useWindowDimensions } from 'react-native'
import Animated, { ZoomIn } from 'react-native-reanimated'
import { GroupUserInfo, Member } from 'shared'

export function MembersButton({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { members, isLoading } = useGroupMembers(info?.id, true)
  const containerRef = useRef<View>(null)
  const iconsRef = useRef<View>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const [iconsWidth, setIconsWidth] = useState(0)
  const { width } = useWindowDimensions()

  const iconsToShow = Math.min(20, members.length)

  useLayoutEffect(() => {
    if (containerRef.current && iconsRef.current) {
    const containerSize = measure(containerRef.current!)
    setContainerHeight(containerSize.height)

      const iconsSize = measure(iconsRef.current!)
      setIconsWidth(iconsSize.width)
    }
  }, [iconsToShow, width])

  return (
    <ShimmerPlaceholder argument={isLoading} style={{ flex: 1, minHeight: 134 }}>
    <Pressable
      onPress={() => router.navigate(`/group/${info?.id}/members`)}
      style={({ pressed, hovered }) => ({
        flex: 1,
        backgroundColor: pressed
          ? theme.colors.surfaceContainerHighest
          : hovered
            ? theme.colors.surfaceContainerHigh
            : theme.colors.surfaceContainer,
        borderRadius: 16,
        padding: 12,
      })}
    >
      <View ref={containerRef} style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ gap: 12 }}>
          <View style={[{ flexDirection: 'row', gap: 16, paddingHorizontal: 8 }]}>
            <Icon name='members' size={24} color={theme.colors.secondary} />
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                color: theme.colors.onSurface,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {t('tabs.members')}
            </Text>
          </View>

          <View style={{ height: 72, justifyContent: 'center', paddingHorizontal: 12 }}>
            <Button
              leftIcon='addMember'
              style={{ backgroundColor: theme.colors.primary }}
              foregroundColor={theme.colors.onPrimary}
              onPress={() => router.navigate(`/group/${info?.id}/inviteMember`)}
            >
              <View style={{ width: 0, height: 60, backgroundColor: 'red'}} />
            </Button>
          </View>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            ref={iconsRef}
            style={{
              flex: 1,
              height: containerHeight,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <MembersIcons
              members={members}
              width={iconsWidth}
              height={containerHeight}
              info={info}
            />
          </View>
          <Icon size={24} name={'chevronForward'} color={theme.colors.secondary} />
        </View>
      </View>
    </Pressable>
    </ShimmerPlaceholder>
  )
}

function getVisibleArcFraction(width: number, height: number, radius: number): number {
  const wFactor = Math.min(1, width / (2 * radius))
  const hFactor = Math.min(1, height / (2 * radius))

  // Angle ranges where cos(θ) is within bounds
  const cosLimit = Math.acos(wFactor) // gives angle in radians
  const sinLimit = Math.asin(hFactor)

  // Total valid angle ranges
  // Symmetrical, so we multiply by 4 (each quadrant has same portion)
  const angleRange = 4 * Math.max(cosLimit, sinLimit)

  // Fraction of total circle
  return angleRange / (2 * Math.PI)
}

type Bubble = { size: number; x: number; y: number }

function useBubbles(
  count: number,
  width: number,
  height: number,
  middleIconSize: number
): Bubble[] {
  return useMemo(() => {
    if (count <= 0) {
      return []
    }
    const result: Bubble[] = []
    const ringSpacing = 4
    const centerX = width / 2
    const centerY = height / 2

    let currentRadius = (Math.min(width, height) - middleIconSize - ringSpacing * 2) / 4
    let currentRingRadius = currentRadius + ringSpacing + middleIconSize / 2
    let currentRingCircumference = 2 * Math.PI * currentRingRadius
    let placed = 0

    while (currentRadius > 8 && placed < count) {
      const leftToPlace = count - placed
      const visibleArcFraction = getVisibleArcFraction(width, height, currentRingRadius)
      const numberOfBubbles = Math.floor(
        (currentRingCircumference * visibleArcFraction) / (currentRadius * 2.5)
      )
      const angleStep = (2 * Math.PI * visibleArcFraction) / Math.min(numberOfBubbles, leftToPlace)

      for (
        let angle = Math.PI * visibleArcFraction;
        angle < 2 * Math.PI + Math.PI * visibleArcFraction && placed < count;
        angle += angleStep
      ) {
        const x = centerX - currentRadius + currentRingRadius * Math.cos(angle)
        const y = centerY - currentRadius + currentRingRadius * Math.sin(angle)

        // if out of bounds of the container, skip
        if (x < 0 || x + currentRadius * 2 > width || y < 0 || y + currentRadius * 2 > height) {
          continue
        }

        result.push({
          size: currentRadius * 2 + Math.random() * ringSpacing * 2 - ringSpacing,
          x,
          y,
        })
        placed++
      }

      currentRadius *= Math.max(0.5, Math.min(0.9, width / height - 0.75))
      currentRingRadius += currentRadius * 2 + ringSpacing
      currentRingCircumference = 2 * Math.PI * currentRingRadius
    }

    return result
  }, [count, width, height, middleIconSize])
}

function MembersIcons({
  members,
  width,
  height,
  info,
}: {
  width: number
  height: number
  members: Member[]
  info: GroupUserInfo | undefined
}) {
  const middleIconSize = 40

  const theme = useTheme()
  const bubbles = useBubbles(members.length, width, height, middleIconSize)

  return (
    <View
      style={{
        flex: 1,
        height: height,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
      }}
    >
      {bubbles.map((bubble, index) => (
        <Animated.View
          entering={Platform.OS !== 'web' ? ZoomIn.springify().duration(500).delay(index * 75 + 300) : undefined}
          key={index}
          style={{
            position: 'absolute',
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
          }}
        >
          <ProfilePicture key={index} size={bubble.size} userId={members[index].id} />
        </Animated.View>
      ))}

      <Animated.View
        entering={Platform.OS !== 'web' ? ZoomIn.springify().duration(600).delay(200) : undefined}
        style={{
          width: middleIconSize,
          height: middleIconSize,
          borderRadius: middleIconSize / 2,
          backgroundColor: theme.colors.tertiaryContainer,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.onTertiaryContainer,
            fontSize: middleIconSize / 2,
            fontWeight: 700,
          }}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {info?.memberCount}
        </Text>
      </Animated.View>
    </View>
  )
}
