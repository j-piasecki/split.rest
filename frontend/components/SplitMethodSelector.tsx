import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import { SplitMethod } from 'shared'

const OrderedSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.BalanceChanges,
  SplitMethod.Lend,
  SplitMethod.Delayed,
]

const SplitTypeCard = ({
  title,
  description,
  icon,
  selected,
  onSelect,
  startExpanded,
}: {
  title: string
  description: string
  icon: IconName
  selected: boolean
  startExpanded: boolean
  onSelect: () => void
}) => {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(startExpanded)

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
  selectedMethods,
  onSelect,
  startExpanded = true,
}: {
  method: SplitMethod
  selectedMethods: SplitMethod[]
  onSelect: (method: SplitMethod) => void
  startExpanded?: boolean
}) {
  const { t } = useTranslation()

  switch (method) {
    case SplitMethod.Equal:
      return (
        <SplitTypeCard
          title={t('splitType.equalAmounts')}
          description={t('splitTypeDescription.equalAmounts')}
          icon='equal'
          selected={selectedMethods.includes(SplitMethod.Equal)}
          onSelect={() => onSelect(SplitMethod.Equal)}
          startExpanded={startExpanded}
        />
      )
    case SplitMethod.BalanceChanges:
      return (
        <SplitTypeCard
          title={t('splitType.balanceChanges')}
          description={t('splitTypeDescription.balanceChanges')}
          icon='barChart'
          selected={selectedMethods.includes(SplitMethod.BalanceChanges)}
          onSelect={() => onSelect(SplitMethod.BalanceChanges)}
          startExpanded={startExpanded}
        />
      )
    case SplitMethod.ExactAmounts:
      return (
        <SplitTypeCard
          title={t('splitType.exactAmounts')}
          description={t('splitTypeDescription.exactAmounts')}
          icon='exactAmount'
          selected={selectedMethods.includes(SplitMethod.ExactAmounts)}
          onSelect={() => onSelect(SplitMethod.ExactAmounts)}
          startExpanded={startExpanded}
        />
      )
    case SplitMethod.Lend:
      return (
        <SplitTypeCard
          title={t('splitType.lend')}
          description={t('splitTypeDescription.lend')}
          icon='payment'
          selected={selectedMethods.includes(SplitMethod.Lend)}
          onSelect={() => onSelect(SplitMethod.Lend)}
          startExpanded={startExpanded}
        />
      )
    case SplitMethod.Delayed:
      return (
        <SplitTypeCard
          title={t('splitType.delayed')}
          description={t('splitTypeDescription.delayed')}
          icon='schedule'
          selected={selectedMethods.includes(SplitMethod.Delayed)}
          onSelect={() => onSelect(SplitMethod.Delayed)}
          startExpanded={startExpanded}
        />
      )
    default:
      return null
  }
}

interface BaseSplitMethodSelectorProps {
  displayedMethods: SplitMethod[]
  allowedMethods: SplitMethod[]
  startExpanded?: boolean
}

interface SingleSplitMethodSelectorProps extends BaseSplitMethodSelectorProps {
  multiple: false
  selectedMethod: SplitMethod
  onSelect: (method: SplitMethod) => void
}

interface MultipleSplitMethodSelectorProps extends BaseSplitMethodSelectorProps {
  multiple: true
  selectedMethods: SplitMethod[]
  onSelectionChange: (methods: SplitMethod[]) => void
}

export type SplitMethodSelectorProps =
  | SingleSplitMethodSelectorProps
  | MultipleSplitMethodSelectorProps

export function SplitMethodSelector(props: SplitMethodSelectorProps) {
  const selectedMethods = props.multiple ? props.selectedMethods : [props.selectedMethod]

  function onSelect(method: SplitMethod) {
    if (props.multiple) {
      const newSelectedMethods = selectedMethods.includes(method)
        ? selectedMethods.filter((m) => m !== method)
        : [...selectedMethods, method]
      props.onSelectionChange(newSelectedMethods)
    } else {
      props.onSelect(method)
    }
  }

  return (
    <View style={{ gap: 16 }}>
      {OrderedSplitMethods.filter(
        (method) => props.displayedMethods.includes(method) && props.allowedMethods.includes(method)
      ).map((method) => (
        <ConcreteSplitTypeCard
          key={method}
          method={method}
          selectedMethods={selectedMethods}
          onSelect={onSelect}
          startExpanded={props.startExpanded}
        />
      ))}
    </View>
  )
}
