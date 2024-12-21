import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { GroupInfoPage } from '@components/groupScreen/GroupInfoPage'
import { MembersList } from '@components/groupScreen/MembersList'
import { Pane, PaneHeader } from '@components/groupScreen/Pane'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { measure } from '@utils/measure'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { GroupInfo } from 'shared'

function MembersButton({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { members } = useGroupMembers(info?.id)
  const iconsRef = useRef<View>(null)
  const [iconsToShow, setIconsToShow] = useState(20)
  const { width } = useWindowDimensions()

  useLayoutEffect(() => {
    const singleIconWidth = 28
    const width = measure(iconsRef).width

    setIconsToShow(Math.floor(width / singleIconWidth))
  }, [width])

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? theme.colors.surfaceContainerHigh
          : theme.colors.surfaceContainer,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 24,
        overflow: 'hidden',
      })}
      onPress={() => {
        router.navigate(`/group/${info?.id}/members`)
      }}
    >
      <PaneHeader
        icon='members'
        title={t('tabs.members')}
        showSeparator={false}
        textLocation='start'
        rightComponent={
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <View
              ref={iconsRef}
              style={{
                flex: 1,
                height: 40,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              {members.slice(0, iconsToShow).map((member, index) => {
                return (
                  <View
                    key={member.id}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: theme.colors.surfaceContainer,
                      transform: [{ translateX: index * 8 }],
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      source={{ uri: getProfilePictureUrl(member.id) }}
                      style={{
                        width: 32,
                        height: 32,
                      }}
                    />
                  </View>
                )
              })}
            </View>

            <Icon
              name='chevronBack'
              size={24}
              color={theme.colors.secondary}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </View>
        }
      />
    </Pressable>
  )
}

function SingleColumnLayout({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <SplitsList
      info={info}
      headerComponent={
        <View style={{ gap: 16 }}>
          <GroupInfoPage info={info} />
          <MembersButton info={info} />
          <View
            style={{
              backgroundColor: theme.colors.surfaceContainer,
              borderTopRightRadius: 16,
              borderTopLeftRadius: 16,
            }}
          >
            <PaneHeader icon='receipt' title={t('tabs.splits')} textLocation='start' />
          </View>
        </View>
      }
      footerComponent={
        <View
          style={{
            height: 16,
            backgroundColor: theme.colors.surfaceContainer,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        />
      }
    />
  )
}

export function GroupScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const threeBarLayout = useThreeBarLayout()
  const groupId = Number(id as string)
  const displayClass = useDisplayClass()
  const { data: groupInfo, error } = useGroupInfo(groupId)

  const [membersExpanded, setMembersExpanded] = useState(false)
  const membersAlwaysExpanded = displayClass > DisplayClass.Large

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {t('groupInfo.couldNotLoad')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        {!threeBarLayout && <SingleColumnLayout info={groupInfo} />}

        {threeBarLayout && (
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingBottom: 16,
              gap: 16,
            }}
          >
            <Pane icon='home' title={t('tabs.group')} style={{ minWidth: 420 }}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <GroupInfoPage info={groupInfo} />
              </ScrollView>
            </Pane>
            <Pane icon='receipt' title={t('tabs.splits')} style={{ flex: 2 }}>
              <SplitsList info={groupInfo} />
            </Pane>
            <Pane
              icon='members'
              title={t('tabs.members')}
              collapsible={!membersAlwaysExpanded}
              collapsed
              onCollapseChange={() => {
                setMembersExpanded(!membersExpanded)
              }}
              style={{ minWidth: membersAlwaysExpanded ? 500 : undefined }}
            >
              <MembersList info={groupInfo} iconOnly={!membersAlwaysExpanded} />
            </Pane>

            {!membersAlwaysExpanded && (
              <Modal
                visible={membersExpanded}
                transparent
                onRequestClose={() => {
                  setMembersExpanded(false)
                }}
              >
                <Pressable
                  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
                  onPress={() => {
                    setMembersExpanded(false)
                  }}
                />
                <View
                  style={{
                    width: 600,
                    bottom: 16,
                    top: 60,
                    right: 16,
                    position: 'absolute',
                    backgroundColor: theme.colors.surfaceContainer,
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}
                >
                  <Pane
                    icon='members'
                    title={t('tabs.members')}
                    collapsible
                    onCollapseChange={() => {
                      setMembersExpanded(false)
                    }}
                  >
                    <MembersList info={groupInfo} />
                  </Pane>
                </View>
              </Modal>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default function GroupScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return <GroupScreen />
}
