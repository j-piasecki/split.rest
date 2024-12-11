import { Button } from '@components/Button'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text, View } from 'react-native'

// TODO: safe area

export default function Screen() {
  const user = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()
  const { join } = useLocalSearchParams()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
      }}
    >
      {user === undefined && (
        <View>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
          <Text style={{ margin: 8, color: theme.colors.onSurface }}>
            {t('checkingIfYouAreLoggedIn')}
          </Text>
        </View>
      )}
      {user === null && (
        <Button
          title={t('signIn')}
          onPress={login}
          leftIcon={
            <MaterialIcons name='login' size={20} color={theme.colors.onPrimaryContainer} />
          }
        />
      )}
      {user && !join && <Redirect href='/home' withAnchor />}
      {user && join && <Redirect href={`/join/${join}`} withAnchor />}
    </View>
  )
}
