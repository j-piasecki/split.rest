import { NotFoundException } from '../../errors/NotFoundException'
import { ImageService } from '../../image.service'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'

export async function setGroupIcon(
  pool: Pool,
  imageService: ImageService,
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

    await imageService.saveImageToFile(buffer, `public/groupIcon/${groupIconId}.jpg`)
    await imageService.uploadGroupIconToR2(groupIconId)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
