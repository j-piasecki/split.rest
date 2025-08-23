import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { S3Client } from '@aws-sdk/client-s3'
import { Pool } from 'pg'
import sharp from 'sharp'
import { uploadGroupIconToR2 } from 'src/profilePicture'

export async function setGroupIcon(
  pool: Pool,
  s3Client: S3Client,
  bucketName: string,
  callerId: string,
  groupId: number,
  buffer: Buffer
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    const groupIconId = crypto.randomUUID()

    await client.query('UPDATE groups SET icon = $1, last_update = $2 WHERE id = $3', [
      groupIconId,
      Date.now(),
      groupId,
    ])

    await sharp(buffer)
      .resize(128, 128)
      .toFormat('jpg', { quality: 80 })
      .toFile(`public/groupIcon/${groupIconId}.jpg`)
    await uploadGroupIconToR2(s3Client, bucketName, groupIconId)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
