import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAppLayout } from '@utils/dimensionUtils'
import { navigateToSplitSpecificFlow } from '@utils/navigateToSplitSpecificFlow'
import { AllSplitMethods, SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitMethod } from 'shared'

function Selector({ groupInfo }: { groupInfo: GroupUserInfo }) {
  const allowedInGroup = groupInfo.allowedSplitMethods
  const allowedInContext = SplitCreationContext.current.allowedSplitMethods
  const allowedSplitMethods = allowedInGroup.filter((method) => allowedInContext.includes(method))
  const canSplit = allowedSplitMethods.length > 0

  const disabledSplitMethods: SplitMethod[] =
    groupInfo.memberCount > 1
      ? []
      : AllSplitMethods.filter((method) => method !== SplitMethod.Delayed)

  const theme = useTheme()
  const threeBarLayout = useAppLayout()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const [selectedSplitType, setSelectedSplitType] = useState<SplitMethod | undefined>(
    allowedSplitMethods.filter((allowed) => !disabledSplitMethods.includes(allowed))[0] ??
      groupInfo.allowedSplitMethods.filter((allowed) => !disabledSplitMethods.includes(allowed))[0]
  )

  const confirmSelectedMethod = useCallback(
    (replace?: boolean) => {
      if (selectedSplitType === undefined) {
        return
      }

      SplitCreationContext.current.setSplitMethod(selectedSplitType)

      if (SplitCreationContext.current.shouldSkipDetailsStep()) {
        navigateToSplitSpecificFlow(groupInfo.id, router, replace)
      } else {
        if (replace) {
          router.replace(`/group/${groupInfo.id}/addSplit/detailsStep`)
        } else {
          router.navigate(`/group/${groupInfo.id}/addSplit/detailsStep`)
        }
      }
    },
    [selectedSplitType, groupInfo.id, router]
  )

  useEffect(() => {
    if (allowedSplitMethods.length === 1) {
      confirmSelectedMethod(true)
    }
  }, [allowedSplitMethods.length, confirmSelectedMethod])

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          gap: 16,
          justifyContent: canSplit ? 'flex-start' : 'center',
        }}
      >
        {canSplit && (
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              paddingHorizontal: 12,
              color: theme.colors.onSurface,
              fontSize: threeBarLayout ? 24 : 26,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {t('splitType.selectType')}
          </Text>
        )}

        {!canSplit && (
          <Text
            style={{
              paddingHorizontal: 12,
              color: theme.colors.onSurface,
              fontSize: threeBarLayout ? 24 : 28,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {t('splitType.noAllowedMethods')}
          </Text>
        )}

        <SplitMethodSelector
          displayedMethods={SplitCreationContext.current.allowedSplitMethods}
          allowedMethods={groupInfo.allowedSplitMethods}
          multiple={false}
          selectedMethod={selectedSplitType}
          onSelect={setSelectedSplitType}
          disabledMethods={disabledSplitMethods}
        />
      </ScrollView>

      {canSplit && (
        <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12, gap: 8 }}>
          {disabledSplitMethods.length > 0 && (
            <ErrorText translationKey='splitType.someSplitMethodsAreDisabled' />
          )}

          <Button
            disabled={selectedSplitType === undefined}
            title={t('form.buttonNext')}
            rightIcon='chevronForward'
            onPress={() => {
              confirmSelectedMethod(false)
            }}
          />
        </View>
      )}
    </View>
  )
}

export default function Modal() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.splitType')}>
      {!groupInfo && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
      )}
      {groupInfo && <Selector groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
