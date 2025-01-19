import { Button } from '@components/Button'
import Header from '@components/Header'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function NotFound() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header showBackButton />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 128,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontSize: 64, opacity: 0.5 }}>{'😞'}</Text>
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 600 }}>
          {t('youSeemLost')}
        </Text>
        <Button
          leftIcon='chevronBack'
          title={t('goBack')}
          style={{ marginTop: 16 }}
          onPress={() => {
            router.replace('/home')
          }}
        />
      </View>
    </View>
  )
}
