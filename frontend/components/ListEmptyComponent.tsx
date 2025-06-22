import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { View } from 'react-native'

export interface ListEmptyComponentProps {
  isLoading: boolean
  loadingPlaceholder?: React.ReactNode
  emptyText?: string
}

export function ListEmptyComponent({
  isLoading,
  loadingPlaceholder,
  emptyText,
}: ListEmptyComponentProps) {
  const theme = useTheme()

  return (
    <View style={{}}>
      {isLoading && loadingPlaceholder}
      {!isLoading && (
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceContainer,
            borderRadius: 4,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          {emptyText && (
            <Text
              style={{
                color: theme.colors.outline,
                fontSize: 20,
                paddingVertical: 32,
                textAlign: 'center',
              }}
            >
              {emptyText}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}
