import Header, { HEADER_HEIGHT } from '@components/Header'
import { Pane, PaneHeader } from '@components/Pane'
import { Text } from '@components/Text'
import { GroupActionButtons } from '@components/groupScreen/GroupActionButtons'
import { GroupInfoCard } from '@components/groupScreen/GroupInfoCard'
import { MembersButton } from '@components/groupScreen/MembersButton'
import { MembersList } from '@components/groupScreen/MembersList'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo } from 'shared'

function SingleColumnLayout({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const displayClass = useDisplayClass()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)

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
            <GroupActionButtons info={info} />
          </View>
          {(!permissions || permissions.canReadMembers()) && <MembersButton info={info} />}
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

function TripleColumnLayout({ groupInfo }: { groupInfo: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const displayClass = useDisplayClass()
  const { data: permissions } = useGroupPermissions(groupInfo?.id)

  const [membersExpanded, setMembersExpanded] = useState(false)
  const membersAlwaysExpanded = displayClass > DisplayClass.Large

  return (
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
            <GroupActionButtons info={groupInfo} />
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
        {(!permissions || permissions?.canReadMembers()) && (
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
                top: HEADER_HEIGHT + insets.top,
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
  )
}

function LoadingError() {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Header showBackButton />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 128,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontSize: 64, opacity: 0.5 }}>{'😞'}</Text>
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 600 }}>
          {t('groupInfo.couldNotLoad')}
        </Text>
      </View>
    </View>
  )
}

export default function GroupScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const threeBarLayout = useThreeBarLayout()
  const groupId = Number(id as string)
  const { data: groupInfo, error } = useGroupInfo(groupId)

  if (error) {
    return <LoadingError />
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      {threeBarLayout ? (
        <TripleColumnLayout groupInfo={groupInfo} />
      ) : (
        <SingleColumnLayout info={groupInfo} />
      )}
    </View>
  )
}
