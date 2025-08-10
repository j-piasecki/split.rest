import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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

export async function uploadProfilePictureToR2(s3Client: S3Client, bucketName: string, id: string) {
  const file = fs.readFileSync(`public/${id}.png`)
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `profile-pictures/${id}.png`,
    Body: file,
    ContentType: 'image/png',
  })
  await s3Client.send(uploadCommand)
}

export async function deleteProfilePictureFromR2(
  s3Client: S3Client,
  bucketName: string,
  id: string
) {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `profile-pictures/${id}.png`,
  })
  await s3Client.send(deleteCommand)
}
