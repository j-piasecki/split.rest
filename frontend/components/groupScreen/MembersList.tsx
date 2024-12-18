import { MemberRow } from './MemberRow'
import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { GroupInfo } from 'shared'

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

export interface MembersListProps {
  info: GroupInfo | undefined
  iconOnly?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerComponent?: React.ComponentType<any> | React.ReactElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  footerComponent?: React.ComponentType<any> | React.ReactElement
}

export function MembersList({
  info,
  iconOnly,
  headerComponent,
  footerComponent,
}: MembersListProps) {
  const theme = useTheme()
  const router = useRouter()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const { members, isLoading, fetchNextPage, isFetchingNextPage } = useGroupMembers(info?.id)

  if (!info) {
    return null
  }

  const Header = (headerComponent ?? View) as JSX.ElementType

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          maxWidth: 768,
          width: '100%',
          alignSelf: 'center',
          paddingBottom: 88,
          paddingHorizontal: iconOnly ? 0 : 16,
        }}
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainer,
            }}
          >
            {isLoading && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {!isLoading && members.length === 0 && !iconOnly && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>{t('noMembers')}</Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id}
        renderItem={({ item: member }) => (
          <MemberRow member={member} info={info} iconOnly={iconOnly ?? false} />
        )}
        ItemSeparatorComponent={iconOnly ? undefined : Divider}
        ListHeaderComponent={
          <Header>
            {info.isAdmin && threeBarLayout ? (
              <View style={{ paddingVertical: 8, paddingHorizontal: iconOnly ? 8 : 16 }}>
                <Button
                  leftIcon='addMember'
                  title={iconOnly ? '' : t('addUser.addUser')}
                  onPress={() => {
                    router.navigate(`/group/${info.id}/addUser`)
                  }}
                />
              </View>
            ) : undefined}
          </Header>
        }
        ListFooterComponent={footerComponent}
      />

      {info.isAdmin && !threeBarLayout && (
        <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Button
            leftIcon='addMember'
            title={iconOnly ? '' : t('addUser.addUser')}
            onPress={() => {
              router.navigate(`/group/${info.id}/addUser`)
            }}
            style={() => ({ paddingVertical: 16 })}
          />
        </View>
      )}
    </View>
  )
}
