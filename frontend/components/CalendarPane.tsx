import { Icon } from '@components/Icon'
import { Pane } from '@components/Pane'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { resolveFontName } from '@utils/resolveFontName'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, useWindowDimensions } from 'react-native'
import CalendarPicker from 'react-native-calendar-picker'

export interface CalendarPaneProps {
  initialDate?: number
  onDateChange?: (timestamp: number) => void
  showDateOnHeader?: boolean
  startCollapsed?: boolean
}

export function CalendarPane({
  initialDate,
  onDateChange,
  showDateOnHeader,
  startCollapsed,
}: CalendarPaneProps) {
  const theme = useTheme()
  const containerRef = useRef<View>(null)
  const calendarRef = useRef<CalendarPicker>(null)
  const { t } = useTranslation()
  const { width: windowWidth } = useWindowDimensions()
  const [calendarWidth, setCalendarWidth] = useState(0)
  const [timestamp, setTimestamp] = useState(initialDate ?? Date.now())

  useLayoutEffect(() => {
    const size = measure(containerRef)
    setCalendarWidth(Math.min(size.width, 350))
  }, [windowWidth])

  useEffect(() => {
    const date = new Date(initialDate ?? Date.now())
    setTimeout(() => {
      calendarRef.current?.handleOnPressDay({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      })
    }, 100)
  }, [initialDate])

  return (
    <Pane
      icon='calendar'
      title={
        showDateOnHeader
          ? t('calendar.headerWithDate', { date: new Date(timestamp).toLocaleDateString() })
          : t('calendar.header')
      }
      textLocation='start'
      collapsible
      startCollapsed={startCollapsed}
      expandIcon='arrowDown'
      collapseIcon='arrowUp'
      style={{ overflow: 'hidden' }}
      containerStyle={{ padding: 16 }}
    >
      <View ref={containerRef} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: calendarWidth }}>
          {/* @ts-expect-error types are broken again */}
          <CalendarPicker
            ref={calendarRef}
            onDateChange={(date) => {
              setTimestamp(date.getTime())
              if (onDateChange) {
                onDateChange(date.getTime())
              }
            }}
            // TODO: scrollable breaks first date selection
            // scrollable
            // scrollDecelarationRate={'fast'}
            initialDate={initialDate ? new Date(initialDate) : undefined}
            width={calendarWidth}
            startFromMonday
            todayBackgroundColor='transparent'
            selectedDayStyle={{ backgroundColor: theme.colors.primary }}
            selectedDayColor={theme.colors.onPrimary}
            textStyle={{
              color: theme.colors.onSurface,
              fontFamily: resolveFontName(),
              fontSize: 16,
            }}
            customDayHeaderStyles={() => ({
              textStyle: { color: theme.colors.secondary, fontSize: 14 },
            })}
            monthTitleStyle={{ color: theme.colors.secondary }}
            yearTitleStyle={{ color: theme.colors.secondary }}
            previousComponent={<Icon name='chevronBack' size={20} color={theme.colors.secondary} />}
            nextComponent={<Icon name='chevronForward' size={20} color={theme.colors.secondary} />}
            dayLabelsWrapper={{ borderColor: theme.colors.outlineVariant, borderTopWidth: 0 }}
            weekdays={[
              t('calendar.day.monday'),
              t('calendar.day.tuesday'),
              t('calendar.day.wednesday'),
              t('calendar.day.thursday'),
              t('calendar.day.friday'),
              t('calendar.day.saturday'),
              t('calendar.day.sunday'),
            ]}
            months={[
              t('calendar.month.january'),
              t('calendar.month.february'),
              t('calendar.month.march'),
              t('calendar.month.april'),
              t('calendar.month.may'),
              t('calendar.month.june'),
              t('calendar.month.july'),
              t('calendar.month.august'),
              t('calendar.month.september'),
              t('calendar.month.october'),
              t('calendar.month.november'),
              t('calendar.month.december'),
            ]}
            selectMonthTitle={t('calendar.selectMonth')}
            selectYearTitle={t('calendar.selectYear')}
          />
        </View>
      </View>
    </Pane>
  )
}
