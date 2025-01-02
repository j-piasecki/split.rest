import Header, { HEADER_HEIGHT } from '@components/Header'
import { Icon } from '@components/Icon'
import { Pane, PaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { GroupActionButtons, GroupInfoCard } from '@components/groupScreen/GroupInfoPage'
import { MembersList } from '@components/groupScreen/MembersList'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { measure } from '@utils/measure'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
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
    const width = measure(iconsRef.current!).width

    setIconsToShow(Math.floor(width / singleIconWidth))
  }, [width])

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHigh
            : theme.colors.surfaceContainer,
          borderRadius: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          overflow: 'hidden',
        },
        styles.paneShadow,
      ]}
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
          <View
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 24,
            }}
          >
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
                    <ProfilePicture userId={member.id} size={28} />
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
  const displayClass = useDisplayClass()
  const { t } = useTranslation()

  const horizontalInfo =
    displayClass === DisplayClass.Expanded || displayClass === DisplayClass.Medium

  return (
    <SplitsList
      info={info}
      showPullableHeader
      headerComponent={
        <View style={{ gap: 16 }}>
          <View
            style={{
              gap: 16,
              flexDirection: horizontalInfo ? 'row' : 'column',
              alignItems: horizontalInfo ? 'center' : undefined,
            }}
          >
            <Pane
              icon='group'
              title={t('tabs.group')}
              textLocation='start'
              style={{ flex: 1, marginTop: 8 }}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  paddingBottom: 24,
                }}
              >
                <GroupInfoCard info={info} />
              </View>
            </Pane>
            {info && <GroupActionButtons info={info} />}
          </View>
          <MembersButton info={info} />
          <View
            style={[
              {
                backgroundColor: theme.colors.surfaceContainer,
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,
              },
              styles.paneShadow,
            ]}
          >
            <PaneHeader icon='receipt' title={t('tabs.splits')} textLocation='start' />
          </View>
        </View>
      }
      footerComponent={
        <View
          style={[
            {
              height: 16,
              backgroundColor: theme.colors.surfaceContainer,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            },
            styles.paneShadow,
          ]}
        />
      }
    />
  )
}

export default function GroupScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const threeBarLayout = useThreeBarLayout()
  const groupId = Number(id as string)
  const displayClass = useDisplayClass()
  const { data: groupInfo, error } = useGroupInfo(groupId)
  const { data: permissions } = useGroupPermissions(groupId)

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
        <Header showBackButton />
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
      {!threeBarLayout && <SingleColumnLayout info={groupInfo} />}

      {threeBarLayout && (
        <>
          <Header showBackButton />
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
            <Pane
              icon='home'
              title={t('tabs.group')}
              style={[{ flex: 1, height: '100%' }, Platform.OS === 'web' && { minWidth: 420 }]}
              containerStyle={{ flex: 1 }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 32,
                  gap: 16,
                }}
              >
                <GroupInfoCard info={groupInfo} />
                {groupInfo && <GroupActionButtons info={groupInfo} />}
              </ScrollView>
            </Pane>
            <Pane
              icon='receipt'
              title={t('tabs.splits')}
              style={{ flex: 2, height: '100%' }}
              containerStyle={{ flex: 1 }}
            >
              <SplitsList info={groupInfo} />
            </Pane>
            {permissions?.canReadMembers() && (
              <Pane
                icon='members'
                title={t('tabs.members')}
                collapsible={!membersAlwaysExpanded}
                collapsed
                orientation='vertical'
                onCollapseChange={() => {
                  setMembersExpanded(!membersExpanded)
                }}
                style={{ minWidth: membersAlwaysExpanded ? 500 : undefined, height: '100%' }}
                containerStyle={{ flex: 1 }}
              >
                <MembersList info={groupInfo} iconOnly={!membersAlwaysExpanded} />
              </Pane>
            )}

            {!membersAlwaysExpanded && (
              <Modal
                visible={membersExpanded}
                transparent
                navigationBarTranslucent
                statusBarTranslucent
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
                    top: HEADER_HEIGHT,
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
                    orientation='vertical'
                    collapsible
                    onCollapseChange={() => {
                      setMembersExpanded(false)
                    }}
                    style={{ height: '100%', overflow: 'hidden' }}
                    containerStyle={{ flex: 1 }}
                  >
                    <MembersList info={groupInfo} />
                  </Pane>
                </View>
              </Modal>
            )}
          </View>
        </>
      )}
    </View>
  )
}
