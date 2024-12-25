import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function Modal() {
  const theme = useTheme()
  const router = useRouter()
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
        style={{ flex: 1, paddingTop: 8, paddingHorizontal: 16, justifyContent: 'space-between' }}
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

        <View>
          <Button
            leftIcon='exactAmount'
            title={t('splitType.exactAmounts')}
            onPress={() => router.navigate(`/group/${id}/addSplit/exactAmounts`)}
          />
        </View>
      </View>
    </ModalScreen>
  )
}
