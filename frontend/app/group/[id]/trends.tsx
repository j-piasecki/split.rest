import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader, Pane } from '@components/Pane'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMonthlyStats } from '@hooks/database/useGroupMonthlyStats'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { measure } from '@utils/measure'
import dayjs from 'dayjs'
import { useLocalSearchParams } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, RefreshControl, ScrollView, View } from 'react-native'
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
  this12MonthPeriodTotal: number
  this12MonthPeriodAverage: number
  last12MonthPeriodTotal: number
  last12MonthPeriodAverage: number
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

  const this12MonthPeriodTotal = monthlyStats.stats
    .filter((stat) => {
      const month = dayjs(stat.startTimestamp).month()
      const year = dayjs(stat.startTimestamp).year()
      const currentYear = month > dayjs().month() ? dayjs().year() - 1 : dayjs().year()
      return year === currentYear
    })
    .reduce((acc, stat) => acc + Number(stat.totalValue), 0)
  const monthsWithStats = monthlyStats.stats.filter(
    (stat) => dayjs(stat.startTimestamp).year() === dayjs().year()
  )
  const this12MonthPeriodAverage =
    monthsWithStats.length > 0 ? this12MonthPeriodTotal / monthsWithStats.length : 0

  const last12MonthPeriodTotal = monthlyStats.stats
    .filter((stat) => {
      const month = dayjs(stat.startTimestamp).month()
      const year = dayjs(stat.startTimestamp).year()
      const lastYear = month > dayjs().month() ? dayjs().year() - 2 : dayjs().year() - 1
      return year === lastYear
    })
    .reduce((acc, stat) => acc + Number(stat.totalValue), 0)
  const last12MonthPeriodMonthsWithStats = monthlyStats.stats.filter(
    (stat) => dayjs(stat.startTimestamp).year() === dayjs().year() - 1
  )
  const last12MonthPeriodAverage =
    last12MonthPeriodMonthsWithStats.length > 0
      ? last12MonthPeriodTotal / last12MonthPeriodMonthsWithStats.length
      : 0

  return {
    state: {
      isLoading,
      isRefetching,
      refetch,
    },
    monthlyStatistics: stats,
    this12MonthPeriodTotal,
    this12MonthPeriodAverage,
    last12MonthPeriodTotal,
    last12MonthPeriodAverage,
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
        padding: 12,
        paddingBottom: 16,
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
          <Text style={{ color: theme.colors.onSurface, fontSize: 18, flex: 1 }}>
            {t('groupStats.numberOfMembers', { count: info.memberCount })}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center', marginTop: 2 }}>
            <Icon name='money' size={20} color={theme.colors.secondary} />
          </View>
          <View style={{ gap: 4, flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
              {t('groupStats.totalTransactionsValue', {
                value: CurrencyUtils.format(info.total, info.currency),
              })}
            </Text>

            <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
              {t('groupStats.this12MonthPeriodTotal', {
                value: CurrencyUtils.format(statistics.this12MonthPeriodTotal, info.currency),
              })}
            </Text>

            {statistics.last12MonthPeriodTotal > 0 && (
              <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
                {t('groupStats.last12MonthPeriodTotal', {
                  value: CurrencyUtils.format(statistics.last12MonthPeriodTotal, info.currency),
                })}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center', marginTop: 2 }}>
            <Icon name='average' size={20} color={theme.colors.secondary} />
          </View>
          <View style={{ gap: 4, flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
              {t('groupStats.this12MonthPeriodAverage', {
                value: CurrencyUtils.format(statistics.this12MonthPeriodAverage, info.currency),
              })}
            </Text>

            {statistics.last12MonthPeriodAverage > 0 && (
              <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
                {t('groupStats.last12MonthPeriodAverage', {
                  value: CurrencyUtils.format(statistics.last12MonthPeriodAverage, info.currency),
                })}
              </Text>
            )}
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
                <Text style={{ color: theme.colors.onSurface, fontSize: 18, flex: 1 }}>
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

function Bar({
  value,
  maxValue,
  color,
  zIndex,
  location,
}: {
  value: number
  maxValue: number
  color: string
  zIndex: number
  location: 'left' | 'right' | 'center'
}) {
  return (
    <View
      style={{
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        position: 'absolute',
        left: location === 'left' ? '5%' : location === 'center' ? '17.5%' : '35%',
        right: location === 'right' ? '5%' : location === 'center' ? '17.5%' : '35%',
        bottom: 0,
        height: `${(value / maxValue) * 100}%`,
        backgroundColor: color,
        zIndex,
      }}
    />
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
    ),
    0
  )

  const hasPreviousData = statistics.last12MonthPeriodAverage > 0
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
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />
        <View style={{ backgroundColor: theme.colors.outlineVariant, height: 1 }} />

        <View
          style={{
            borderColor: currentColor,
            borderStyle: 'dashed',
            borderWidth: 1,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: (statistics.this12MonthPeriodAverage / maxValue) * maxBarHeight - 2,
          }}
        />
        {hasPreviousData && (
          <View
            style={{
              borderColor: previousColor,
              borderStyle: 'dashed',
              borderWidth: 1,
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: (statistics.last12MonthPeriodAverage / maxValue) * maxBarHeight - 2,
            }}
          />
        )}
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
          const monthNumber = Months.indexOf(stat.monthName)
          const currentYear = monthNumber > dayjs().month() ? dayjs().year() - 1 : dayjs().year()

          const current12MonthPeriod = stat.years.get(currentYear) ?? {
            totalValue: 0,
            transactionCount: 0,
          }
          const previous12MonthPeriod = stat.years.get(currentYear - 1) ?? {
            totalValue: 0,
            transactionCount: 0,
          }

          return (
            <View key={stat.monthName} style={{ flex: 1 }}>
              <View style={{ flex: 1, alignSelf: 'stretch', gap: 4 }}>
                <View style={{ flex: 1 }}>
                  {hasPreviousData && (
                    <Bar
                      value={previous12MonthPeriod.totalValue}
                      maxValue={maxValue}
                      color={previousColor}
                      zIndex={
                        previous12MonthPeriod.totalValue > current12MonthPeriod.totalValue ? 0 : 1
                      }
                      location='left'
                    />
                  )}
                  <Bar
                    value={current12MonthPeriod.totalValue}
                    maxValue={maxValue}
                    color={currentColor}
                    zIndex={
                      current12MonthPeriod.totalValue > previous12MonthPeriod.totalValue ? 0 : 1
                    }
                    location={hasPreviousData ? 'right' : 'center'}
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
        style={{ position: 'absolute', top: 12 + graphContainerTopPadding, left: 12, right: 12 }}
      >
        <Text
          style={{
            position: 'absolute',
            left: 0,
            bottom: 1,
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
            fontWeight: 600,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
            backgroundColor: `${theme.colors.surfaceContainer}B0`,
          }}
        >
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
          justifyContent: 'space-evenly',
        }}
      >
        <View style={{ height: 1 }}>
          <Text
            style={{
              position: 'absolute',
              left: 0,
              bottom: 1,
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: 600,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${theme.colors.surfaceContainer}B0`,
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
              bottom: 1,
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: 600,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${theme.colors.surfaceContainer}B0`,
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
              bottom: 1,
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: 600,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${theme.colors.surfaceContainer}B0`,
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
              bottom: 1,
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: 600,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${theme.colors.surfaceContainer}B0`,
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
              bottom: 1,
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: 600,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${theme.colors.surfaceContainer}B0`,
            }}
          >
            {CurrencyUtils.format(0, info.currency)}
          </Text>
        </View>
      </View>

      {hasPreviousData && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 24,
            rowGap: 4,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: currentColor,
                borderRadius: 6,
              }}
            />
            <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
              {t('groupStats.last12Months')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{ width: 16, height: 16, backgroundColor: previousColor, borderRadius: 6 }}
            />
            <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 600 }}>
              {t('groupStats.prior12Months')}
            </Text>
          </View>
        </View>
      )}
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
  const isSmallScreen = useDisplayClass() <= DisplayClass.Small

  const currentYear = monthNumber > dayjs().month() ? dayjs().year() - 1 : dayjs().year()
  const current12MonthPeriod = stat.years.get(currentYear) ?? { totalValue: 0, transactionCount: 0 }
  const previous12MonthPeriod = stat.years.get(currentYear - 1) ?? {
    totalValue: 0,
    transactionCount: 0,
  }

  const changeMonthOverMonth =
    current12MonthPeriod.totalValue -
    (previousStat.years.get(stat.monthName === 'january' ? currentYear - 1 : currentYear)
      ?.totalValue ?? 0)
  const changeYearOverYear = current12MonthPeriod.totalValue - previous12MonthPeriod.totalValue

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
      </View>

      <View style={{ gap: 12 }}>
        <View
          style={
            !isSmallScreen && {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }
          }
        >
          <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 700 }}>
            {t('groupStats.expensesThisYear', {
              value: CurrencyUtils.format(current12MonthPeriod.totalValue, info.currency),
            })}
          </Text>

          {(changeMonthOverMonth !== 0 || !isSmallScreen) && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontSize: 17,
                  fontWeight: 700,
                  marginRight: 4,
                }}
              >
                {t('groupStats.changeMonthOverMonth')}
              </Text>
              <Icon
                name={
                  changeMonthOverMonth > 0
                    ? 'arrowUp'
                    : changeMonthOverMonth < 0
                      ? 'arrowDown'
                      : 'equal'
                }
                size={18}
                color={changeMoMColor}
              />
              <Text style={{ color: changeMoMColor, fontSize: 17, fontWeight: 700 }}>
                {CurrencyUtils.format(changeMonthOverMonth, info.currency, false)}
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            !isSmallScreen && {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }
          }
        >
          <Text style={{ color: theme.colors.outline, fontSize: 16, fontWeight: 700 }}>
            {t('groupStats.expensesInYear', {
              year: currentYear - 1,
              value: CurrencyUtils.format(previous12MonthPeriod.totalValue, info.currency),
            })}
          </Text>

          {(changeYearOverYear !== 0 || !isSmallScreen) && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: theme.colors.outline,
                  fontSize: 16,
                  fontWeight: 700,
                  marginRight: 4,
                }}
              >
                {t('groupStats.changeYearOverYear')}
              </Text>
              <Icon
                name={
                  changeYearOverYear > 0
                    ? 'arrowUp'
                    : changeYearOverYear < 0
                      ? 'arrowDown'
                      : 'equal'
                }
                size={18}
                color={changeYoYColor}
                style={{ opacity: 0.8 }}
              />
              <Text style={{ color: changeYoYColor, fontSize: 16, fontWeight: 700, opacity: 0.8 }}>
                {CurrencyUtils.format(changeYearOverYear, info.currency, false)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

function Summary({ info, stats }: { info: GroupUserInfo; stats: MonthStats[] }) {
  const reversedStats = useMemo(() => stats.toReversed(), [stats])

  return (
    <View style={{ gap: 2 }}>
      {reversedStats.map((stat, index) => {
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
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const statistics = useGroupStatistics(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupStats')}
      maxWidth={700}
      maxHeight={850}
    >
      {info && statistics && <Stats info={info} statistics={statistics} />}
      {(!info || !statistics) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
      )}
    </ModalScreen>
  )
}
