import { Button } from '@components/Button'
import { Icon, IconName } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { navigateToSplitSpecificFlow } from '@utils/navigateToSplitSpecificFlow'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import { SplitMethod } from 'shared'

const SplitTypeCard = ({
  title,
  description,
  icon,
  selected,
  onSelect,
}: {
  title: string
  description: string
  icon: IconName
  selected: boolean
  onSelect: () => void
}) => {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(selected ? 0.9 : pressed ? 0.65 : hovered ? 0.3 : 0, {
        duration: 200,
      }),
    }
  })

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed ? 1.025 : 1, {
            damping: 15,
            stiffness: 200,
            restSpeedThreshold: 0.0001,
          }),
        },
      ],
    }
  })

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onSelect}
    >
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            gap: 8,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            overflow: 'hidden',
            // @ts-expect-error - userSelect is not a valid style property
            userSelect: 'none',
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            animatedStyle,
            {
              backgroundColor: theme.colors.secondaryContainer,
            },
          ]}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Icon
            name={icon}
            size={threeBarLayout ? 20 : 24}
            color={theme.colors.onSecondaryContainer}
          />
          <Text
            style={{
              fontSize: threeBarLayout ? 18 : 20,
              fontWeight: 800,
              color: theme.colors.onSecondaryContainer,
            }}
          >
            {title}
          </Text>

          <View style={{ position: 'absolute', right: 0 }}>
            <RoundIconButton
              icon={expanded ? 'arrowUp' : 'arrowDown'}
              size={threeBarLayout ? 20 : 24}
              color={theme.colors.onSecondaryContainer}
              onPress={() => setExpanded(!expanded)}
            />
          </View>
        </View>
        {expanded && (
          <Text
            style={{
              marginLeft: 32,
              fontSize: threeBarLayout ? 14 : 16,
              fontWeight: 600,
              color: theme.colors.onSurface,
            }}
          >
            {description}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  )
}

function ConcreteSplitTypeCard({
  method,
  selectedMethod,
  onSelect,
}: {
  method: SplitMethod
  selectedMethod: SplitMethod
  onSelect: (method: SplitMethod) => void
}) {
  const { t } = useTranslation()

  switch (method) {
    case SplitMethod.Equal:
      return (
        <SplitTypeCard
          title={t('splitType.equalAmounts')}
          description={t('splitTypeDescription.equalAmounts')}
          icon='equal'
          selected={selectedMethod === SplitMethod.Equal}
          onSelect={() => onSelect(SplitMethod.Equal)}
        />
      )
    case SplitMethod.BalanceChanges:
      return (
        <SplitTypeCard
          title={t('splitType.balanceChanges')}
          description={t('splitTypeDescription.balanceChanges')}
          icon='barChart'
          selected={selectedMethod === SplitMethod.BalanceChanges}
          onSelect={() => onSelect(SplitMethod.BalanceChanges)}
        />
      )
    case SplitMethod.ExactAmounts:
      return (
        <SplitTypeCard
          title={t('splitType.exactAmounts')}
          description={t('splitTypeDescription.exactAmounts')}
          icon='exactAmount'
          selected={selectedMethod === SplitMethod.ExactAmounts}
          onSelect={() => onSelect(SplitMethod.ExactAmounts)}
        />
      )
    case SplitMethod.Lend:
      return (
        <SplitTypeCard
          title={t('splitType.lend')}
          description={t('splitTypeDescription.lend')}
          icon='payment'
          selected={selectedMethod === SplitMethod.Lend}
          onSelect={() => onSelect(SplitMethod.Lend)}
        />
      )
    case SplitMethod.Delayed:
      return (
        <SplitTypeCard
          title={t('splitType.delayed')}
          description={t('splitTypeDescription.delayed')}
          icon='schedule'
          selected={selectedMethod === SplitMethod.Delayed}
          onSelect={() => onSelect(SplitMethod.Delayed)}
        />
      )
    default:
      return null
  }
}

export default function Modal() {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const [selectedSplitType, setSelectedSplitType] = useState<SplitMethod>(SplitMethod.Equal)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitType')}
      maxWidth={500}
      opaque={false}
    >
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            gap: 16,
          }}
        >
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              paddingHorizontal: 12,
              color: theme.colors.onSurface,
              fontSize: threeBarLayout ? 24 : 28,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {t('splitType.selectType')}
          </Text>

          {SplitCreationContext.current.allowedSplitMethods.map((method) => (
            <ConcreteSplitTypeCard
              key={method}
              method={method}
              selectedMethod={selectedSplitType}
              onSelect={setSelectedSplitType}
            />
          ))}
        </ScrollView>

        <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }}>
          <Button
            title={t('form.buttonNext')}
            rightIcon='chevronForward'
            onPress={() => {
              SplitCreationContext.current.setSplitMethod(selectedSplitType)

              if (SplitCreationContext.current.shouldSkipDetailsStep()) {
                navigateToSplitSpecificFlow(Number(id), router)
              } else {
                router.navigate(`/group/${id}/addSplit/detailsStep`)
              }
            }}
          />
        </View>
      </View>
    </ModalScreen>
  )
}
