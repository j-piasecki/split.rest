import { GroupIcon } from '@components/GroupIcon'
import { Icon } from '@components/Icon'
import { MemberBubbles } from '@components/MemberBubbles'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { measure } from '@utils/measure'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupInviteWithGroupInfoAndMemberIds } from 'shared'

export interface InvitePaneProps {
  invite?: GroupInviteWithGroupInfoAndMemberIds
  title: string
  subtitle: string
}

export function InvitePane({ invite, title, subtitle }: InvitePaneProps) {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const bubblesContainerRef = useRef<View>(null)
  const [bubblesContainerWidth, setBubblesContainerWidth] = useState(0)

  useLayoutEffect(() => {
    if (bubblesContainerRef.current) {
      setBubblesContainerWidth(measure(bubblesContainerRef.current).width)
    }
  }, [bubblesContainerRef])

  const currencyKey = invite?.groupInfo.currency?.toLocaleLowerCase()
  const currencyText = i18n.exists(`currency.${currencyKey}`)
    ? // @ts-expect-error Handled by the condition above
      t(`currency.${currencyKey}`)
    : currencyKey

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 500,
        justifyContent: isSmallScreen ? 'space-between' : undefined,
      }}
    >
      <Pane
        icon='stackedEmail'
        textLocation='start'
        title={title}
        containerStyle={{ padding: 16, paddingTop: 8, gap: 8 }}
      >
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, fontWeight: 600 }}>
          {subtitle}
        </Text>

        <ShimmerPlaceholder argument={invite} shimmerStyle={{ height: 40 }}>
          {(invite) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GroupIcon info={invite.groupInfo} size={40} />
              <Text
                numberOfLines={3}
                style={{
                  flex: 1,
                  color: theme.colors.onSurface,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {invite.groupInfo.name}
              </Text>
            </View>
          )}
        </ShimmerPlaceholder>

        <ShimmerPlaceholder
          argument={invite}
          shimmerStyle={{ height: 25, width: '70%' }}
          offset={0.9}
        >
          {(_invite) => (
            <View style={{ flexDirection: 'row' }}>
              <Icon
                name='currency'
                size={24}
                color={theme.colors.outline}
                style={{ marginRight: 12 }}
              />
              <Text style={{ color: theme.colors.onSurface, fontSize: 18, width: '70%' }}>
                {t('joinGroup.currency', { currency: currencyText })}
              </Text>
            </View>
          )}
        </ShimmerPlaceholder>

        <ShimmerPlaceholder
          argument={invite}
          shimmerStyle={{ height: 25, width: '70%' }}
          offset={0.85}
        >
          {(invite) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name='user'
                size={24}
                color={theme.colors.outline}
                style={{ marginRight: 12 }}
              />
              <Text style={{ color: theme.colors.onSurface, fontSize: 18, marginRight: 8 }}>
                <Trans
                  i18nKey='joinGroup.invitedBy'
                  values={{ name: invite.createdBy.name }}
                  components={{
                    Styled: <Text style={{ color: theme.colors.primary, fontWeight: 600 }} />,
                  }}
                />
              </Text>
              <ProfilePicture user={invite.createdBy} size={24} />
            </View>
          )}
        </ShimmerPlaceholder>

        <View ref={bubblesContainerRef} style={{ marginTop: 8, marginBottom: 8 }}>
          <ShimmerPlaceholder
            argument={invite}
            shimmerStyle={{ width: bubblesContainerWidth, height: 140 }}
          >
            {(invite) => (
              <MemberBubbles
                middleIconSize={52}
                profilePictures={invite.profilePictures}
                width={bubblesContainerWidth}
                height={140}
                info={invite.groupInfo}
              />
            )}
          </ShimmerPlaceholder>
        </View>
      </Pane>
    </View>
  )
}
