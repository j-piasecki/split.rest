import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import sharp from 'sharp'

export async function downloadProfilePicture(url: string, id: string) {
  const photo = await fetch(url)
  const buffer = await photo.arrayBuffer()
  await sharp(Buffer.from(buffer))
    .resize(128, 128)
    .toFormat('jpg', { quality: 80 })
    .toFile(`public/${id}.jpg`)
}

export async function downloadProfilePictureToBase64(url: string, id: string) {
  const photo = await fetch(url)
  const contentType = photo.headers.get('content-type')
  const buffer = await photo.arrayBuffer()

  if (!fs.existsSync(`public/${id}.jpg`)) {
    fs.writeFileSync(`public/${id}.jpg`, Buffer.from(buffer))
  }

  return 'data:' + contentType + ';base64,' + Buffer.from(buffer).toString('base64')
}

export async function deleteProfilePicture(id: string) {
  fs.unlinkSync(`public/${id}.jpg`)
}

export async function uploadProfilePictureToR2(s3Client: S3Client, bucketName: string, id: string) {
  const file = fs.readFileSync(`public/${id}.jpg`)
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `profile-pictures/${id}.jpg`,
    Body: file,
    ContentType: 'image/jpg',
  })
  await s3Client.send(uploadCommand)
}

export async function uploadGroupIconToR2(s3Client: S3Client, bucketName: string, id: string) {
  const file = fs.readFileSync(`public/groupIcon/${id}.jpg`)
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `group-icons/${id}.jpg`,
    Body: file,
    ContentType: 'image/jpg',
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
    Key: `profile-pictures/${id}.jpg`,
  })
  await s3Client.send(deleteCommand)
}
