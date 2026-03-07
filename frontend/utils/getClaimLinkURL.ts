export function getClaimLinkURL(claimCode: string) {
  const linkText = __DEV__
    ? `http://localhost:8081/claim/${claimCode}`
    : `https://app.split.rest/claim/${claimCode}`

  return linkText
}
