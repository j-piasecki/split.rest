import * as fs from 'fs'

export async function downloadProfilePicture(url: string, id: string) {
  const photo = await fetch(url)
  const buffer = await photo.arrayBuffer()
  fs.writeFileSync(`public/${id}.png`, Buffer.from(buffer))
}

export async function downloadProfilePictureToBase64(url: string, id: string) {
  const photo = await fetch(url)
  const contentType = photo.headers.get('content-type')
  const buffer = await photo.arrayBuffer()

  if (!fs.existsSync(`public/${id}.png`)) {
    fs.writeFileSync(`public/${id}.png`, Buffer.from(buffer))
  }

  return 'data:' + contentType + ';base64,' + Buffer.from(buffer).toString('base64')
}

export async function deleteProfilePicture(id: string) {
  fs.unlinkSync(`public/${id}.png`)
}
