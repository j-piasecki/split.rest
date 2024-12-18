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

export interface MembersListProps {
  info: GroupInfo | undefined
  iconOnly?: boolean
}

export function MembersList({ info, iconOnly }: MembersListProps) {
  const theme = useTheme()
  const router = useRouter()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const { members, isLoading, fetchNextPage, isFetchingNextPage } = useGroupMembers(info?.id)

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          flex: !members?.length ? 1 : undefined,
          maxWidth: 768,
          width: '100%',
          alignSelf: 'center',
          paddingBottom: 88,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
        ListHeaderComponent={
          info.isAdmin && threeBarLayout ? (
            <View style={{ paddingVertical: 8, paddingHorizontal: iconOnly ? 8 : 16 }}>
              <Button
                leftIcon='addMember'
                title={iconOnly ? '' : t('addUser.addUser')}
                onPress={() => {
                  router.navigate(`/group/${info.id}/addUser`)
                }}
              />
            </View>
          ) : undefined
        }
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
