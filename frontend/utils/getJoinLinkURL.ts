import { GroupJoinLink } from 'shared'

export function getJoinLinkURL(link: GroupJoinLink | undefined | null) {
  const linkText = __DEV__
    ? `http://localhost:8081/join/${link?.uuid}`
    : `https://split.rest/join/${link?.uuid}`

  return linkText
}
