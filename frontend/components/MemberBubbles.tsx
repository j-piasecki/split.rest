import { ProfilePicture } from './ProfilePicture'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useMemo } from 'react'
import { Platform, View } from 'react-native'
import Animated, { ZoomIn } from 'react-native-reanimated'
import { GroupInfo } from 'shared'

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
    let totalAttempts = 0
    const result: Bubble[] = []
    const ringSpacing = 4
    const centerX = width / 2
    const centerY = height / 2

    let bubbleRadius =
      ((Math.min(width, height) - middleIconSize - ringSpacing * 2) / 4) * (count < 3 ? 1.5 : 1)
    let ringRadius = bubbleRadius + ringSpacing + middleIconSize / 2
    let ringCircumference = 2 * Math.PI * ringRadius
    let placedBubbles = 0

    while (bubbleRadius > 8 && placedBubbles < count && totalAttempts < 100) {
      const leftToPlace = count - placedBubbles
      const ringFractionInsideContainer = getVisibleArcFraction(width, height, ringRadius)
      const numberOfBubbles = Math.floor(
        (ringCircumference * ringFractionInsideContainer) / (bubbleRadius * 2.5)
      )
      const angleStep =
        (2 * Math.PI * ringFractionInsideContainer) / Math.min(numberOfBubbles, leftToPlace)
      const startAngle = (ringFractionInsideContainer / 2) * Math.PI + (Math.PI * 3) / 5

      for (
        let angle = startAngle;
        angle < 2 * Math.PI + startAngle - (bubbleRadius * 2) / ringRadius && placedBubbles < count;
        angle += angleStep
      ) {
        totalAttempts++
        const x = centerX - bubbleRadius + ringRadius * Math.cos(angle)
        const y = centerY - bubbleRadius + ringRadius * Math.sin(angle)

        const overflowsX =
          x < -bubbleRadius * 0.2 || x + bubbleRadius * 2 > width + bubbleRadius * 0.2
        const overflowsY =
          y < -bubbleRadius * 0.2 || y + bubbleRadius * 2 > height + bubbleRadius * 0.2

        // if out of bounds of the container, skip
        if (overflowsX || overflowsY) {
          continue
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

    // shuffle bubbles for animation
    result.sort(() => Math.random() - 0.5)
    return result
  }, [count, width, height, middleIconSize])
}

export function MemberBubbles({
  profilePictures,
  width,
  height,
  info,
  middleIconSize = 40,
}: {
  width: number
  height: number
  profilePictures: string[]
  info: GroupInfo | undefined
  middleIconSize?: number
}) {
  const theme = useTheme()
  const bubbles = useBubbles(profilePictures.length, width, height, middleIconSize)

  return (
    <View
      style={{
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
          <ProfilePicture key={index} size={bubble.size} pictureId={profilePictures[index]} />
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
