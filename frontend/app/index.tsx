import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'

// TODO: safe area

export default function Screen() {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
      }}
    >
      {Platform.OS !== 'web' && <Redirect href='/login' withAnchor />}

      <Text style={{ color: theme.colors.outline, fontSize: 18, textAlign: 'center' }}>
        (This is home screen)
      </Text>
      <Button
        title={t('signIn')}
        onPress={() => {
          router.navigate('/login')
        }}
        leftIcon='login'
      />
    </View>
  )
}
