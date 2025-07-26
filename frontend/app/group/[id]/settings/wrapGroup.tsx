import { Button } from '@components/Button'
import { Icon, IconName } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSetGroupLockedMutation } from '@hooks/database/useSetGroupLocked'
import { useSettleUpGroup } from '@hooks/database/useSettleUpGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { sleep } from '@utils/sleep'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useReducer, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitType, isTranslatableError } from 'shared'

enum WrapStep {
  LockingGroup = 'LockingGroup',
  UnlockingGroup = 'UnlockingGroup',
  CheckingDelayedSplits = 'CheckingDelayedSplits',
  DelayedSplitsChoice = 'DelayedSplitsChoice',
  SettlingUp = 'SettlingUp',
  Completed = 'Completed',
  Error = 'Error',
}

interface StepStatus {
  step: WrapStep
  loading: boolean
  completed: boolean
  title: string
  description?: string
}

interface WrapState {
  steps: StepStatus[]
}

interface WrapAction {
  type: 'START_STEP' | 'UPDATE_STEP' | 'COMPLETE_STEP' | 'ERROR_STEP'
  step: WrapStep
  title?: string
  description?: string
  loading?: boolean
}

function wrapReducer(state: WrapState, action: WrapAction): WrapState {
  switch (action.type) {
    case 'START_STEP':
      if (!action.title) {
        throw new Error('Title is required when starting a step')
      }

      return {
        ...state,
        steps: [
          ...state.steps,
          {
            step: action.step,
            loading: action.loading ?? false,
            completed: false,
            title: action.title,
            description: action.description,
          },
        ],
      }
    case 'UPDATE_STEP':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.step === action.step ? { ...step, description: action.description } : step
        ),
      }
    case 'COMPLETE_STEP':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.step === action.step
            ? { ...step, description: action.description, completed: true, loading: false }
            : step
        ),
      }
    case 'ERROR_STEP':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.step === action.step
            ? {
                ...step,
                step: WrapStep.Error,
                loading: false,
                completed: true,
                description: action.description,
              }
            : step
        ),
      }
  }
}

function useWrapGroup() {
  const [state, updateState] = useReducer<WrapState, [WrapAction]>(wrapReducer, {
    steps: [],
  })

  return [state, updateState] as const
}

function StepComponent({
  status,
  isCurrentStep,
  index,
  confirmTitle,
  confirmIcon,
  cancelTitle,
  cancelIcon,
  onConfirm,
  onCancel,
}: {
  status: StepStatus
  isCurrentStep: boolean
  index: number
  confirmTitle?: string
  confirmIcon?: IconName
  cancelTitle?: string
  cancelIcon?: IconName
  onConfirm?: () => void
  onCancel?: () => void
}) {
  const theme = useTheme()
  const stepTitle = status.title

  const contentColor =
    status.step === WrapStep.Error
      ? theme.colors.error
      : isCurrentStep
        ? theme.colors.primary
        : theme.colors.onSurface

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: status.completed
              ? theme.colors.transparent
              : isCurrentStep
                ? status.loading
                  ? theme.colors.transparent
                  : theme.colors.primary
                : theme.colors.outline,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status.completed ? (
            <Icon
              name={status.step === WrapStep.Error ? 'close' : 'check'}
              size={20}
              color={contentColor}
            />
          ) : isCurrentStep && status.loading ? (
            <ActivityIndicator size='small' color={contentColor} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.onPrimary }}>
              {index + 1}
            </Text>
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: contentColor }}>
            {stepTitle}
          </Text>
          {status.description && (
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 20,
                color: contentColor,
              }}
            >
              {status.description}
            </Text>
          )}
        </View>
      </View>

      {isCurrentStep && !status.loading && (onConfirm || onCancel) && (
        <View
          style={{
            paddingLeft: 48,
            marginTop: 8,
            gap: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {onConfirm && (
            <Button
              title={confirmTitle}
              leftIcon={confirmIcon || 'check'}
              style={{ flex: 1 }}
              onPress={onConfirm}
            />
          )}
          {onCancel && (
            <Button
              title={cancelTitle}
              leftIcon={cancelIcon || 'close'}
              pressableStyle={{ paddingHorizontal: 4 }}
              onPress={onCancel}
            />
          )}
        </View>
      )}
    </View>
  )
}

export function WrapGroupContent({ groupInfo }: { groupInfo: GroupUserInfo }) {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const groupId = Number(id)
  const router = useRouter()
  const insets = useModalScreenInsets()

  const [state, updateState] = useWrapGroup()
  const currentStep = state.steps[state.steps.length - 1]

  const groupBeganLocked = useMemo(() => groupInfo.locked, [])

  const { mutateAsync: setGroupLocked } = useSetGroupLockedMutation(groupId)
  const { mutateAsync: settleUpGroup } = useSettleUpGroup(groupId)

  const {
    splits: delayedSplits,
    isLoading: isLoadingDelayedSplits,
    isRefetching: isRefetchingDelayedSplits,
  } = useGroupSplitsQuery(groupId, {
    splitTypes: [SplitType.Delayed],
  })
  const hasDelayedSplits = delayedSplits.length > 0

  const hasDelayedSplitsRef = useRef(hasDelayedSplits)
  const isLoadingDelayedSplitsRef = useRef(isLoadingDelayedSplits)
  const isRefetchingDelayedSplitsRef = useRef(isRefetchingDelayedSplits)

  useEffect(() => {
    hasDelayedSplitsRef.current = hasDelayedSplits
    isLoadingDelayedSplitsRef.current = isLoadingDelayedSplits
    isRefetchingDelayedSplitsRef.current = isRefetchingDelayedSplits
  }, [hasDelayedSplits, isLoadingDelayedSplits, isRefetchingDelayedSplits])

  async function settleUpStep() {
    updateState({
      type: 'START_STEP',
      step: WrapStep.SettlingUp,
      description: t('groupSettings.wrapGroup.settlingUp'),
      title: t('groupSettings.wrapGroup.settlingUp'),
      loading: true,
    })
    try {
      await sleep(500)
      await settleUpGroup()
      updateState({
        type: 'COMPLETE_STEP',
        step: WrapStep.SettlingUp,
        description: t('groupSettings.wrapGroup.settledUp'),
      })
      return true
    } catch (error) {
      updateState({
        type: 'ERROR_STEP',
        step: WrapStep.SettlingUp,
        description: isTranslatableError(error) ? t(error.message, error.args) : t('unknownError'),
      })
      return false
    }
  }

  async function beginFlow() {
    updateState({
      type: 'START_STEP',
      step: WrapStep.LockingGroup,
      title: t('groupSettings.wrapGroup.lockingGroup'),
      loading: true,
    })
    try {
      await sleep(500)
      await setGroupLocked(true)
      updateState({
        type: 'COMPLETE_STEP',
        step: WrapStep.LockingGroup,
        description: t('groupSettings.wrapGroup.groupLocked'),
      })
    } catch (error) {
      updateState({
        type: 'ERROR_STEP',
        step: WrapStep.LockingGroup,
        description: isTranslatableError(error) ? t(error.message, error.args) : t('unknownError'),
      })
      return
    }

    updateState({
      type: 'START_STEP',
      step: WrapStep.CheckingDelayedSplits,
      title: t('groupSettings.wrapGroup.checkingDelayedSplits'),
      loading: true,
    })
    do {
      await sleep(500)
    } while (isLoadingDelayedSplitsRef.current || isRefetchingDelayedSplitsRef.current)
    updateState({
      type: 'COMPLETE_STEP',
      step: WrapStep.CheckingDelayedSplits,
      description: hasDelayedSplits
        ? t('groupSettings.wrapGroup.delayedSplitsFound')
        : t('groupSettings.wrapGroup.noDelayedSplitsFound'),
    })

    if (hasDelayedSplits) {
      updateState({
        type: 'START_STEP',
        step: WrapStep.DelayedSplitsChoice,
        title: t('groupSettings.wrapGroup.resolveDelayedSplitsChoice'),
      })
      return
    }

    if (await settleUpStep()) {
      updateState({
        type: 'START_STEP',
        step: WrapStep.Completed,
        title: t('groupSettings.wrapGroup.completed'),
        description: t('groupSettings.wrapGroup.completedDescription'),
      })
      updateState({ type: 'COMPLETE_STEP', step: WrapStep.Completed })
    }
  }

  async function resumeAfterDelayedSplits() {
    if (isRefetchingDelayedSplitsRef.current) {
      updateState({
        type: 'UPDATE_STEP',
        step: WrapStep.CheckingDelayedSplits,
        description: t('groupSettings.wrapGroup.checkingDelayedSplits'),
        loading: true,
      })
      do {
        await sleep(500)
      } while (isRefetchingDelayedSplitsRef.current)
    }

    if (hasDelayedSplitsRef.current) {
      updateState({
        type: 'ERROR_STEP',
        step: WrapStep.DelayedSplitsChoice,
        description: t('groupSettings.wrapGroup.delayedSplitsNotResolved'),
      })
      return
    }

    updateState({ type: 'COMPLETE_STEP', step: WrapStep.DelayedSplitsChoice })

    if (await settleUpStep()) {
      updateState({
        type: 'START_STEP',
        step: WrapStep.Completed,
        title: t('groupSettings.wrapGroup.completed'),
        description: t('groupSettings.wrapGroup.completedDescription'),
      })
      updateState({ type: 'COMPLETE_STEP', step: WrapStep.Completed })
    }
  }

  async function delayedSplitsNotResolved() {
    updateState({
      type: 'ERROR_STEP',
      step: WrapStep.DelayedSplitsChoice,
      description: t('groupSettings.wrapGroup.delayedSplitsNotResolved'),
    })

    if (!groupBeganLocked) {
      updateState({
        type: 'START_STEP',
        step: WrapStep.UnlockingGroup,
        description: t('groupSettings.wrapGroup.unlockingGroup'),
        title: t('groupSettings.wrapGroup.unlockingGroup'),
        loading: true,
      })
      try {
        await sleep(200)
        await setGroupLocked(false)
        updateState({
          type: 'COMPLETE_STEP',
          step: WrapStep.UnlockingGroup,
          description: t('groupSettings.wrapGroup.groupUnlocked'),
        })
      } catch (error) {
        updateState({
          type: 'ERROR_STEP',
          step: WrapStep.UnlockingGroup,
          description: isTranslatableError(error)
            ? t(error.message, error.args)
            : t('unknownError'),
        })
      }
    }
  }

  useEffect(() => {
    beginFlow()
  }, [])

  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentStep?.step === WrapStep.DelayedSplitsChoice) {
        if (isRefetchingDelayedSplitsRef.current || !hasDelayedSplitsRef.current) {
          resumeAfterDelayedSplits()
        } else if (hasDelayedSplitsRef.current) {
          delayedSplitsNotResolved()
        }
      }
    })

    return unsubscribe
  }, [currentStep])

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom + 12 }}>
      <ScrollView
        contentContainerStyle={{
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
          gap: 12,
        }}
      >
        {state.steps.map((step, index) => (
          <StepComponent
            key={step.step}
            index={index}
            status={step}
            isCurrentStep={index === state.steps.length - 1}
            confirmIcon={step.step === WrapStep.DelayedSplitsChoice ? 'chronic' : undefined}
            confirmTitle={
              step.step === WrapStep.DelayedSplitsChoice
                ? t('groupSettings.wrapGroup.resolveDelayedSplits')
                : undefined
            }
            onConfirm={
              step.step === WrapStep.DelayedSplitsChoice
                ? () => {
                    router.navigate(`/group/${groupId}/settings/resolveDelayed?showToast=false`)
                  }
                : undefined
            }
            onCancel={
              step.step === WrapStep.DelayedSplitsChoice
                ? () => {
                    delayedSplitsNotResolved()
                  }
                : undefined
            }
          />
        ))}
      </ScrollView>
      {currentStep !== undefined &&
        (currentStep.step === WrapStep.Completed || currentStep.step === WrapStep.Error) && (
          <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }}>
            <Button
              title={t('groupSettings.wrapGroup.goBack')}
              leftIcon='chevronBack'
              onPress={() => {
                if (router.canGoBack()) {
                  router.back()
                } else {
                  router.replace(`/group/${groupId}/settings`)
                }
              }}
            />
          </View>
        )}
    </View>
  )
}

export default function WrapGroup() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}/settings`}
      title={t('groupSettings.wrapItUp')}
      maxWidth={500}
      maxHeight={700}
      opaque={false}
    >
      {groupInfo && <WrapGroupContent groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
