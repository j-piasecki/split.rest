import Header, { HEADER_HEIGHT } from '@components/Header'
import { Pane, PaneHeader } from '@components/Pane'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { GroupInfoPane } from '@components/groupScreen/GroupInfoPane'
import { GroupSplitsList } from '@components/groupScreen/GroupSplitsList'
import { MembersButton } from '@components/groupScreen/MembersButton'
import { MembersList } from '@components/groupScreen/MembersList'
import { MembersOrderFilter } from '@components/groupScreen/MembersOrderFilter'
import { SplitQueryButton } from '@components/groupScreen/SplitQueryButton'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo } from 'shared'

function SingleColumnLayout({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)

  return (
    <GroupSplitsList
      info={info}
      showPullableHeader
      applyBottomInset
      headerComponent={
        <View style={{ gap: 12 }}>
          <GroupInfoPane info={info} />
          {(!permissions || permissions.canReadMembers()) && <MembersButton info={info} />}
          <View
            style={[
              {
                backgroundColor: theme.colors.surfaceContainer,
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                marginBottom: 2,
              },
            ]}
          >
            <PaneHeader
              icon='receipt'
              title={t('tabs.splits')}
              textLocation='start'
              adjustsFontSizeToFit
              rightComponent={permissions?.canQuerySplits() && <SplitQueryButton />}
            />
          </View>
        </View>
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
  const [membersLowToHigh, setMembersLowToHigh] = useState<boolean | undefined>(true)

  const [membersExpanded, setMembersExpanded] = useState(false)
  const membersAlwaysExpanded = displayClass > DisplayClass.Large

  return (
    <>
      <View
        style={{
          flex: 1,
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingBottom: 12 + insets.bottom,
          paddingTop: HEADER_HEIGHT + insets.top,
          gap: 8,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            height: HEADER_HEIGHT,
            zIndex: 1,
          }}
        >
          <Header showBackButton />
        </View>
        <ScrollView
          style={[{ flex: 2, height: '100%' }, Platform.OS === 'web' && { minWidth: 420 }]}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <GroupInfoPane info={groupInfo} />
        </ScrollView>
        <Pane
          icon='receipt'
          title={t('tabs.splits')}
          style={{ flex: 5, height: '100%' }}
          containerStyle={{ flex: 1 }}
          collapsible
          collapsed={false}
          rightComponent={permissions?.canQuerySplits() && <SplitQueryButton />}
        >
          <GroupSplitsList info={groupInfo} />
        </Pane>
        {(!permissions || permissions?.canReadMembers()) && (
          <Pane
            icon='members'
            title={t('tabs.members')}
            collapsible={true}
            collapsed={!membersAlwaysExpanded}
            orientation='vertical'
            textLocation='start'
            headerOffset={96}
            onCollapseChange={() => {
              setMembersExpanded(!membersExpanded)
            }}
            rightComponent={
              membersAlwaysExpanded && (
                <MembersOrderFilter
                  // @ts-expect-error flex cannot really be null, but this way it can be overriden
                  style={{ flex: null }}
                  onChange={setMembersLowToHigh}
                  lowToHigh={membersLowToHigh}
                />
              )
            }
            style={{ minWidth: membersAlwaysExpanded ? 500 : undefined, height: '100%' }}
            containerStyle={{ flex: 1 }}
          >
            <MembersList
              info={groupInfo}
              iconOnly={!membersAlwaysExpanded}
              lowToHigh={membersLowToHigh}
            />
          </Pane>
        )}

        {!membersAlwaysExpanded && membersExpanded && (
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { position: 'absolute', zIndex: 10 }]}
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
          >
            <View style={StyleSheet.absoluteFill}>
              <Pressable
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
                onPress={() => {
                  setMembersExpanded(false)
                }}
              />
            </View>
            <View
              style={{
                width: 600,
                transformOrigin: 'right',
                bottom: 12 + insets.bottom,
                top: HEADER_HEIGHT + insets.top,
                right: 16,
                position: 'absolute',
                // backgroundColor: theme.colors.surfaceContainer,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <Pane
                icon='members'
                title={t('tabs.members')}
                orientation='vertical'
                collapsible
                textLocation='start'
                headerOffset={128}
                onCollapseChange={() => {
                  setMembersExpanded(false)
                }}
                rightComponent={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MembersOrderFilter
                      // @ts-expect-error flex cannot really be null, but this way it can be overriden
                      style={{ flex: null }}
                      onChange={setMembersLowToHigh}
                      lowToHigh={membersLowToHigh}
                    />
                    <RoundIconButton
                      icon='closeRightPanel'
                      color={theme.colors.secondary}
                      onPress={() => setMembersExpanded(false)}
                    />
                  </View>
                }
                style={{ height: '100%', overflow: 'hidden' }}
                containerStyle={{ flex: 1 }}
              >
                <MembersList info={groupInfo} lowToHigh={membersLowToHigh} />
              </Pane>
            </View>
          </Animated.View>
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
