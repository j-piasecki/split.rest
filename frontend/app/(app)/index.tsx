import { clearJoinRedirect, getJoinRedirect } from '@utils/startNavigationHelper'
import { Redirect, useRouter } from 'expo-router'

export default function Screen() {
  const router = useRouter()
  const join = getJoinRedirect()

  if (join) {
    router.replace(`/group/none`)
    router.push(`/join/${join}`)
    clearJoinRedirect()
    return null
  }

  return <Redirect href={`/group/none`} />
}
