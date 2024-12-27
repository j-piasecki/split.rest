import Header from '@components/Header'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { View } from 'react-native'

export default function NotFound() {
  const theme = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header showBackButton />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 48,
        }}
      >
        <Text style={{ color: theme.colors.outline, fontSize: 48 }}>{':('}</Text>
      </View>
    </View>
  )
}
