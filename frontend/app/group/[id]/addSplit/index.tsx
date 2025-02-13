import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { SplitType } from 'shared'

export default function Modal() {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitType')}
      maxWidth={500}
      opaque={false}
    >
      <View
        style={{
          flex: 1,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom,
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 24,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {t('splitType.selectType')}
        </Text>

        <View style={{ gap: 16 }}>
          <Button
            leftIcon='equal'
            title={t('splitType.equalAmounts')}
            onPress={() => {
              getSplitCreationContext().splitMethod = SplitMethod.Equal
              getSplitCreationContext().splitType = SplitType.Normal
              router.navigate(`/group/${id}/addSplit/detailsStep`)
            }}
          />
          <Button
            leftIcon='exactAmount'
            title={t('splitType.exactAmounts')}
            onPress={() => {
              getSplitCreationContext().splitMethod = SplitMethod.ExactAmounts
              getSplitCreationContext().splitType = SplitType.Normal
              router.navigate(`/group/${id}/addSplit/detailsStep`)
            }}
          />
        </View>
      </View>
    </ModalScreen>
  )
}
