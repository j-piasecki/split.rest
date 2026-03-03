import { getLastOpenedGroupId, getJoinRedirect, clearJoinRedirect } from '@utils/startNavigationHelper'
import { Redirect, useRouter } from 'expo-router'

let lastGroupId: string | number = 'none'

getLastOpenedGroupId().then((id) => {
  lastGroupId = id !== null ? id : 'none'
})

export default function Screen() {
  const router = useRouter()
  const join = getJoinRedirect()

  if (join) {
    router.replace(`/group/${lastGroupId}`)
    router.push(`/join/${join}`)
    clearJoinRedirect()
    return null
  }

  return <Redirect href={`/group/${lastGroupId}`} />
}