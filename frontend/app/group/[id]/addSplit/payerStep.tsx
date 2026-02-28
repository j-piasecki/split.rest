import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RouletteResultRow } from '@components/RouletteResultRow'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useRouletteQuery } from '@hooks/useRouletteQuery'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Member } from 'shared'

interface PayerRowProps {
  user: Member
  isLast: boolean
  isSelected: boolean
  onSelect: () => void
}

function PayerRow({ user, isLast, isSelected, onSelect }: PayerRowProps) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hover, setHover] = useState(false)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: theme.colors.surfaceContainerHighest,
      opacity: withTiming(isSelected ? 1 : pressed ? 0.5 : hover ? 0.3 : 0, { duration: 200 }),
    }
  })

  return (
    <View
      style={{
        overflow: 'hidden',
        backgroundColor: theme.colors.surfaceContainer,
        borderRadius: 4,
        borderBottomLeftRadius: isLast ? 16 : 4,
        borderBottomRightRadius: isLast ? 16 : 4,
        marginBottom: 2,
      }}
    >
      <Pressable
        onPress={onSelect}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          gap: 12,
        }}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            flex: 1,
          }}
        >
          <ProfilePicture user={user} size={32} />

          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.colors.onSurface,
              }}
            >
              {user.displayName ?? user.name}
            </Text>

            {user.displayName && (
              <Text
                numberOfLines={1}
                style={{ fontSize: 12, fontWeight: 600, color: theme.colors.outline }}
              >
                {user.name}
              </Text>
            )}
          </View>
        </View>
        <Icon name='check' size={24} color={isSelected ? theme.colors.onSurface : 'transparent'} />
      </Pressable>
    </View>
  )
}

export default function Modal() {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const user = useAuth()

  const participants = SplitCreationContext.current.participants

  const creatorIsParticipant = participants?.some((p) => p.user.id === user?.id)

  const initialPayer =
    SplitCreationContext.current.paidByIndex !== undefined
      ? participants?.[SplitCreationContext.current.paidByIndex]?.user?.id
      : creatorIsParticipant
        ? user?.id
        : undefined

  const [selectedPayerId, setSelectedPayerId] = useState<string | undefined>(initialPayer)
  const [error, setError] = useState<string | null>(null)

  const [isRouletteActive, setIsRouletteActive] = useState(false)
  const { data: groupInfo } = useGroupInfo(Number(id))
  const canAccessRoulette = groupInfo?.permissions?.canAccessRoulette?.() ?? false

  const rouletteQuery = useMemo(() => {
    if (!participants) {
      return []
    }
    return participants.map((p) => ({ user: p.user, entry: p.user.email ?? '' }))
  }, [participants])

  const {
    error: rouletteError,
    result: rouletteResult,
    finished: rouletteFinished,
    start: startRoulette,
  } = useRouletteQuery(Number(id), rouletteQuery)

  useEffect(() => {
    if (rouletteError) {
      alert(rouletteError)
      setIsRouletteActive(false)
    }
  }, [rouletteError])

  useEffect(() => {
    if (!participants || participants.length === 0) {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace(`/group/${id}`)
      }
    }
  }, [id, router, participants])

  useEffect(() => {
    if (isRouletteActive && rouletteFinished && rouletteResult.length > 0 && rouletteResult[0]) {
      setSelectedPayerId(rouletteResult[0].id)
    }
  }, [isRouletteActive, rouletteFinished, rouletteResult])

  const submit = () => {
    if (!selectedPayerId) {
      setError(t('payerStep.noPayerSelected'))
      return
    }

    SplitCreationContext.current.setPaidById(selectedPayerId)
    router.navigate(`/group/${id}/addSplit/summary`)
  }

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.payerStep')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
    >
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
          }}
        >
          <View style={{ paddingBottom: 8 }}>
            {!isRouletteActive && (
              <FullPaneHeader
                icon='payments'
                title={t('payerStep.selectPayer')}
                textLocation='start'
              />
            )}
            {isRouletteActive && groupInfo
              ? rouletteResult.map((u, index) => (
                  <RouletteResultRow
                    key={u?.id ?? `header-${index}`}
                    user={u}
                    index={index}
                    result={rouletteResult}
                    groupInfo={groupInfo}
                    isSelected={u?.id === selectedPayerId}
                    onSelect={
                      u
                        ? () => {
                            setSelectedPayerId(u.id)
                            setError(null)
                          }
                        : undefined
                    }
                  />
                ))
              : participants?.map((p, index) => (
                  <PayerRow
                    key={p.user.id}
                    user={p.user}
                    isLast={index === participants.length - 1}
                    isSelected={p.user.id === selectedPayerId}
                    onSelect={() => {
                      setSelectedPayerId(p.user.id)
                      setError(null)
                    }}
                  />
                ))}
          </View>
        </ScrollView>

        <View style={{ gap: 16, paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }}>
          {error && <ErrorText>{error}</ErrorText>}
          {!isRouletteActive && canAccessRoulette && groupInfo ? (
            <Button
              leftIcon='casino'
              title={t('screenName.roulette')}
              style={{ backgroundColor: theme.colors.secondaryContainer }}
              foregroundColor={theme.colors.onSecondaryContainer}
              onPress={() => {
                setIsRouletteActive(true)
                setSelectedPayerId(undefined)
                startRoulette()
              }}
            />
          ) : null}
          <Button
            rightIcon='chevronForward'
            title={t('payerStep.confirm')}
            onPress={submit}
            disabled={isRouletteActive && !rouletteFinished}
          />
        </View>
      </View>
    </ModalScreen>
  )
}
