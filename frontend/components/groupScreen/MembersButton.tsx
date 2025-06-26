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
          overflow: 'hidden',
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
                  color: theme.colors.secondary,
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
                <View style={{ width: 0, height: 60, backgroundColor: 'red' }} />
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
  const unitWidth = width / (2 * radius)
  const unitHeight = height / (2 * radius)

  // The circle fits entirely within the container
  if (width >= 2 * radius && height >= 2 * radius) {
    return 1
  }

  // The container is wider than the circle but not taller so we take
  // the angle between the X-axis and the line from the center to
  // the edge of the circle
  if (width >= 2 * radius) {
    const angle = Math.asin(unitHeight)
    return (4 * angle) / (2 * Math.PI)
  }

  // The container is taller than the circle but not wider so we take
  // the angle between the Y-axis and the line from the center to
  // the edge of the circle
  if (height >= 2 * radius) {
    const angle = Math.acos(unitWidth)
    return 1 - (4 * angle) / (2 * Math.PI)
  }

  return 0
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

    let bubbleRadius =
      ((Math.min(width, height) - middleIconSize - ringSpacing * 2) / 4) * (count < 3 ? 1.5 : 1)
    let ringRadius = bubbleRadius + ringSpacing + middleIconSize / 2
    let ringCircumference = 2 * Math.PI * ringRadius
    let placedBubbles = 0

    while (bubbleRadius > 8 && placedBubbles < count) {
      // depending on the configuration, either angle between the X-axis
      // or the Y-axis and the line connecting the center with the
      // intersection of ring and the container is used
      const ringWiderThanContainer = ringRadius * 2 > width
      const leftToPlace = count - placedBubbles
      const ringFractionInTheContainer = getVisibleArcFraction(width, height, ringRadius)
      const numberOfBubbles = Math.floor(
        (ringCircumference * ringFractionInTheContainer) / (bubbleRadius * 2.5)
      )
      const angleStep =
        (2 * Math.PI * ringFractionInTheContainer) / Math.min(numberOfBubbles, leftToPlace)
      const startAngle =
        (-(ringFractionInTheContainer / 2) * Math.PI + (2 * bubbleRadius) / ringRadius) *
        (ringWiderThanContainer ? -1 : 1)

      for (
        let angle = startAngle;
        angle < 2 * Math.PI + startAngle - 0.01 && placedBubbles < count;
        angle += angleStep
      ) {
        const x = centerX - bubbleRadius + ringRadius * Math.cos(angle)
        const y = centerY - bubbleRadius + ringRadius * Math.sin(angle)

        // if out of bounds of the container, skip
        if (x < 0 || x + bubbleRadius * 2 > width || y < 0 || y + bubbleRadius * 2 > height) {
          if (
            (!ringWiderThanContainer && angle < Math.PI / 2) ||
            (ringWiderThanContainer && angle < Math.PI)
          ) {
            angle = startAngle + Math.PI - angleStep
            continue
          } else {
            break
          }
        }

        result.push({
          size: bubbleRadius * 2 + Math.random() * ringSpacing * 2 - ringSpacing,
          x,
          y,
        })

        placedBubbles++
      }

      ringRadius += bubbleRadius * 2
      bubbleRadius *= Math.max(0.5, Math.min(0.9, width / height - 0.75))
      ringCircumference = 2 * Math.PI * ringRadius
    }

    // shuffle result for animation
    result.sort(() => Math.random() - 0.5)
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
      }}
    >
      {bubbles.map((bubble, index) => (
        <Animated.View
          entering={
            Platform.OS !== 'web'
              ? ZoomIn.springify()
                  .duration(500)
                  .delay(index * 75 + 300)
              : undefined
          }
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
          backgroundColor: theme.colors.primaryContainer,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.onPrimaryContainer,
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
