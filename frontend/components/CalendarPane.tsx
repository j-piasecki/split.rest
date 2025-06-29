import { Calendar } from './Calendar'
import { Pane } from '@components/Pane'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [timestamp, setTimestamp] = useState(initialDate ?? Date.now())

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
      <Calendar
        initialDate={timestamp}
        onDateChange={(timestamp) => {
          setTimestamp(timestamp)
          onDateChange?.(timestamp)
        }}
      />
    </Pane>
  )
}
