import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { Text } from '@components/Text'
import { useGroupSettings } from '@hooks/database/useGroupSettings'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { navigateToSplitSpecificFlow } from '@utils/navigateToSplitSpecificFlow'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { SplitMethod } from 'shared'

export default function Modal() {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: settings } = useGroupSettings(Number(id))
  const [selectedSplitType, setSelectedSplitType] = useState<SplitMethod>(SplitMethod.Equal)

  const allowedInGroup = settings?.allowedSplitMethods
  const allowedInContext = SplitCreationContext.current.allowedSplitMethods
  const canSplit = !!allowedInGroup?.some((method) => allowedInContext.includes(method))

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
                fontSize: threeBarLayout ? 24 : 28,
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
            allowedMethods={settings?.allowedSplitMethods ?? []}
            multiple={false}
            selectedMethod={selectedSplitType}
            onSelect={setSelectedSplitType}
          />
        </ScrollView>

        {canSplit && (
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
        )}
      </View>
    </ModalScreen>
  )
}
