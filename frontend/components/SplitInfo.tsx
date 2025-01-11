import { Icon, IconName } from '@components/Icon'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useUserById } from '@hooks/database/useUserById'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GroupInfo, LanguageTranslationKey, SplitWithUsers, UserWithBalanceChange } from 'shared'

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

    paidInThisSplit = remainder.toFixed(2)
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
      <ProfilePicture userId={user.id} size={32} />
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
        {/* TODO: show emails only in case of name conflict */}
        {user.email && (
          <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{user.email}</Text>
        )}
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
        {CurrencyUtils.format(paidInThisSplit, groupInfo?.currency)}
      </Text>
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

export function SplitInfo({
  splitInfo,
  groupInfo,
}: {
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo
}) {
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
          style={{ overflow: 'hidden' }}
          collapsible
        >
          <Text style={{ color: theme.colors.onSurface, fontSize: 24, marginBottom: 8 }}>
            {splitInfo.title}
          </Text>

          <IconInfoText
            icon='currency'
            translationKey='splitInfo.hasPaidText'
            values={{
              payer: paidBy.name,
              amount: CurrencyUtils.format(splitInfo.total, groupInfo.currency),
            }}
            userIdPhoto={paidBy.id}
          />
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
