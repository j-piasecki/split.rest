import { Icon } from '@components/Icon'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { resolveFontName } from '@utils/resolveFontName'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, useWindowDimensions } from 'react-native'
import CalendarPicker from 'react-native-calendar-picker'

export function Calendar({
  initialDate,
  onDateChange,
  allowRangeSelection,
  selectedStartDate,
  selectedEndDate,
}: {
  initialDate?: number
  onDateChange?: (timestamp?: number, type?: 'START_DATE' | 'END_DATE') => void
  allowRangeSelection?: boolean
  selectedStartDate?: Date
  selectedEndDate?: Date
}) {
  const theme = useTheme()
  const containerRef = useRef<View>(null)
  const calendarRef = useRef<CalendarPicker>(null)
  const { t } = useTranslation()
  const { width: windowWidth } = useWindowDimensions()
  const [calendarWidth, setCalendarWidth] = useState(0)

  useLayoutEffect(() => {
    const size = measure(containerRef.current!)
    setCalendarWidth(Math.min(size.width, 350))
  }, [windowWidth])

  useEffect(() => {
    const date = new Date(initialDate ?? Date.now())
    setTimeout(() => {
      if (initialDate) {
        calendarRef.current?.handleOnPressDay({
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
        })
      }
    }, 100)
  }, [initialDate])

  return (
    <View ref={containerRef} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: calendarWidth }}>
        <CalendarPicker
          ref={calendarRef}
          onDateChange={(date, type) => {
            onDateChange?.(date?.getTime(), type)
          }}
          allowRangeSelection={allowRangeSelection}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          selectedRangeStyle={{ backgroundColor: theme.colors.primary }}
          // TODO: scrollable breaks first date selection
          // scrollable
          // scrollDecelarationRate={'fast'}
          initialDate={initialDate ? new Date(initialDate) : undefined}
          width={calendarWidth}
          startFromMonday
          todayBackgroundColor='transparent'
          selectedDayStyle={{ backgroundColor: theme.colors.primary }}
          selectedDayTextColor={theme.colors.onPrimary}
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
  )
}
