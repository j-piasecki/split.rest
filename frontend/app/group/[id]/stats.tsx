import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader, Pane } from '@components/Pane'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMonthlyStats } from '@hooks/database/useGroupMonthlyStats'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import dayjs from 'dayjs'
import { useLocalSearchParams } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, RefreshControl, ScrollView, View } from 'react-native'
import { CurrencyUtils, GroupUserInfo } from 'shared'

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

interface MonthStats {
  monthName: (typeof Months)[number]
  years: Map<
    number,
    {
      totalValue: number
      transactionCount: number
    }
  >
}

interface GroupStatistics {
  state: {
    isLoading: boolean
    isRefetching: boolean
    refetch: () => void
  }
  monthlyStatistics: MonthStats[]
  thisYearTotal: number
  thisYearAverage: number
  lastYearTotal: number
  lastYearAverage: number
}

function useGroupStatistics(id: number): GroupStatistics | null {
  const { data: monthlyStats, isLoading, isRefetching, refetch } = useGroupMonthlyStats(id)

  const stats: MonthStats[] = useMemo(() => {
    if (!monthlyStats) {
      return []
    }

    const stats = monthlyStats.stats.map((stat) => ({
      month: dayjs(stat.startTimestamp).month(),
      year: dayjs(stat.startTimestamp).year(),
      totalValue: Number(stat.totalValue),
      transactionCount: stat.transactionCount,
    }))

    const currentMonth = dayjs().month()
    const monthsEndingInCurrent = Months.slice(currentMonth + 1)
    const monthsStartingInCurrent = Months.slice(0, currentMonth + 1)
    const orderedMonths = [...monthsEndingInCurrent, ...monthsStartingInCurrent]

    return orderedMonths.map((month) => {
      const index = Months.indexOf(month)
      const monthStats = stats.filter((stat) => stat.month === index)

      return {
        monthName: month,
        years: new Map(
          monthStats.map((stat) => [
            stat.year,
            {
              totalValue: stat.totalValue,
              transactionCount: stat.transactionCount,
            },
          ])
        ),
      }
    })
  }, [monthlyStats])

  if (!monthlyStats) {
    return null
  }

  const thisYearTotal = monthlyStats.stats
    .filter((stat) => dayjs(stat.startTimestamp).year() === dayjs().year())
    .reduce((acc, stat) => acc + Number(stat.totalValue), 0)
  const monthsWithStats = monthlyStats.stats.filter(
    (stat) => dayjs(stat.startTimestamp).year() === dayjs().year()
  )
  const thisYearAverage = monthsWithStats.length > 0 ? thisYearTotal / monthsWithStats.length : 0

  const lastYearTotal = monthlyStats.stats
    .filter((stat) => dayjs(stat.startTimestamp).year() === dayjs().year() - 1)
    .reduce((acc, stat) => acc + Number(stat.totalValue), 0)
  const lastYearMonthsWithStats = monthlyStats.stats.filter(
    (stat) => dayjs(stat.startTimestamp).year() === dayjs().year() - 1
  )
  const lastYearAverage =
    lastYearMonthsWithStats.length > 0 ? lastYearTotal / lastYearMonthsWithStats.length : 0

  return {
    state: {
      isLoading,
      isRefetching,
      refetch,
    },
    monthlyStatistics: stats,
    thisYearTotal,
    thisYearAverage,
    lastYearTotal,
    lastYearAverage,
  }
}

function GroupDetails({ info, statistics }: { info: GroupUserInfo; statistics: GroupStatistics }) {
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
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
            {t('groupStats.numberOfMembers', { count: info.memberCount })}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center', marginTop: 2 }}>
            <Icon name='money' size={20} color={theme.colors.secondary} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
              {t('groupStats.totalTransactionsValue', {
                value: CurrencyUtils.format(info.total, info.currency),
              })}
            </Text>

            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
              {t('groupStats.lastYearTotal', {
                value: CurrencyUtils.format(statistics.lastYearTotal, info.currency),
              })}
            </Text>

            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
              {t('groupStats.thisYearTotal', {
                value: CurrencyUtils.format(statistics.thisYearTotal, info.currency),
              })}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center', marginTop: 2 }}>
            <Icon name='average' size={20} color={theme.colors.secondary} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
              {t('groupStats.lastYearAverage', {
                value: CurrencyUtils.format(statistics.lastYearAverage, info.currency),
              })}
            </Text>

            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
              {t('groupStats.thisYearAverage', {
                value: CurrencyUtils.format(statistics.thisYearAverage, info.currency),
              })}
            </Text>
          </View>
        </View>

        {info && (info.isAdmin || !info.hasAccess) && (
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

function BarChart({ info, statistics }: { info: GroupUserInfo; statistics: GroupStatistics }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [containerWidth, setContainerWidth] = useState(0)

  const stats = statistics.monthlyStatistics

  const maxValue = Math.max(
    ...stats.map((stat) =>
      Math.max(...Array.from(stat.years.values()).map((year) => year.totalValue))
    )
  )

  const previousColor =
    theme.theme === 'light' ? theme.colors.primaryContainer : theme.colors.primary
  const currentColor =
    theme.theme === 'light' ? theme.colors.primary : theme.colors.primaryContainer

  const textHeight = 22
  const graphContainerHeight = 200
  const graphContainerTopPadding = 20
  const maxBarHeight = graphContainerHeight - graphContainerTopPadding - textHeight - 4

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceContainer,
        padding: 12,
        borderRadius: 4,
        gap: 12,
      }}
    >
      <View style={{ position: 'absolute', top: 12, left: 12, right: 12 }}>
        <Text style={{ color: theme.colors.outline, fontSize: 14, fontWeight: 600 }}>
          {CurrencyUtils.format(maxValue, info.currency)}
        </Text>
      </View>
      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: 12 + graphContainerTopPadding,
          left: 12,
          right: 12,
          height: maxBarHeight,
          borderColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          justifyContent: 'space-evenly',
        }}
      >
        <View
          style={{
            borderColor: currentColor,
            borderStyle: 'dashed',
            borderWidth: 1,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: (statistics.thisYearAverage / maxValue) * maxBarHeight,
          }}
        />
        <View
          style={{
            borderColor: previousColor,
            borderStyle: 'dashed',
            borderWidth: 1,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: (statistics.lastYearAverage / maxValue) * maxBarHeight,
          }}
        />

        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
      </View>

      <ScrollView
        ref={(ref) => {
          if (Platform.OS === 'web') {
            if (ref) {
              setTimeout(() => {
                // @ts-expect-error - getBoundingClientRect will work on web anyway
                const size = measure(ref)
                // @ts-expect-error - scrollLeft doesn't exist on mobile
                ref.scrollLeft = size.width * 2
              }, 50)
            }
          } else {
            ref?.scrollTo({ x: containerWidth * 2, y: 0, animated: false })
          }
        }}
        onLayout={({ nativeEvent }) => {
          const width = nativeEvent.layout.width

          // if the container is wide enough, we can show entire chart on one screen
          if (width > 600) {
            setContainerWidth(width / 2)
          } else {
            setContainerWidth(width)
          }
        }}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 8,
          height: graphContainerHeight,
          width: containerWidth * 2 + (Platform.OS !== 'web' ? (2 * containerWidth) / 6 : 0),
          paddingTop: graphContainerTopPadding,
          paddingLeft: (2 * containerWidth) / 6,
        }}
        snapToInterval={containerWidth / 6}
        decelerationRate={'fast'}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal
      >
        {stats.map((stat) => {
          const currentYear = stat.years.get(dayjs().year()) ?? {
            totalValue: 0,
            transactionCount: 0,
          }
          const previousYear = stat.years.get(dayjs().year() - 1) ?? {
            totalValue: 0,
            transactionCount: 0,
          }

          return (
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
                      height: `${(previousYear.totalValue / maxValue) * 100}%`,
                      backgroundColor: previousColor,
                      zIndex: previousYear.totalValue > currentYear.totalValue ? 0 : 1,
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
                      height: `${(currentYear.totalValue / maxValue) * 100}%`,
                      backgroundColor: currentColor,
                      zIndex: currentYear.totalValue > previousYear.totalValue ? 0 : 1,
                    }}
                  />
                </View>
                <Text
                  style={{
                    height: textHeight,
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
          )
        })}
      </ScrollView>

      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: 12 + graphContainerTopPadding,
          left: 12,
          right: 12,
          height: maxBarHeight,
          borderColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          justifyContent: 'space-evenly',
        }}
      >
        <View style={{ height: 1 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              color: theme.colors.outline,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {CurrencyUtils.format((maxValue * 4) / 5, info.currency)}
          </Text>
        </View>
        <View style={{ height: 1 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              color: theme.colors.outline,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {CurrencyUtils.format((maxValue * 3) / 5, info.currency)}
          </Text>
        </View>
        <View style={{ height: 1 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              color: theme.colors.outline,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {CurrencyUtils.format((maxValue * 2) / 5, info.currency)}
          </Text>
        </View>
        <View style={{ height: 1 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              color: theme.colors.outline,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {CurrencyUtils.format((maxValue * 1) / 5, info.currency)}
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              color: theme.colors.outline,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {CurrencyUtils.format(0, info.currency)}
          </Text>
        </View>
      </View>

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

function MonthSummary({
  info,
  stat,
  previousStat,
  monthNumber,
  last,
}: {
  info: GroupUserInfo
  stat: MonthStats
  previousStat: MonthStats
  monthNumber: number
  last: boolean
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  const currentYear = stat.years.get(dayjs().year()) ?? { totalValue: 0, transactionCount: 0 }
  const previousYear = stat.years.get(dayjs().year() - 1) ?? { totalValue: 0, transactionCount: 0 }

  const changeMonthOverMonth =
    currentYear.totalValue -
    (previousStat.years.get(stat.monthName === 'january' ? dayjs().year() - 1 : dayjs().year())
      ?.totalValue ?? 0)
  const changeYearOverYear = currentYear.totalValue - previousYear.totalValue

  const changeYoYColor =
    changeYearOverYear > 0
      ? theme.colors.balanceNegative
      : changeYearOverYear < 0
        ? theme.colors.balancePositive
        : theme.colors.balanceNeutral
  const changeMoMColor =
    changeMonthOverMonth > 0
      ? theme.colors.balanceNegative
      : changeMonthOverMonth < 0
        ? theme.colors.balancePositive
        : theme.colors.balanceNeutral

  return (
    <View
      style={{
        gap: 12,
        backgroundColor: theme.colors.surfaceContainer,
        padding: 12,
        borderRadius: 4,
        borderBottomLeftRadius: last ? 16 : 4,
        borderBottomRightRadius: last ? 16 : 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor:
              theme.theme === 'light' ? theme.colors.secondary : theme.colors.secondaryContainer,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color:
                theme.theme === 'light'
                  ? theme.colors.onSecondary
                  : theme.colors.onSecondaryContainer,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {monthNumber + 1}
          </Text>
        </View>
        <Text style={{ color: theme.colors.secondary, fontSize: 22, fontWeight: 700 }}>
          {t(`calendar.month.${stat.monthName}`)}
        </Text>

        <View style={{ flex: 1 }} />

        {changeMonthOverMonth !== 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name={changeMonthOverMonth > 0 ? 'arrowUp' : 'arrowDown'}
              size={22}
              color={changeMoMColor}
            />
            <Text style={{ color: changeMoMColor, fontSize: 20, fontWeight: 700 }}>
              {CurrencyUtils.format(changeMonthOverMonth, info.currency, false)}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 4 }}>
          {/* <View style={{flexDirection: 'row'}}><RoundIconButton icon='chevronForward' size={20} color={theme.colors.onSurface} onPress={() => {}} text={`Expenses: ${CurrencyUtils.format(currentYear.totalValue, info.currency)}`} textLocation='start' textStyle={{color: theme.colors.onSurface, fontSize: 18, fontWeight: 700}} style={{paddingHorizontal: 16}} /></View>
          <RoundIconButton icon='chevronForward' size={16} color={theme.colors.outline} onPress={() => {}} text={`Expenses in ${dayjs().year() - 1}: ${CurrencyUtils.format(previousYear.totalValue, info.currency)}`} textLocation='start' textStyle={{color: theme.colors.outline, fontSize: 16, fontWeight: 700}} /> */}
          <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 700 }}>
            {t('groupStats.expensesThisYear', {
              value: CurrencyUtils.format(currentYear.totalValue, info.currency),
            })}
          </Text>
          <Text style={{ color: theme.colors.outline, fontSize: 16, fontWeight: 700 }}>
            {t('groupStats.expensesLastYear', {
              year: dayjs().year() - 1,
              value: CurrencyUtils.format(previousYear.totalValue, info.currency),
            })}
          </Text>
        </View>
        {changeYearOverYear !== 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
            <Icon
              name={changeYearOverYear > 0 ? 'arrowUp' : 'arrowDown'}
              size={18}
              color={changeYoYColor}
            />
            <Text style={{ color: changeYoYColor, fontSize: 14, fontWeight: 600 }}>
              {CurrencyUtils.format(changeYearOverYear, info.currency, false)}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

function Summary({ info, stats }: { info: GroupUserInfo; stats: MonthStats[] }) {
  return (
    <View style={{ gap: 2 }}>
      {stats.toReversed().map((stat, index) => {
        const monthNumber = Months.indexOf(stat.monthName)
        const previousStat = stats.find(
          (stat) => stat.monthName === (monthNumber === 0 ? Months[11] : Months[monthNumber - 1])
        )!
        return (
          <MonthSummary
            key={stat.monthName}
            info={info}
            stat={stat}
            previousStat={previousStat}
            monthNumber={monthNumber}
            last={index === 11}
          />
        )
      })}
    </View>
  )
}

function Statistics({ info, statistics }: { info: GroupUserInfo; statistics: GroupStatistics }) {
  const { t } = useTranslation()

  return (
    <View>
      <FullPaneHeader
        title={t('groupStats.statisticsHeader')}
        textLocation='start'
        icon='barChartAlt'
      />
      <View style={{ gap: 2 }}>
        <BarChart info={info} statistics={statistics} />
        <Summary info={info} stats={statistics.monthlyStatistics} />
      </View>
    </View>
  )
}

// todo: pull to refresh
function Stats({ info, statistics }: { info: GroupUserInfo; statistics: GroupStatistics }) {
  const insets = useModalScreenInsets()

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps='handled'
      refreshControl={
        <RefreshControl
          refreshing={statistics.state.isRefetching}
          onRefresh={statistics.state.refetch}
        />
      }
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
        <GroupDetails info={info} statistics={statistics} />
        <Statistics info={info} statistics={statistics} />
      </View>
    </ScrollView>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const statistics = useGroupStatistics(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupStats')}
      maxWidth={650}
      maxHeight={800}
    >
      {info && statistics && <Stats info={info} statistics={statistics} />}
    </ModalScreen>
  )
}
