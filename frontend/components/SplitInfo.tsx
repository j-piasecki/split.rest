import { Icon, IconName } from '@components/Icon'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useUserById } from '@hooks/database/useUserById'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getSplitDisplayName } from '@utils/getSplitDisplayName'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import { CurrencyUtils } from 'shared'
import {
  GroupUserInfo,
  LanguageTranslationKey,
  SplitType,
  SplitWithUsers,
  UserWithPendingBalanceChange,
} from 'shared'

function getVisibleBalanceChange(user: UserWithPendingBalanceChange, splitInfo: SplitWithUsers) {
  const paidByThis = splitInfo.paidById === user.id
  let paidInThisSplit = user.change

  if (splitInfo.type & SplitType.Inversed) {
    if (paidByThis) {
      const total = Number(splitInfo.total)
      const remainder = total + Number(paidInThisSplit)

      paidInThisSplit = remainder.toFixed(2)
    }
  } else {
    if (paidByThis) {
      const total = Number(splitInfo.total)
      const remainder = total - Number(paidInThisSplit)

      paidInThisSplit = remainder.toFixed(2)
    } else if (paidInThisSplit.startsWith('-')) {
      paidInThisSplit = paidInThisSplit.substring(1)
    }
  }

  return paidInThisSplit
}

function PaidAmount({
  user,
  splitInfo,
  groupInfo,
}: {
  user: UserWithPendingBalanceChange
  splitInfo: SplitWithUsers
  groupInfo?: GroupUserInfo
}) {
  const theme = useTheme()
  const paidByThis = splitInfo.paidById === user.id
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()

  const isSettleUp = Boolean(splitInfo.type & SplitType.SettleUp)
  const isInverse = Boolean(splitInfo.type & SplitType.Inversed)
  const isBalanceChange = splitInfo.type === SplitType.BalanceChange

  const paidInThisSplit = getVisibleBalanceChange(user, splitInfo)
  const balanceChange = Number(user.change)
  const changeColor = isSettleUp
    ? isInverse
      ? theme.colors.balanceNegative
      : theme.colors.balancePositive
    : isBalanceChange
      ? balanceChange > 0
        ? theme.colors.balancePositive
        : balanceChange < 0
          ? theme.colors.balanceNegative
          : theme.colors.balanceNeutral
      : theme.colors.onSurfaceVariant

  if (isSmallScreen) {
    return (
      <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        {!paidByThis && isSettleUp && (
          <Text style={{ color: changeColor, fontSize: 14 }}>
            {isInverse ? t('splitInfo.gaveBack') : t('splitInfo.gotBack')}
          </Text>
        )}
        <Text style={{ color: changeColor, fontSize: 20 }}>
          {CurrencyUtils.format(paidInThisSplit, groupInfo?.currency)}
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {!paidByThis && isSettleUp && (
        <Text style={{ color: changeColor, fontSize: 16 }}>
          {isInverse ? t('splitInfo.gaveBack') : t('splitInfo.gotBack')}
        </Text>
      )}
      <Text style={{ color: changeColor, fontSize: 20 }}>
        {CurrencyUtils.format(paidInThisSplit, groupInfo?.currency)}
      </Text>
    </View>
  )
}

function UserRow({
  user,
  groupInfo,
  splitInfo,
  isNameUnique,
  last = false,
}: {
  user: UserWithPendingBalanceChange
  splitInfo: SplitWithUsers
  groupInfo: GroupUserInfo | undefined
  isNameUnique: boolean
  last?: boolean
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  const paidByThis = splitInfo.paidById === user.id

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
      <ProfilePicture userId={user.id} size={32} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: paidByThis ? theme.colors.primary : theme.colors.onSurface,
            fontSize: 20,
            fontWeight: paidByThis ? 700 : 400,
          }}
        >
          {user.displayName ?? user.name}
        </Text>
        {user.displayName && (
          <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{user.name}</Text>
        )}
        {(user.deleted || (!isNameUnique && user.email)) && (
          <Text style={{ color: theme.colors.outline, fontSize: 12 }}>
            {user.deleted ? t('deletedUser') : user.email}
          </Text>
        )}
      </View>
      <PaidAmount user={user} splitInfo={splitInfo} groupInfo={groupInfo} />
    </View>
  )
}

interface EditInfoTextProps {
  icon: IconName
  translationKey: LanguageTranslationKey
  values: Record<string, string>
  userIdPhoto?: string
}

function IconInfoText({ icon, translationKey, values, userIdPhoto }: EditInfoTextProps) {
  const theme = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
      <Icon name={icon} size={20} color={theme.colors.outline} style={{ marginRight: 12 }} />
      {userIdPhoto && <ProfilePicture userId={userIdPhoto} size={20} style={{ marginRight: 8 }} />}
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
  const { data: createdBy } = useUserById(splitInfo.createdById)

  if (splitInfo.version === 1) {
    return (
      <Pane
        icon='editAlt'
        title={t('splitInfo.authorInfo')}
        textLocation='start'
        containerStyle={{ padding: 16, paddingTop: 12 }}
        style={{ overflow: 'hidden' }}
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
            userIdPhoto={createdBy.id}
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
      style={{ overflow: 'hidden' }}
      collapsible
      startCollapsed
    >
      {createdBy && (
        <IconInfoText
          icon='edit'
          translationKey='splitInfo.editAuthorText'
          values={{ editor: createdBy.name }}
          userIdPhoto={createdBy.id}
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

function getNameKey(user: UserWithPendingBalanceChange) {
  if (user.displayName === null) {
    return user.name
  }

  return user.name + user.displayName
}

export function SplitInfo({
  splitInfo,
  groupInfo,
  style,
}: {
  splitInfo: SplitWithUsers
  groupInfo: GroupUserInfo
  style?: StyleProp<ViewStyle>
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const paidBy = splitInfo.users.find((user) => user.id === splitInfo.paidById)

  const usersToShow = splitInfo.users.filter((user) => {
    const changeToShow = getVisibleBalanceChange(user, splitInfo)
    return changeToShow !== '0.00'
  })

  const nameCounts = usersToShow.reduce(
    (acc, user) => {
      const key = getNameKey(user)
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={style}>
      <View style={{ gap: 16 }}>
        <Pane
          icon='receipt'
          title={t('splitInfo.details')}
          textLocation='start'
          containerStyle={{ padding: 16, paddingTop: 12 }}
          style={{ overflow: 'hidden' }}
          collapsible
        >
          <Text style={{ color: theme.colors.onSurface, fontSize: 24, marginBottom: 8 }}>
            {getSplitDisplayName(splitInfo)}
          </Text>

          {/* TODO: Update text for inverse splits? */}
          {paidBy && (
            <IconInfoText
              icon='currency'
              translationKey={
                splitInfo.type & SplitType.SettleUp
                  ? splitInfo.type & SplitType.Inversed
                    ? 'splitInfo.hasSettledUpGetsBack'
                    : 'splitInfo.hasSettledUpGaveBack'
                  : 'splitInfo.hasPaidText'
              }
              values={{
                payer: paidBy.name,
                amount: CurrencyUtils.format(splitInfo.total, groupInfo.currency),
              }}
              userIdPhoto={paidBy.id}
            />
          )}
          <IconInfoText
            icon='calendar'
            translationKey='splitInfo.splitTimeText'
            values={{ date: new Date(splitInfo.timestamp).toLocaleDateString() }}
          />
        </Pane>

        <EditInfo splitInfo={splitInfo} />

        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ paddingBottom: 16, paddingTop: 8 }}
          style={{ overflow: 'hidden' }}
          collapsible
        >
          {usersToShow.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              groupInfo={groupInfo}
              splitInfo={splitInfo}
              isNameUnique={nameCounts[getNameKey(user)] === 1}
              last={index === usersToShow.length - 1}
            />
          ))}
        </Pane>
      </View>
    </ScrollView>
  )
}
