import { Button } from '@components/Button'
import { deleteSplit } from '@database/deleteSplit'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Text, View } from 'react-native'
import { GroupInfo, SplitInfo } from 'shared'

export interface SplitRowProps {
  split: SplitInfo
  info: GroupInfo | null
  forceReload: () => void
}

export function SplitRow({ split, info, forceReload }: SplitRowProps) {
  const user = useAuth()
  const theme = useTheme()

  return (
    <View
      key={split.id}
      style={{
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: theme.colors.outlineVariant,
        borderBottomWidth: 1,
      }}
    >
      <View style={{ flex: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
          {split.title}
        </Text>
      </View>
      <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
          {split.total} {info?.currency}
        </Text>
      </View>
      <View style={{ flex: 2, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, color: theme.colors.outline }}>
          {new Date(split.timestamp).toLocaleDateString()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {(split.paidById === user?.uid || info?.isAdmin) && (
          <Button
            leftIcon={
              <MaterialIcons name='delete' size={20} color={theme.colors.onPrimaryContainer} />
            }
            onPress={() => {
              if (info) {
                deleteSplit(info.id, split.id)
                  .then(forceReload)
                  .catch((e) => {
                    alert(e.message)
                  })
              }
            }}
          />
        )}
      </View>
    </View>
  )
}
