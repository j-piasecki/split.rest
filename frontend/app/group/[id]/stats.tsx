import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader, Pane } from '@components/Pane'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMonthlyStats } from '@hooks/database/useGroupMonthlyStats'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import dayjs from 'dayjs'
import { useLocalSearchParams } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, View } from 'react-native'
import { CurrencyUtils, GroupMonthlyStats, GroupUserInfo } from 'shared'

const Months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

function GroupDetails({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Pane
      title={t('groupStats.infoHeader')}
      textLocation='start'
      icon='group'
      containerStyle={{
        padding: 16,
        paddingTop: 12,
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='members' size={20} color={theme.colors.secondary} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                {t('groupInfo.numberOfMembers', { count: info.memberCount })}
              </Text>
            )}
          </ShimmerPlaceholder>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='money' size={20} color={theme.colors.secondary} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                {t('groupInfo.totalTransactionsValue', {
                  value: CurrencyUtils.format(info.total, info.currency),
                })}
              </Text>
            )}
          </ShimmerPlaceholder>
        </View>

        {info && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {!info.hasAccess ? (
              <>
                <View style={{ width: 24, alignItems: 'center' }}>
                  <Icon name={'lock'} size={20} color={theme.colors.error} />
                </View>
                <Text
                  style={{
                    color: theme.colors.error,
                    fontSize: 18,
                    flex: 1,
                  }}
                >
                  {t('groupInfo.noAccessToGroup')}
                </Text>
              </>
            ) : info.isAdmin ? (
              <>
                <View style={{ width: 24, alignItems: 'center' }}>
                  <Icon name='shield' size={20} color={theme.colors.secondary} />
                </View>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                  {t('groupInfo.youAreAdmin')}
                </Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </Pane>
  )
}

interface MonthStats {
  monthName: (typeof Months)[number]
  currentYear: {
    totalValue: number
    transactionCount: number
  }
  previousYear: {
    totalValue: number
    transactionCount: number
  }
}

function BarChart({ stats }: { stats: MonthStats[] }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [width, setWidth] = useState(0)

  const maxValue = Math.max(
    ...stats.map((stat) => Math.max(stat.currentYear.totalValue, stat.previousYear.totalValue))
  )

  const previousColor =
    theme.theme === 'light' ? theme.colors.primaryContainer : theme.colors.primary
  const currentColor =
    theme.theme === 'light' ? theme.colors.primary : theme.colors.primaryContainer

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceContainer,
        padding: 12,
        borderRadius: 4,
        gap: 12,
      }}
    >
      <ScrollView
        ref={(ref) => {
          if (dayjs().month() > 5) {
            // ref?.scrollTo({ x: width, y: 0, animated: false })
          }
        }}
        onLayout={({ nativeEvent }) => {
          setWidth(nativeEvent.layout.width)
        }}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 8,
          height: 200,
          width: width * 2,
        }}
        snapToInterval={width / 6}
        decelerationRate={'fast'}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal
      >
        {stats.map((stat) => (
          <View key={stat.monthName} style={{ flex: 1 }}>
            <View style={{ flex: 1, alignSelf: 'stretch', gap: 4 }}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    position: 'absolute',
                    left: 0,
                    right: '35%',
                    bottom: 0,
                    height: `${(stat.previousYear.totalValue / maxValue) * 100}%`,
                    backgroundColor: previousColor,
                    zIndex: stat.previousYear.totalValue > stat.currentYear.totalValue ? 0 : 1,
                  }}
                />
                <View
                  style={{
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    position: 'absolute',
                    left: '35%',
                    right: 0,
                    bottom: 0,
                    height: `${(stat.currentYear.totalValue / maxValue) * 100}%`,
                    backgroundColor: currentColor,
                    zIndex: stat.currentYear.totalValue > stat.previousYear.totalValue ? 0 : 1,
                  }}
                />
              </View>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t(`calendar.monthShort.${stat.monthName}`)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}
      >
        <View style={{ width: 16, height: 16, backgroundColor: previousColor, borderRadius: 6 }} />
        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
          {dayjs().year() - 1}
        </Text>
        <View
          style={{
            marginLeft: 24,
            width: 16,
            height: 16,
            backgroundColor: currentColor,
            borderRadius: 6,
          }}
        />
        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
          {dayjs().year()}
        </Text>
      </View>
    </View>
  )
}

function MonthSummary({ stat, index }: { stat: MonthStats; index: number }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <View
      style={{
        gap: 8,
        backgroundColor: theme.colors.surfaceContainer,
        padding: 12,
        borderRadius: 4,
        borderBottomLeftRadius: index === 11 ? 16 : 4,
        borderBottomRightRadius: index === 11 ? 16 : 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: theme.colors.primary,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: 700 }}>
            {index + 1}
          </Text>
        </View>
        <Text style={{ color: theme.colors.secondary, fontSize: 22, fontWeight: 700 }}>
          {t(`calendar.month.${stat.monthName}`)}
        </Text>
      </View>

      <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
        Total: {CurrencyUtils.format(stat.previousYear.totalValue, 'USD')} -> {CurrencyUtils.format(stat.currentYear.totalValue, 'USD')}
      </Text>
      <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
        Transactions: {stat.previousYear.transactionCount} -> {stat.currentYear.transactionCount}
      </Text>
    </View>
  )
}

function Summary({ stats }: { stats: MonthStats[] }) {
  return (
    <View style={{ gap: 2 }}>
      {stats.map((stat, index) => (
        <MonthSummary key={stat.monthName} stat={stat} index={index} />
      ))}
    </View>
  )
}

function Statistics({ monthlyStats }: { monthlyStats: GroupMonthlyStats }) {
  const { t } = useTranslation()

  const stats: MonthStats[] = useMemo(() => {
    const stats = monthlyStats.stats.map((stat) => ({
      month: dayjs(stat.startTimestamp).month(),
      year: dayjs(stat.startTimestamp).year(),
      totalValue: Number(stat.totalValue),
      transactionCount: stat.transactionCount,
    }))

    return Months.map((month, index) => {
      const monthStats = stats.filter((stat) => stat.month === index)
      const currentYearStats = monthStats.filter((stat) => stat.year === dayjs().year())[0]
      const previousYearStats = monthStats.filter((stat) => stat.year === dayjs().year() - 1)[0]

      return {
        monthName: month,
        currentYear: {
          totalValue: currentYearStats?.totalValue ?? 0,
          transactionCount: currentYearStats?.transactionCount ?? 0,
        },
        previousYear: {
          totalValue: previousYearStats?.totalValue ?? 0,
          transactionCount: previousYearStats?.transactionCount ?? 0,
        },
      }
    })
  }, [monthlyStats])

  return (
    <View>
      <FullPaneHeader
        title={t('groupStats.statisticsHeader')}
        textLocation='start'
        icon='barChartAlt'
      />
      <View style={{ gap: 2 }}>
        <BarChart stats={stats} />
        <Summary stats={stats} />
      </View>
    </View>
  )
}

// todo: pull to refresh
function Stats({ info, monthlyStats }: { info: GroupUserInfo; monthlyStats: GroupMonthlyStats }) {
  const insets = useModalScreenInsets()

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={{
        gap: 16,
        flexGrow: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 16 }}>
        <GroupDetails info={info} />
        <Statistics monthlyStats={monthlyStats} />
      </View>
    </ScrollView>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const { data: monthlyStats } = useGroupMonthlyStats(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupStats')}
      maxWidth={500}
      maxHeight={700}
    >
      {info && monthlyStats && <Stats info={info} monthlyStats={monthlyStats} />}
    </ModalScreen>
  )
}
