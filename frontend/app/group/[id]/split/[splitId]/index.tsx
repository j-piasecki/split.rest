import { Button } from '@components/Button'
import { Icon, IconName } from '@components/Icon'
import Modal from '@components/ModalScreen'
import { Text } from '@components/Text'
import { Pane } from '@components/groupScreen/Pane'
import { getUserById } from '@database/getUserById'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSplitHistory } from '@hooks/database/useSplitHistory'
import { useTheme } from '@styling/theme'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Platform, ScrollView, View } from 'react-native'
import {
  GroupInfo,
  LanguageTranslationKey,
  SplitWithUsers,
  User,
  UserWithBalanceChange,
} from 'shared'

function UserRow({
  user,
  groupInfo,
  splitInfo,
  last = false,
}: {
  user: UserWithBalanceChange
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo | undefined
  last?: boolean
}) {
  const theme = useTheme()

  const paidByThis = splitInfo.paidById === user.id
  let paidInThisSplit = user.change

  if (paidByThis) {
    const total = Number(splitInfo.total)
    const remainder = total - Number(paidInThisSplit)

    paidInThisSplit = `${remainder.toFixed(2)}`
  } else {
    paidInThisSplit = paidInThisSplit.substring(1)
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <Image
        source={{ uri: getProfilePictureUrl(user.id) }}
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: paidByThis ? theme.colors.primary : theme.colors.onSurface,
            fontSize: 20,
            fontWeight: paidByThis ? 700 : 400,
          }}
        >
          {user.name}
        </Text>
        <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{user.email}</Text>
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
        {paidInThisSplit} {groupInfo?.currency}
      </Text>
    </View>
  )
}

interface EditInfoTextProps {
  icon: IconName
  translationKey: LanguageTranslationKey
  values: Record<string, string>
  image?: string
}

function IconInfoText({ icon, translationKey, values, image }: EditInfoTextProps) {
  const theme = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
      <Icon name={icon} size={20} color={theme.colors.outline} style={{ marginRight: 12 }} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 20, height: 20, borderRadius: 10, marginRight: 8 }}
        />
      )}
      <Text style={{ color: theme.colors.onSurface, fontSize: 18, flex: 1 }}>
        <Trans
          i18nKey={translationKey}
          values={values}
          components={{ Styled: <Text style={{ color: theme.colors.primary, fontWeight: 600 }} /> }}
        />
      </Text>
    </View>
  )
}

function EditInfo({ splitInfo }: { splitInfo: SplitWithUsers }) {
  const { t } = useTranslation()
  const [createdBy, setCreatedBy] = useState<User | null>(null)

  useEffect(() => {
    getUserById(splitInfo.createdById).then(setCreatedBy)
  }, [splitInfo.createdById])

  if (splitInfo.version === 1) {
    return (
      <Pane
        icon='editAlt'
        title={t('splitInfo.authorInfo')}
        textLocation='start'
        containerStyle={{ padding: 16, paddingTop: 12 }}
        collapsible
        startCollapsed
      >
        <IconInfoText
          icon='calendar'
          translationKey='splitInfo.createTimeText'
          values={{ date: new Date(splitInfo.updatedAt).toLocaleString() }}
        />
        {createdBy && (
          <IconInfoText
            icon='edit'
            translationKey='splitInfo.createAuthorText'
            values={{ editor: createdBy.name }}
          />
        )}
      </Pane>
    )
  }

  return (
    <Pane
      icon='editAlt'
      title={t('splitInfo.editInfo')}
      textLocation='start'
      containerStyle={{ padding: 16, paddingTop: 12 }}
      collapsible
      startCollapsed
    >
      {createdBy && (
        <IconInfoText
          icon='edit'
          translationKey='splitInfo.editAuthorText'
          values={{ editor: createdBy.name }}
          image={getProfilePictureUrl(createdBy.id)}
        />
      )}
      <IconInfoText
        icon='calendar'
        translationKey='splitInfo.editTimeText'
        values={{ date: new Date(splitInfo.updatedAt).toLocaleString() }}
      />
      <IconInfoText
        icon='tag'
        translationKey='splitInfo.versionText'
        // I started versioning at 1, for some reason?
        values={{ version: (splitInfo.version - 1).toString() }}
      />
    </Pane>
  )
}

function SplitInfo({ splitInfo, groupInfo }: { splitInfo: SplitWithUsers; groupInfo: GroupInfo }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const paidBy = splitInfo.users.find((user) => user.id === splitInfo.paidById)!

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 16 }}>
        <Pane
          icon='receipt'
          title={t('splitInfo.details')}
          textLocation='start'
          containerStyle={{ padding: 16, paddingTop: 12 }}
          collapsible
        >
          <Text style={{ color: theme.colors.onSurface, fontSize: 24, marginBottom: 8 }}>
            {splitInfo.title}
          </Text>

          <IconInfoText
            icon='currency'
            translationKey='splitInfo.hasPaidText'
            values={{ payer: paidBy.name, amount: splitInfo.total, currency: groupInfo.currency }}
            image={getProfilePictureUrl(paidBy.id)}
          />
          <IconInfoText
            icon='calendar'
            translationKey='splitInfo.splitTimeText'
            values={{ date: new Date(splitInfo.timestamp).toLocaleString() }}
          />
        </Pane>

        <EditInfo splitInfo={splitInfo} />

        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ paddingBottom: 16, paddingTop: 8 }}
          collapsible
        >
          {splitInfo.users.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              groupInfo={groupInfo}
              splitInfo={splitInfo}
              last={index === splitInfo.users.length - 1}
            />
          ))}
        </Pane>
      </View>
    </ScrollView>
  )
}

export default function SplitInfoScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { id, splitId } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(groupInfo?.id)
  const {
    history,
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    fetchNextPage,
  } = useSplitHistory(Number(id), Number(splitId))
  const [maxWidth, setMaxWidth] = useState(500)

  const userScrollRef = useRef(false)
  const scrollContentWidth = useRef(0)

  return (
    <Modal
      title={t('screenName.splitInfo')}
      returnPath={`/group/${id}`}
      maxWidth={500}
      onLayout={(e) => {
        setMaxWidth(e.nativeEvent.layout.width)
      }}
    >
      {(isLoadingHistory || groupInfo === undefined) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
        </View>
      )}

      {(isLoadingHistory || groupInfo === null) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
            {t('splitInfo.splitNotFound')}
          </Text>
        </View>
      )}

      {!isLoadingHistory && groupInfo && (
        <>
          {/* Paginated horizontal flatlist breaks vertical scroll on web */}
          {Platform.OS !== 'web' && (
            <FlatList
              // inverted flatlist breaks pagination on web, so we use scaleX to flip it
              // this reverses scroll direction on web but I guess it's better than not working at all
              horizontal
              style={{ transform: [{ scaleX: -1 }] }}
              data={history}
              keyExtractor={(item) => `${item.version}`}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!isFetchingNextPage) {
                  fetchNextPage()
                }
              }}
              renderItem={({ item }) => (
                <View style={{ width: maxWidth, transform: [{ scaleX: -1 }] }}>
                  <SplitInfo splitInfo={item} groupInfo={groupInfo} />
                </View>
              )}
              scrollEventThrottle={250}
              onScroll={() => {
                userScrollRef.current = true
              }}
              ref={(ref) => {
                if (history.length > 0) {
                  // TODO: this is kinda scuffed (and doesn't work on web), should probably figure out something better
                  setTimeout(() => {
                    if (!userScrollRef.current) {
                      ref?.scrollToOffset({ offset: 30, animated: true })

                      setTimeout(() => {
                        ref?.scrollToIndex({ index: 0, animated: true })
                      }, 200)
                    }
                  }, 1000)
                }
              }}
            />
          )}

          {Platform.OS === 'web' && (
            <ScrollView
              horizontal
              style={{ transform: [{ scaleX: -1 }] }}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onContentSizeChange={(width) => {
                scrollContentWidth.current = width
              }}
              scrollEventThrottle={250}
              onScroll={(e) => {
                userScrollRef.current = true

                if (
                  e.nativeEvent.contentOffset.x / scrollContentWidth.current > 0.5 &&
                  !isFetchingNextPage
                ) {
                  fetchNextPage()
                }
              }}
              ref={(ref) => {
                if (history.length > 0) {
                  // TODO: this is kinda scuffed (and doesn't work on web), should probably figure out something better
                  setTimeout(() => {
                    if (!userScrollRef.current) {
                      ref?.scrollTo({ x: 30, animated: true })

                      setTimeout(() => {
                        ref?.scrollTo({ x: 0, animated: true })
                      }, 200)
                    }
                  }, 1000)
                }
              }}
            >
              {history.map((split) => (
                <View style={{ flex: 1, width: maxWidth, transform: [{ scaleX: -1 }] }}>
                  <SplitInfo splitInfo={split} groupInfo={groupInfo} />
                </View>
              ))}
            </ScrollView>
          )}

          {permissions?.canUpdateSplit(history[0]) && (
            <Button
              title={t('splitInfo.edit')}
              style={{ marginHorizontal: 16 }}
              leftIcon='edit'
              onPress={() => router.navigate(`/group/${groupInfo?.id}/split/${history[0].id}/edit`)}
            />
          )}
        </>
      )}
    </Modal>
  )
}
