import Header from '@components/Header'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { ActivityIndicator, View } from 'react-native'

export default function NotFound() {
  const user = useAuth()
  const theme = useTheme()

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
      </View>
    </View>
  )
}
