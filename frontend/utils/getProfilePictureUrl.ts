export function getProfilePictureUrl(userId?: string) {
  if (!userId) {
    return undefined
  }

  return __DEV__
    ? `http://localhost:3000/public/${userId}.png`
    : `https://api.split.rest/public/${userId}.png`
}
