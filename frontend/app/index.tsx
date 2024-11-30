import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { Redirect } from 'expo-router'
import { ActivityIndicator, Button, Text, View } from 'react-native'

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
      {user === null && <Button title='Login' onPress={login} />}
      {user && <Redirect href='/home' withAnchor />}
    </View>
  )
}
