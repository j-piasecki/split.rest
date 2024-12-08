import { Button } from '@components/Button'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { Redirect } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'

// TODO: safe area

export default function Screen() {
  const user = useAuth()
  const theme = useTheme()

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
            Checking if you're logged in
          </Text>
        </View>
      )}
      {user === null && (
        <Button
          title='Login'
          onPress={login}
          leftIcon={
            <MaterialIcons name='login' size={20} color={theme.colors.onPrimaryContainer} />
          }
        />
      )}
      {user && <Redirect href='/home' withAnchor />}
    </View>
  )
}
