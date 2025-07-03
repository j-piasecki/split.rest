import { SplitQueryConfig, defaultQueryConfig } from '@utils/splitQueryConfig'
import { useEffect, useState } from 'react'

const queries = new Map<number, SplitQueryConfig>()
const queryListeners = new Map<number, ((query: SplitQueryConfig) => void)[]>()

function addListener(groupId: number, listener: (query: SplitQueryConfig) => void) {
  queryListeners.set(groupId, [...(queryListeners.get(groupId) ?? []), listener])

  if (queries.has(groupId)) {
    listener(queries.get(groupId)!)
  }
}

function removeListener(groupId: number, listener: (query: SplitQueryConfig) => void) {
  queryListeners.set(groupId, queryListeners.get(groupId)?.filter((l) => l !== listener) ?? [])
}

export function useSplitQueryConfig(groupId: number | undefined) {
  const [query, setQuery] = useState<SplitQueryConfig | undefined>(
    groupId ? queries.get(groupId) : undefined
  )

  useEffect(() => {
    if (groupId) {
      addListener(groupId, setQuery)
      return () => removeListener(groupId, setQuery)
    }
  }, [groupId])

  return query ?? defaultQueryConfig
}

export function setSplitQueryConfig(groupId: number, query: SplitQueryConfig) {
  let isSameAsDefault = true
  for (const key in query) {
    const value = query[key as keyof SplitQueryConfig]
    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue
      }
    }

    if (key === 'participantsMode' && !query.participants?.length) {
      continue
    }

    if (value !== defaultQueryConfig[key as keyof SplitQueryConfig]) {
      isSameAsDefault = false
      break
    }
  }

  const queryToSet = isSameAsDefault ? defaultQueryConfig : query
  queries.set(groupId, queryToSet)
  queryListeners.get(groupId)?.forEach((listener) => listener(queryToSet))
}

export function resetSplitQueryConfig(groupId: number) {
  queries.delete(groupId)
  queryListeners.get(groupId)?.forEach((listener) => listener(defaultQueryConfig))
}

export function getSplitQueryConfig(groupId: number) {
  return queries.get(groupId) ?? defaultQueryConfig
}
