import Header, { HEADER_HEIGHT } from '@components/Header'
import { Pane, PaneHeader } from '@components/Pane'
import { RoundIconButton } from '@components/RoundIconButton'
import { SegmentedButton } from '@components/SegmentedButton'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { GroupActionButtons } from '@components/groupScreen/GroupActionButtons'
import { GroupInfoCard } from '@components/groupScreen/GroupInfoCard'
import { GroupSplitsList } from '@components/groupScreen/GroupSplitsList'
import { MembersButton } from '@components/groupScreen/MembersButton'
import { MembersList } from '@components/groupScreen/MembersList'
import { MembersOrderFilter } from '@components/groupScreen/MembersOrderFilter'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo, SplitPermissionType } from 'shared'

let allSplitsSnackShown = false
let splitsWithYouSnackShown = false

function SplitsFilter({
  style,
  onChange,
}: {
  style?: StyleProp<ViewStyle>
  onChange: (onlyIfIncluded: boolean) => void
}) {
  const snack = useSnack()
  const { t } = useTranslation()
  const [onlyIfIncluded, setOnlyIfIncluded] = useState(false)

  return (
    <SegmentedButton
      // this seems to work with flex
      style={[{ maxWidth: 112, minWidth: 112 }, style]}
      items={[
        {
          icon: 'group',
          selected: !onlyIfIncluded,
          onPress: () => {
            if (onlyIfIncluded) {
              if (!allSplitsSnackShown) {
                // eslint-disable-next-line react-compiler/react-compiler
                allSplitsSnackShown = true
                snack.show({
                  message: t('splitList.showingAllSplits'),
                  duration: snack.duration.SHORT,
                })
              }
              setOnlyIfIncluded(false)
              onChange(false)
            }
          },
        },
        {
          icon: 'user',
          selected: onlyIfIncluded,
          onPress: () => {
            if (!onlyIfIncluded) {
              if (!splitsWithYouSnackShown) {
                // eslint-disable-next-line react-compiler/react-compiler
                splitsWithYouSnackShown = true
                snack.show({
                  message: t('splitList.showingSplitsWithYou'),
                  duration: snack.duration.SHORT,
                })
              }
              setOnlyIfIncluded(true)
              onChange(true)
            }
          },
        },
      ]}
    />
  )
}

function useHasSettingsAccess(info: GroupUserInfo | undefined) {
  const user = useAuth()
  return info && (info.isAdmin || info.owner === user?.id)
}

function SingleColumnLayout({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const hasSettingsAccess = useHasSettingsAccess(info)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const [onlyShowSplitsIfIncluded, setOnlyShowSplitsIfIncluded] = useState(false)

  const horizontalInfo =
    displayClass === DisplayClass.Expanded || displayClass === DisplayClass.Medium

  return (
    <GroupSplitsList
      info={info}
      showPullableHeader
      applyBottomInset
      forceShowSplitsWithUser={onlyShowSplitsIfIncluded}
      headerComponent={
        <View style={{ gap: 16 }}>
          <View
            style={{
              gap: 16,
              flexDirection: horizontalInfo ? 'row' : 'column',
              alignItems: horizontalInfo ? 'stretch' : undefined,
            }}
          >
            <Pane
              icon='group'
              title={t('tabs.group')}
              textLocation='start'
              style={{ flex: 1, marginTop: horizontalInfo ? 0 : 8 }}
              collapsible={hasSettingsAccess}
              collapsed={false}
              collapseIcon='settings'
              onCollapseChange={() => router.navigate(`/group/${info?.id}/settings`)}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
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
            <PaneHeader
              icon='receipt'
              title={t('tabs.splits')}
              textLocation='start'
              adjustsFontSizeToFit
              rightComponent={
                permissions?.canReadSplits() === SplitPermissionType.All && (
                  <SplitsFilter onChange={setOnlyShowSplitsIfIncluded} />
                )
              }
            />
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
  const router = useRouter()
  const displayClass = useDisplayClass()
  const hasSettingsAccess = useHasSettingsAccess(groupInfo)
  const { data: permissions } = useGroupPermissions(groupInfo?.id)
  const [onlyShowSplitsIfIncluded, setOnlyShowSplitsIfIncluded] = useState(false)
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
          gap: 12,
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
        <Pane
          icon='home'
          title={t('tabs.group')}
          style={[{ flex: 1, height: '100%' }, Platform.OS === 'web' && { minWidth: 420 }]}
          containerStyle={{ flex: 1 }}
          collapsible={hasSettingsAccess}
          collapsed={false}
          collapseIcon='settings'
          onCollapseChange={() => {
            router.navigate(`/group/${groupInfo?.id}/settings`)
          }}
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
          collapsible
          collapsed={false}
          rightComponent={
            permissions?.canReadSplits() === SplitPermissionType.All && (
              // @ts-expect-error flex cannot really be null, but this way it can be overriden
              <SplitsFilter style={{ flex: null }} onChange={setOnlyShowSplitsIfIncluded} />
            )
          }
        >
          <GroupSplitsList info={groupInfo} forceShowSplitsWithUser={onlyShowSplitsIfIncluded} />
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
