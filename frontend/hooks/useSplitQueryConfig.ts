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

export function useSplitQueryConfig(groupId: number) {
  const [query, setQuery] = useState<SplitQueryConfig | undefined>(queries.get(groupId))

  useEffect(() => {
    addListener(groupId, setQuery)
    return () => removeListener(groupId, setQuery)
  }, [groupId])

  return query ?? defaultQueryConfig
}

export function setSplitQueryConfig(groupId: number, query: SplitQueryConfig) {
  queries.set(groupId, query)
  queryListeners.get(groupId)?.forEach((listener) => listener(query))
}

export function resetSplitQueryConfig(groupId: number) {
  queries.delete(groupId)
  queryListeners.get(groupId)?.forEach((listener) => listener(defaultQueryConfig))
}

export function getSplitQueryConfig(groupId: number) {
  return queries.get(groupId) ?? defaultQueryConfig
}
