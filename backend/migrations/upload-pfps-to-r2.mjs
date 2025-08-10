import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'

const bucketName = process.env.R2_BUCKET_NAME
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const profilePictures = fs.readdirSync('public').filter((file) => file.endsWith('.png'))

for (const id of profilePictures) {
  const file = fs.readFileSync(`public/${id}`)
  console.log(`Uploading ${id} to R2`)

  if (process.argv.includes('--commit')) {
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `profile-pictures/${id}`,
      Body: file,
      ContentType: 'image/png',
    })
    await s3Client.send(uploadCommand)
  }
}
