import {
  clearClaimRedirect,
  clearJoinRedirect,
  getClaimRedirect,
  getJoinRedirect,
} from '@utils/startNavigationHelper'
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

  const claim = getClaimRedirect()

  if (claim) {
    router.replace(`/group/none`)
    router.push(`/claim/${claim}`)
    clearClaimRedirect()
    return null
  }

  return <Redirect href={`/group/none`} />
}
