const NUMBER_OF_PICTURES = 27

export function getGhostProfilePicture() {
  const pictureId = Math.floor(Math.random() * NUMBER_OF_PICTURES) + 1
  return `ghost_${pictureId}`
}
